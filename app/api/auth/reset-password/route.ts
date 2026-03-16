import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
    }

    // Verify token
    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!storedToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (new Date() > storedToken.expires) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json({ error: 'Reset token has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update User corresponding to token's email
    await prisma.user.update({
      where: { email: storedToken.email },
      data: {
        password: hashedPassword
      }
    });

    // Delete token to prevent reuse
    await prisma.passwordResetToken.delete({
      where: { token }
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
