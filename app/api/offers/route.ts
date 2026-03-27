import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get('pharmacyId');
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (pharmacyId) whereClause.pharmacyId = pharmacyId;
    if (status) whereClause.status = status;

    const offers = await prisma.offer.findMany({
      where: whereClause,
      include: {
        product: { select: { name: true, price: true, imageUrl: true } },
        pharmacy: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(offers, { status: 200 });
  } catch (error: any) {
    console.error('Fetch offers error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload || payload.role !== 'PHARMACIST' || !payload.pharmacyId) {
      return NextResponse.json({ error: 'Forbidden. Pharmacist access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, productId, discountPct, startDate, endDate, imageUrl } = body;

    if (!title || !productId || discountPct === undefined || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required offer fields' }, { status: 400 });
    }

    const newOffer = await prisma.offer.create({
      data: {
        pharmacyId: payload.pharmacyId,
        productId,
        title,
        discountPct: parseFloat(discountPct.toString()),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrl
      }
    });

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error: any) {
    console.error('Create offer error:', error);
    return NextResponse.json({ 
      error: 'Failed to create offer', 
      details: error.message 
    }, { status: 500 });
  }
}
