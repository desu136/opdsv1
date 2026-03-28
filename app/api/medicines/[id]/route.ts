import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.medicine.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    const updated = await prisma.medicine.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        genericName: body.genericName ?? existing.genericName,
        category: body.category ?? existing.category,
        description: body.description ?? existing.description,
        dosage: body.dosage ?? existing.dosage,
        sideEffects: body.sideEffects ?? existing.sideEffects,
        requiresPrescription: body.requiresPrescription !== undefined ? body.requiresPrescription : existing.requiresPrescription,
        imageUrl: body.imageUrl ?? existing.imageUrl,
        status: body.status ?? existing.status
      }
    });

    return NextResponse.json(updated, { status: 200 });

  } catch (error: any) {
    console.error('Update medicine error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    
    // Check if products are heavily linked to this medicine
    const productCount = await prisma.product.count({ where: { medicineId: id } });
    if (productCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete medicine. ${productCount} pharmacy inventory items are linked to it. Try rejecting it instead.` 
      }, { status: 400 });
    }

    await prisma.medicine.delete({ where: { id } });

    return NextResponse.json({ message: 'Medicine deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete medicine error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
