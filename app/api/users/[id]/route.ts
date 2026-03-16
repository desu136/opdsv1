import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendAccountApprovedEmail } from '@/lib/email';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, phone, status } = body;

    // Users can only update their own profile, unless Admin
    if (payload.id !== id && payload.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dataToUpdate: any = {
      name: name || undefined,
      phone: phone || undefined,
    };

    let previousStatus = null;
    let userRole = null;
    let userEmail = null;
    let userName = null;

    // Only Admins can update the status
    if (status && payload.role === 'ADMIN') {
      dataToUpdate.status = status;
      
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (existingUser) {
        previousStatus = existingUser.status;
        userRole = existingUser.role;
        userEmail = existingUser.email;
        userName = existingUser.name;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          status: true
      }
    });

    // Non-fatally send email if agent was just approved
    if (
      status === 'ACTIVE' && 
      previousStatus !== 'ACTIVE' && 
      userRole === 'DELIVERY_AGENT' && 
      userEmail
    ) {
      try {
        await sendAccountApprovedEmail(userEmail, 'DELIVERY_AGENT', userName || 'Agent');
      } catch (emailErr) {
        console.error('Approval email send failed (agent approved OK):', emailErr);
      }
    }

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
