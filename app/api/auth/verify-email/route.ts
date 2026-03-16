import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Find the token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Check expiration
    if (new Date() > verificationToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: 'Token has expired. Please register again or request a new one.' }, { status: 400 });
    }

    // Update user
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: {
        emailVerified: new Date(),
      }
    });

    // Delete the token
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({ success: true, message: 'Email verified successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
