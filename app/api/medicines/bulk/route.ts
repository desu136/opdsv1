import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { medicines } = body;

    if (!medicines || !Array.isArray(medicines)) {
      return NextResponse.json({ error: 'Invalid payload. Expected array of medicines.' }, { status: 400 });
    }

    // Process valid rows
    let successCount = 0;
    let failCount = 0;
    
    // We do sequential creation to catch unique constraint errors easily and allow partial success
    // createMany skipDuplicates is an option but we want accurate counts and maybe specific error handling
    // For large scale, Promise.all with chunks or createMany is better. Let's use createMany with skipDuplicates.
    
    try {
      const result = await prisma.medicine.createMany({
        data: medicines.map(m => ({
          name: m.name,
          genericName: m.genericName || null,
          category: m.category,
          description: m.description || null,
          dosage: m.dosage || null,
          sideEffects: m.sideEffects || null,
          requiresPrescription: Boolean(m.requiresPrescription),
          imageUrl: m.imageUrl || null,
          status: 'APPROVED'
        })),
        skipDuplicates: true
      });
      successCount = result.count;
      failCount = medicines.length - successCount;
    } catch (dbErr) {
      console.error('Bulk insert DB error:', dbErr);
      return NextResponse.json({ error: 'Database bulk insert failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Bulk upload completed',
      success: successCount,
      failed: failCount,
      total: medicines.length
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process bulk upload', 
      details: error.message
    }, { status: 500 });
  }
}
