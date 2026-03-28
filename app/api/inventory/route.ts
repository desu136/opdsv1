import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get('pharmacyId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (pharmacyId) whereClause.pharmacyId = pharmacyId;
    
    // Filter by medicine properties
    if (category || search) {
      whereClause.medicine = {};
      if (category) whereClause.medicine.category = category;
      if (search) whereClause.medicine.name = { contains: search };
    }

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let payload: any = null;
    try {
      if (token) payload = verifyToken(token);
    } catch (e) {}

    // Enforce APPROVED only, unless it's a pharmacist checking their own inventory
    if (!(payload?.role === 'PHARMACIST' && payload.pharmacyId && payload.pharmacyId === pharmacyId)) {
      whereClause.medicine = { ...whereClause.medicine, status: 'APPROVED' };
    }

    let products = await prisma.product.findMany({
      where: whereClause,
      include: {
        medicine: true,
        pharmacy: { select: { name: true, id: true, lat: true, lng: true } },
        offers: {
          where: {
            status: 'ACTIVE',
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      products = products.map((product: any) => {
        const p = product.pharmacy;
        if (p.lat === null || p.lng === null) {
          return { ...product, pharmacy: { ...p, distance: null } };
        }

        const R = 6371; // km
        const dLat = (p.lat - userLat) * Math.PI / 180;
        const dLon = (p.lng - userLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLat * Math.PI / 180) * Math.cos(p.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        
        return { ...product, pharmacy: { ...p, distance: parseFloat(d.toFixed(1)) } };
      });
    }

    return NextResponse.json(products, { status: 200 });

  } catch (error: any) {
    console.error('Fetch inventory error:', error);
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
    const { medicineId, price, stock } = body;

    if (!medicineId || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Missing required inventory fields' }, { status: 400 });
    }

    // Check if the pharmacy already has this medicine in their inventory
    const existingProduct = await prisma.product.findFirst({
      where: {
        pharmacyId: payload.pharmacyId,
        medicineId: medicineId
      }
    });

    if (existingProduct) {
      return NextResponse.json({ error: 'This medicine is already in your inventory. Please update the existing entry.' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        pharmacyId: payload.pharmacyId,
        medicineId,
        price: parseFloat(price.toString()),
        stock: parseInt(stock.toString(), 10),
      },
      include: {
        medicine: true
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ 
      error: 'Failed to create product', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
