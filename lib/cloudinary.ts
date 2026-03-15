import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(fileUri: string, folder: string = 'pharmacy') {
  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: folder,
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

export default cloudinary;
