import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const payload = token ? verifyToken(token) as any : null;
    const isAdmin = payload?.role === 'ADMIN';

    let whereClause: any = {};

    if (isAdmin) {
      if (status) whereClause.status = status;
      // If no status, Admin sees all
    } else {
      // Non-admins only see ACTIVE pharmacies
      whereClause.status = 'ACTIVE';
    }

    const pharmacies = await prisma.pharmacy.findMany({
      where: whereClause,
      include: {
        owner: {
           select: { name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(pharmacies, { status: 200 });

  } catch (error) {
    console.error('Fetch pharmacies error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
