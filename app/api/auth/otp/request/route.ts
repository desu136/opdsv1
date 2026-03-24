import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // In a real application, you would integrate with an SMS gateway (e.g., Twilio, Chapa, local telecom API)
    // For this prototype, we generate a random 6-digit OTP and print it to the console.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the OTP in the VerificationToken table (reusing it for OTPs)
    // The identifier will be the phone number
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Clean up old tokens for this phone
    await prisma.verificationToken.deleteMany({
      where: { identifier: phone }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: phone,
        token: otp, // Storing plain text for prototype, should hash in prod
        expires
      }
    });

    // MOCK SMS SENDING
    console.log(`\n=========================================`);
    console.log(`📱 MOCK SMS TO: ${phone}`);
    console.log(`🔑 YOUR OTP IS: ${otp}`);
    console.log(`=========================================\n`);

    return NextResponse.json({ 
      message: 'OTP sent successfully. Check your console for the code.' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('OTP Request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
