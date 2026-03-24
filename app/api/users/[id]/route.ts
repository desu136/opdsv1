import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notifications';

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
    // Extract fields that are allowed to be updated
    const { name, email, phone, status, image, pharmacyId, isNewUser, lastLat, lastLng } = body;

    // Users can only update their own profile, unless Admin
    if (payload.id !== id && payload.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (status !== undefined) dataToUpdate.status = status;
    if (image !== undefined) dataToUpdate.image = image;
    if (pharmacyId !== undefined) dataToUpdate.pharmacyId = pharmacyId;
    if (isNewUser !== undefined) dataToUpdate.isNewUser = isNewUser;
    if (lastLat !== undefined) dataToUpdate.lastLat = lastLat;
    if (lastLng !== undefined) dataToUpdate.lastLng = lastLng;

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

    // Unified Notification (In-App + Email) if agent was just approved
    if (
      status === 'ACTIVE' && 
      previousStatus !== 'ACTIVE' && 
      userRole === 'DELIVERY_AGENT'
    ) {
      await sendNotification({
        userId: id,
        title: 'Account Approved! 🎉',
        message: `Hello ${userName || 'Agent'}, your delivery agent account has been approved. You can now start fulfilling deliveries.`,
        type: 'SYSTEM'
      });
    }

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
