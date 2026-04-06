const db = require('./db');

async function migrate() {
  try {
    console.log('Migrating claims table...');
    await db.query('ALTER TABLE claims ADD COLUMN IF NOT EXISTS photo_url TEXT');
    console.log('✅ Migration successful: photo_url column added to claims table.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
