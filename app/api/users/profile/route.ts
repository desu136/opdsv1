import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (payload as any).id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email, image } = body;

    // Validate inputs
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if email is already taken by another user (if they are changing it)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { 
          email: email,
          id: { not: (payload as any).id }
        }
      });
      if (existingEmail) {
        return NextResponse.json({ error: 'Email is already in use by another account' }, { status: 400 });
      }
    }

    // Check if phone is already taken by another user
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: phone,
          id: { not: (payload as any).id }
        }
      });
      if (existingPhone) {
        return NextResponse.json({ error: 'Phone number is already in use by another account' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: (payload as any).id },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        image: image || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
