import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
    
    const payload = verifyToken(token) as any;
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Find the latest order that isn't completed or cancelled
    const latestOrder = await prisma.order.findFirst({
      where: {
        customerId: payload.id,
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      },
      include: {
        delivery: true,
        pharmacy: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!latestOrder) {
      return NextResponse.json({ authenticated: true, hasActiveOrder: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      hasActiveOrder: true,
      order: {
        id: latestOrder.id,
        status: latestOrder.status,
        shippingAddress: latestOrder.shippingAddress,
        pharmacyName: latestOrder.pharmacy.name,
        updatedAt: latestOrder.createdAt, // Or a specific status update time if we had one
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch latest order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
