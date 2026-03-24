import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and OTP code are required' }, { status: 400 });
    }

    // 1. Verify OTP
    const storedToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: phone,
        token: code,
      }
    });

    if (!storedToken) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    if (new Date() > storedToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { id: storedToken.id } });
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Valid OTP, delete it so it can't be used again
    await prisma.verificationToken.delete({ where: { id: storedToken.id } });

    // 2. Find or Create User
    let user = await prisma.user.findUnique({
      where: { phone },
      include: { pharmacy: true }
    });

    if (!user) {
      // Create new customer
      user = await prisma.user.create({
        data: {
          phone,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          isNewUser: true, // Needs name collection
        },
        include: { pharmacy: true }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Failed to find or create user' }, { status: 500 });
    }

    // 3. Generate JWT Token
    const token = signToken({ 
      id: user.id, 
      role: user.role,
      pharmacyId: user.pharmacy?.id 
    });

    // 4. Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Return user info (without sensitive data)
    const { password: _, ...userWithoutSensitive } = user;
    return NextResponse.json({ 
      user: userWithoutSensitive,
      isNewUser: user.isNewUser 
    }, { status: 200 });

  } catch (error: any) {
    console.error('OTP Verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
