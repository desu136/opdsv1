import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const creatorId = searchParams.get('creatorId');

    let whereClause: any = {};
    
    // Default to only return APPROVED, unless explicitly overriding 
    // (e.g., specific status asked, or a pharmacist asking for all their submissions)
    if (creatorId) {
      whereClause.creatorId = creatorId;
      if (status) whereClause.status = status;
    } else {
      whereClause.status = status || 'APPROVED';
    }

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { genericName: { contains: search } }
      ];
    }

    if (pageParam) {
      const page = parseInt(pageParam, 10) || 1;
      const limit = parseInt(limitParam || '20', 10);
      const total = await prisma.medicine.count({ where: whereClause });
      
      const medicines = await prisma.medicine.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        data: medicines,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
      }, { status: 200 });
    } else {
      const medicines = await prisma.medicine.findMany({
        where: whereClause,
        take: 20, // Limit results for performance in dropdowns
        orderBy: { name: 'asc' }
      });

      return NextResponse.json(medicines, { status: 200 });
    }

  } catch (error: any) {
    console.error('Fetch medicines error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload || !['PHARMACIST', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden. Access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, genericName, category, description, dosage, sideEffects, requiresPrescription, imageUrl } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Missing required medicine fields (name, category)' }, { status: 400 });
    }

    // Check if medicine already exists to prevent duplicates
    const existing = await prisma.medicine.findFirst({
      where: { name: name }
    });

    if (existing) {
      return NextResponse.json({ error: 'A medicine with this exact name already exists in the catalog.' }, { status: 400 });
    }

    const newMedicine = await prisma.medicine.create({
      data: {
        name,
        genericName,
        category,
        description,
        dosage,
        sideEffects,
        requiresPrescription: Boolean(requiresPrescription),
        imageUrl,
        status: payload.role === 'ADMIN' ? 'APPROVED' : 'PENDING_APPROVAL',
        creatorId: payload.userId
      }
    });

    return NextResponse.json(newMedicine, { status: 201 });
  } catch (error: any) {
    console.error('Create medicine error:', error);
    return NextResponse.json({ 
      error: 'Failed to create medicine', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
