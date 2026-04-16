const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config();

async function diagnose() {
  console.log('--- LIVESTOX CARE SYSTEM DIAGNOSTICS ---');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Is Render:', !!process.env.RENDER);
  console.log('CWD:', process.cwd());
  
  console.log('\n--- STORAGE CONFIGURATION ---');
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  console.log('Cloudinary Cloud Name:', cloudName || 'MISSING');
  console.log('Cloudinary API Key:', apiKey ? 'SET (Masked)' : 'MISSING');
  console.log('Cloudinary API Secret:', apiSecret ? 'SET (Masked)' : 'MISSING');
  
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    
    try {
      console.log('Testing Cloudinary connection...');
      const ping = await cloudinary.api.ping();
      console.log('✅ Cloudinary Ping Successful:', ping);
    } catch (err) {
      console.error('❌ Cloudinary Connection Failed:', err.message);
    }
  } else {
    console.error('❌ Cloudinary credentials are not fully set.');
  }
  
  console.log('\n--- DIRECTORY PERMISSIONS ---');
  const uploadsDir = path.join(__dirname, 'uploads');
  console.log('Target Uploads Dir:', uploadsDir);
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      console.log('Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const testFile = path.join(uploadsDir, '.diag-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Local uploads directory is WRITABLE');
  } catch (err) {
    console.error('❌ Local uploads directory test FAILED:', err.message);
  }
  
  console.log('\n--- SUMMARY ---');
  if (process.env.RENDER) {
    console.log('⚠️  CRITICAL: You are running on Render. Cloudinary MUST be working for persistent storage.');
  }
  
  console.log('----------------------------------------');
}

diagnose();
