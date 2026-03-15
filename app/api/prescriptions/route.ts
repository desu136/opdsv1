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
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = payload.role;
    let whereClause: any = {};

    if (role === 'CUSTOMER') {
      whereClause.order = { customerId: payload.id };
    } else if (role === 'PHARMACIST') {
      whereClause.order = { pharmacyId: payload.pharmacyId };
    } else if (role === 'ADMIN') {
      // Sees all
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
            status: true,
            customer: { select: { name: true } },
            pharmacy: { select: { name: true } }
          }
        }
      },
      orderBy: { id: 'desc' } // No createdAt on Prescription, using id or order.createdAt
    });

    return NextResponse.json(prescriptions, { status: 200 });

  } catch (error) {
    console.error('Fetch prescriptions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
