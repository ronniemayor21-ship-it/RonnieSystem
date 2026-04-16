const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Support both DATABASE_URL (Render) and individual env vars (local)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

let isConnected = false;

// Test connection with descriptive logging
pool.connect((err, client, release) => {
  if (err) {
    console.error('\n❌ DATABASE CONNECTION ERROR:', err.message);
    if (process.env.DATABASE_URL) {
      console.error('   Using DATABASE_URL from environment.');
      if (err.message.includes('no pg_hba.conf entry')) {
        console.error('   👉 ACTION REQUIRED: On Render, you must "Allow your current IP" in your database settings for local connections to work.\n');
      }
    } else {
      console.error('   👉 ACTION REQUIRED: No DATABASE_URL found. Please add your Render URL to your .env file.\n');
    }
    return;
  }
  isConnected = true;
  console.log('✅ Successfully connected to PostgreSQL Database');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getIsConnected: () => isConnected,
};
