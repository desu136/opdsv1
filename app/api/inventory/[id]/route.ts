import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        medicine: {
          include: {
            reviews: {
              include: { user: { select: { name: true } } },
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        },
        pharmacy: {
          select: { id: true, name: true, address: true, averageRating: true, reviewCount: true }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Fetch product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function checkAccess(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  const payload = verifyToken(token) as any;
  if (!payload || payload.role !== 'PHARMACIST' || !payload.pharmacyId) return null;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.pharmacyId !== payload.pharmacyId) return null;

  return product;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorizedProduct = await checkAccess(id);
    if (!authorizedProduct) return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });

    const body = await request.json();
    const updated = await prisma.product.update({
      where: { id },
      data: {
        price: body.price !== undefined ? parseFloat(body.price) : authorizedProduct.price,
        stock: body.stock !== undefined ? parseInt(body.stock, 10) : authorizedProduct.stock,
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorizedProduct = await checkAccess(id);
    if (!authorizedProduct) return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete inventory error:', error);
    if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
       return NextResponse.json({ error: 'Cannot delete product currently in orders' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
