import { v2 as cloudinary } from 'cloudinary';

/**
 * Server routes should prefer non-public env vars (CLOUDINARY_*) so secrets are not exposed to the browser.
 * Client/build may still use NEXT_PUBLIC_* / EXPO_PUBLIC_* where needed.
 */
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY ||
    process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_API_SECRET ||
    process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
