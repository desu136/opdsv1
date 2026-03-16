import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notifications';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true, email: true, phone: true } },
        inventory: { where: { stock: { gt: 0 } }, take: 5 } // Preview top items
      }
    });

    if (!pharmacy) {
      return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 });
    }

    return NextResponse.json(pharmacy, { status: 200 });
  } catch (error) {
    console.error('Fetch pharmacy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { status, name, address, phone, email } = body;

    // Check permissions
    if (payload.role === 'ADMIN') {
      // Admin update (typically for status)
      const data: any = {};
      if (status) data.status = status;
      if (name) data.name = name;

      // Also update the associated user's status if status is provided
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { id },
        select: { ownerId: true }
      });

      if (!pharmacy) {
        return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 });
      }

      const updatedPharmacy = await prisma.$transaction(async (tx) => {
        const updated = await tx.pharmacy.update({
          where: { id },
          data
        });

        if (status) {
          await tx.user.update({
             where: { id: pharmacy.ownerId },
             data: { status }
          });
        }
        return updated;
      });

      // Unified Notification (In-App + Email) if just approved
      if (status === 'ACTIVE') {
        await sendNotification({
          userId: pharmacy.ownerId,
          title: 'Pharmacy Approved! 🎉',
          message: 'Your pharmacy profile has been approved. You can now manage your inventory and receive orders.',
          type: 'SYSTEM'
        });
      }

      return NextResponse.json(updatedPharmacy, { status: 200 });
    } 
    
    if (payload.role === 'PHARMACIST') {
      // Pharmacist update own profile
      if (payload.pharmacyId !== id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updatedPharmacy = await prisma.pharmacy.update({
        where: { id },
        data: {
          name: name || undefined,
          address: address || undefined,
          phone: phone || undefined,
          email: email || undefined,
        }
      });
      return NextResponse.json(updatedPharmacy, { status: 200 });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Update pharmacy status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
