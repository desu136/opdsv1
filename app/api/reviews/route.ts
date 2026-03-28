import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Customer access required to submit reviews.' }, { status: 403 });
    }

    const { rating, comment, productId, medicineId: initialMedicineId, pharmacyId } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    
    let medicineId = initialMedicineId;

    // Resolve medicineId from productId if not provided directly
    if (productId && !medicineId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { medicineId: true }
      });
      if (product) medicineId = product.medicineId;
    }

    if (!medicineId && !pharmacyId) {
      return NextResponse.json({ error: 'Must provide medicineId (or productId) or pharmacyId' }, { status: 400 });
    }

    // Create review and update averages in a single transaction
    const review = await prisma.$transaction(async (tx) => {
      
      const newReview = await tx.review.create({
        data: {
          userId: payload.id,
          medicineId: medicineId || null,
          pharmacyId: pharmacyId || null,
          rating,
          comment
        }
      });

      // Update Medicine averages if applicable
      if (medicineId) {
        const stats = await tx.review.aggregate({
          where: { medicineId },
          _avg: { rating: true },
          _count: { rating: true }
        });
        
        await tx.medicine.update({
          where: { id: medicineId },
          data: {
            averageRating: stats._avg.rating || rating,
            reviewCount: stats._count.rating || 1
          }
        });
      }

      // Update Pharmacy averages if applicable
      if (pharmacyId) {
        const stats = await tx.review.aggregate({
          where: { pharmacyId },
          _avg: { rating: true },
          _count: { rating: true }
        });
        
        await tx.pharmacy.update({
          where: { id: pharmacyId },
          data: {
            averageRating: stats._avg.rating || rating,
            reviewCount: stats._count.rating || 1
          }
        });
      }

      return newReview;
    });

    return NextResponse.json(review, { status: 201 });

  } catch (error: any) {
    console.error('Review creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
