import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // We do not want to reveal if a user exists or not for security reasons.
    if (!user) {
      return NextResponse.json({ success: true, message: 'If an account matches, a reset link was sent.' }, { status: 200 });
    }

    // Delete existing tokens for this user to prevent spam/confusion
    await prisma.passwordResetToken.deleteMany({
      where: { email }
    });

    // Generate token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); 

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      }
    });

    // Send the email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ success: true, message: 'If an account matches, a reset link was sent.' }, { status: 200 });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
