import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [userCount, pharmacyCount, orderStats] = await Promise.all([
      prisma.user.count(),
      prisma.pharmacy.count({ where: { status: 'ACTIVE' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED' }
      })
    ]);

    // Get today's revenue (ETB)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: todayStart }
      }
    });

    return NextResponse.json({
      totalUsers: userCount,
      activePharmacies: pharmacyCount,
      totalRevenue: orderStats._sum.totalAmount || 0,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      flaggedIssues: 0, // Mock for now
    }, { status: 200 });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
