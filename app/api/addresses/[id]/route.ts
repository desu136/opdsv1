import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as any;
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const address = await prisma.address.findUnique({
      where: { id: id }
    });

    if (!address || address.userId !== payload.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Address deleted' }, { status: 200 });

  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as any;
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { city, subCity, street, isDefault } = await request.json();

    const existingAddress = await prisma.address.findUnique({
      where: { id: id }
    });

    if (!existingAddress || existingAddress.userId !== payload.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: payload.id },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.address.update({
      where: { id: id },
      data: { city, subCity, street, isDefault }
    });

    return NextResponse.json(updated, { status: 200 });

  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
