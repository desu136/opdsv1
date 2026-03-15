import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'pharmacy';

    // Allow anonymous uploads for registration documents (licenses)
    // and potentially prescriptions (if checkout happens during a guest flow, 
    // though here we usually have a user, it's safer to allow it if the folder matches)
    const isPublicFolder = ['licenses', 'prescriptions'].includes(folder);

    if (!isPublicFolder) {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await uploadImage(base64Image, folder);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Cloudinary upload API error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
