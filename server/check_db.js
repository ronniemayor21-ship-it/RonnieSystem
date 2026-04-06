const db = require('./db');

async function checkFarmers() {
  try {
    const result = await db.query('SELECT * FROM farmers');
    console.log('Total Farmers:', result.rows.length);
    console.log('Farmers:', JSON.stringify(result.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkFarmers();
