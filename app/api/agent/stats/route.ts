import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload || payload.role !== 'DELIVERY_AGENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [completedDeliveries, earnings] = await Promise.all([
      prisma.delivery.count({
        where: { agentId: payload.id, status: 'DELIVERED' }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          delivery: { agentId: payload.id, status: 'DELIVERED' },
          status: 'COMPLETED'
        }
      })
    ]);

    // Calculate approx earnings (e.g. 50 ETB per delivery) - or use real data if we had individual payout
    // For now we use the sum of totalAmount which might be wrong for agent pay, but let's assume they get a flat fee
    // or we use the delivery fee (which we mock at 50 in orders/route.ts)
    const flatFeePerOrder = 50;
    const totalEarnings = completedDeliveries * flatFeePerOrder;

    return NextResponse.json({
      completedCount: completedDeliveries,
      earnings: totalEarnings,
    }, { status: 200 });

  } catch (error) {
    console.error('Agent stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
