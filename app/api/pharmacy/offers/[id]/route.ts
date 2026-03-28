import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = verifyToken(token) as any;
    if (!user || user.role !== 'PHARMACIST' || !user.pharmacyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, title, discountPct, startDate, endDate, imageUrl } = body;

    // Verify ownership
    const existingOffer = await prisma.offer.findUnique({ where: { id } });
    if (!existingOffer || existingOffer.pharmacyId !== user.pharmacyId) {
       return NextResponse.json({ error: 'Offer not found or unauthorized' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (discountPct !== undefined) updateData.discountPct = discountPct;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (imageUrl) updateData.imageUrl = imageUrl;

    const offer = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Offer PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = verifyToken(token) as any;
    if (!user || user.role !== 'PHARMACIST' || !user.pharmacyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const existingOffer = await prisma.offer.findUnique({ where: { id } });
    if (!existingOffer || existingOffer.pharmacyId !== user.pharmacyId) {
       return NextResponse.json({ error: 'Offer not found or unauthorized' }, { status: 404 });
    }

    await prisma.offer.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Offer DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
