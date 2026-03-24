import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
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
    } else {
      whereClause.status = 'ACTIVE';
    }

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const limit = searchParams.get('limit');

    let pharmacies = await prisma.pharmacy.findMany({
      where: whereClause,
      include: {
        owner: { select: { name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (lat && lng && !isAdmin) {
      // Haversine implementation
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      pharmacies = pharmacies.map((pharmacy: any) => {
        if (pharmacy.lat === null || pharmacy.lng === null) {
          return { ...pharmacy, distance: null };
        }

        const R = 6371; // km
        const dLat = (pharmacy.lat - userLat) * Math.PI / 180;
        const dLon = (pharmacy.lng - userLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLat * Math.PI / 180) * Math.cos(pharmacy.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c;
        
        return { ...pharmacy, distance: parseFloat(d.toFixed(1)) };
      }).sort((a: any, b: any) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    if (limit) {
      pharmacies = pharmacies.slice(0, parseInt(limit));
    }

    return NextResponse.json(pharmacies, { status: 200 });

  } catch (error) {
    console.error('Fetch pharmacies error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
