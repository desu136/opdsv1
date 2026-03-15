import { NextResponse } from 'next/server';
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
    if (category) whereClause.category = category;
    if (search) {
      whereClause.name = { contains: search };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        pharmacy: { select: { name: true, id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

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
    const { name, category, description, price, stock, requiresPrescription, imageUrl } = body;

    if (!name || !category || price === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        pharmacyId: payload.pharmacyId,
        name,
        category,
        description,
        price: parseFloat(price.toString()),
        stock: parseInt(stock.toString(), 10),
        requiresPrescription: Boolean(requiresPrescription),
        imageUrl
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
