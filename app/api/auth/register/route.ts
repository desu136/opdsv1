import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

async function generateAndSendVerification(email: string) {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Remove any old unused tokens for this email first
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires }
    });

    await sendVerificationEmail(email, token);
  } catch (emailError) {
    // Non-fatal: log the error but don't fail registration
    console.error('Email verification send failed (user was still created):', emailError);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, email, password, phone } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    if (role === 'CUSTOMER') {
      const { firstName, lastName } = body;
      const user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          password: hashedPassword,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        }
      });
      await generateAndSendVerification(email);
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword, { status: 201 });
    } 
    
    else if (role === 'PHARMACIST') {
      const { pharmacyName, licenseNumber, licenseDocumentUrl } = body;
      // Create user and linked pharmacy profile
      const user = await prisma.user.create({
        data: {
          name: `${pharmacyName} Admin`,
          email,
          phone,
          password: hashedPassword,
          role: 'PHARMACIST',
          pharmacy: {
            create: {
              name: pharmacyName,
              email,
              phone: phone || '',
              licenseNumber,
              licenseDocumentUrl,
              status: 'PENDING_REVIEW',
            }
          }
        },
        include: {
          pharmacy: true
        }
      });
      
      await generateAndSendVerification(email);
      
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword, { status: 201 });
    }
    
    else if (role === 'DELIVERY_AGENT') {
      const { firstName, lastName } = body;
      const user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          password: hashedPassword,
          role: 'DELIVERY_AGENT',
        }
      });
      await generateAndSendVerification(email);
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message || String(error) }, { status: 500 });
  }
}
