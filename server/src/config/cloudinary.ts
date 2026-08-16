import { v2 as cloudinary } from 'cloudinary';
import { env, isCloudinaryConfigured } from './env';

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured');
} else {
  console.warn('Cloudinary not configured — using local file uploads');
}

export { cloudinary, isCloudinaryConfigured };
