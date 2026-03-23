import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { ValidationError } from '../utils/errors.js';

if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(fileBuffer: Buffer, folder = 'ceramic/products'): Promise<{ url: string; publicId: string }> {
  if (!env.CLOUDINARY_CLOUD_NAME) throw new ValidationError('Cloudinary not configured');

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp', quality: 'auto' },
      (error, result) => {
        if (error || !result) return reject(new ValidationError('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    ).end(fileBuffer);
  });
}
