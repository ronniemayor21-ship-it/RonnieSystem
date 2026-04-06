const db = require('./db');

const schema = `
  CREATE TABLE IF NOT EXISTS farmers (
    id         VARCHAR(20) PRIMARY KEY,
    name       TEXT NOT NULL,
    username   TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    mobile     TEXT,
    address    TEXT,
    district   TEXT,
    status     TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS applications (
    id                  VARCHAR(20) PRIMARY KEY,
    farmer_id           VARCHAR(20) REFERENCES farmers(id) ON DELETE SET NULL,
    name                TEXT,
    type                TEXT NOT NULL,
    mobile              TEXT,
    address             TEXT,
    district            TEXT,
    value               NUMERIC,
    start_date          DATE,
    end_date            DATE,
    status              TEXT DEFAULT 'Pending',
    photo_url           TEXT,
    ownership_proof_url TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS claims (
    id             VARCHAR(20) PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id) ON DELETE SET NULL,
    farmer_id      VARCHAR(20) REFERENCES farmers(id) ON DELETE SET NULL,
    farmer_name    TEXT,
    animal_type    TEXT,
    reason         TEXT,
    status         TEXT DEFAULT 'Pending',
    created_at     TIMESTAMPTZ DEFAULT NOW()
  );
`;

async function runSchema() {
  try {
    console.log('Running schema setup...');
    await db.query(schema);
    console.log('✅ Tables created/verified successfully!');
  } catch (err) {
    console.error('❌ Error executing schema:', err);
    throw err;
  }
}

module.exports = runSchema;

