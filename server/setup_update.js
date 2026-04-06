const db = require('./db');

async function updateSchema() {
  try {
    console.log('Updating applications table schema...');
    await db.query(`
      ALTER TABLE public.applications 
      ADD COLUMN IF NOT EXISTS photo_url TEXT,
      ADD COLUMN IF NOT EXISTS ownership_proof_url TEXT;
    `);
    console.log('Schema updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating schema:', err);
    process.exit(1);
  }
}

updateSchema();
