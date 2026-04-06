const path = require('path');
const fs = require('fs');

const __dirname = 'C:\\Users\\suhnr\\OneDrive\\Desktop\\saas\\livestox-care-main\\server';
const uploadsDir = path.join(__dirname, 'uploads');

console.log('Testing directory logic...');
console.log('__dirname:', __dirname);
console.log('Target Uploads Dir:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
    console.log('Directory does not exist. Creating it...');
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (fs.existsSync(uploadsDir)) {
    console.log('✅ Directory exists/was created successfully.');
} else {
    console.log('❌ Failed to create directory.');
}
