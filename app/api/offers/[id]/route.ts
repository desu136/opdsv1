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
    if (!payload || payload.role !== 'PHARMACIST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, discountPct, startDate, endDate, imageUrl, status } = body;

    // Verify ownership
    const existingOffer = await prisma.offer.findUnique({
      where: { id }
    });

    if (!existingOffer || existingOffer.pharmacyId !== payload.pharmacyId) {
      return NextResponse.json({ error: 'Unauthorized to modify this offer' }, { status: 403 });
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        title: title || undefined,
        discountPct: discountPct !== undefined ? parseFloat(discountPct.toString()) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        imageUrl: imageUrl || undefined,
        status: status || undefined
      }
    });

    return NextResponse.json(updatedOffer, { status: 200 });
  } catch (error: any) {
    console.error('Update offer error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
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
    if (!payload || payload.role !== 'PHARMACIST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    
    // Verify ownership
    const existingOffer = await prisma.offer.findUnique({
      where: { id }
    });

    if (!existingOffer || existingOffer.pharmacyId !== payload.pharmacyId) {
      return NextResponse.json({ error: 'Unauthorized to delete this offer' }, { status: 403 });
    }

    await prisma.offer.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Offer deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete offer error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
