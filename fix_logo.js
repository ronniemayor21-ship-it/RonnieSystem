const fs = require('fs');
const path = require('path');

const oldPath = path.join(__dirname, 'src', 'assets', 'logo_backup.png');
const newPath = path.join(__dirname, 'src', 'assets', 'logo.png');

if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath);
  console.log('Successfully renamed logo_backup.png to logo.png');
} else {
  console.log('logo_backup.png not found at', oldPath);
  // Try logo_old.png as fallback
  const fallbackPath = path.join(__dirname, 'src', 'assets', 'logo_old.png');
  if (fs.existsSync(fallbackPath)) {
    fs.renameSync(fallbackPath, newPath);
    console.log('Successfully renamed logo_old.png to logo.png');
  } else {
    console.log('No logo files found in src/assets');
  }
}
