import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const verifyCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();

  if (!cloud_name || !api_key || !api_secret) {
    console.error('❌ Cloudinary configuration missing!');
    console.error('Please check your environment variables:');
    console.error('- CLOUDINARY_CLOUD_NAME');
    console.error('- CLOUDINARY_API_KEY');
    console.error('- CLOUDINARY_API_SECRET');
  } else {
    console.log('✅ Cloudinary configured successfully');
  }
};

verifyCloudinaryConfig();

export default cloudinary;
