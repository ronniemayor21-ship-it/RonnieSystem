const db = require('./db');

async function checkData() {
  try {
    console.log('--- Applications ---');
    const apps = await db.query('SELECT id, name, photo_url, ownership_proof_url FROM applications LIMIT 10');
    console.table(apps.rows);

    console.log('\n--- Claims ---');
    const claims = await db.query('SELECT id, farmer_name, photo_url FROM claims LIMIT 10');
    console.table(claims.rows);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
