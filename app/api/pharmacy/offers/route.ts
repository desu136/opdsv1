import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = verifyToken(token) as any;
    if (!user || user.role !== 'PHARMACIST' || !user.pharmacyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause: any = { pharmacyId: user.pharmacyId };
    if (status) {
       whereClause.status = status;
    }

    const offers = await prisma.offer.findMany({
      where: whereClause,
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Offers GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = verifyToken(token) as any;
    if (!user || user.role !== 'PHARMACIST' || !user.pharmacyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, discountPct, startDate, endDate, imageUrl, type, productId } = body;

    // Validation
    if (!title || discountPct === undefined || !startDate || !endDate || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (discountPct < 1 || discountPct > 100) {
      return NextResponse.json({ error: 'Discount must be between 1 and 100' }, { status: 400 });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    if (type === 'MEDICINE' && !productId) {
      return NextResponse.json({ error: 'Medicine selection is required for Medicine-based promotions' }, { status: 400 });
    }

    const newOffer = await prisma.offer.create({
      data: {
        pharmacyId: user.pharmacyId,
        productId: type === 'MEDICINE' ? productId : null,
        title,
        discountPct,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrl,
        status: 'ACTIVE'
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(newOffer, { status: 201 });

  } catch (error) {
    console.error('Offers POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
