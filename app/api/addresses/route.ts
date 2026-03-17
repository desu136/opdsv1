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
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const addresses = await prisma.address.findMany({
      where: { userId: payload.id },
      orderBy: { isDefault: 'desc' }
    });

    return NextResponse.json(addresses, { status: 200 });

  } catch (error) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token) as any;
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { city, subCity, street, isDefault } = await request.json();

    if (!city || !subCity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If setting as default, unset others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: payload.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: payload.id,
        city,
        subCity,
        street,
        isDefault: !!isDefault
      }
    });

    return NextResponse.json(address, { status: 201 });

  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
