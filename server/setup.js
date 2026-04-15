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
    dob        DATE,
    gender     TEXT,
    civil_status TEXT,
    status     TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Migration: Add new columns to farmers if they don't exist
  DO $$ 
  BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farmers' AND column_name='dob') THEN
      ALTER TABLE farmers ADD COLUMN dob DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farmers' AND column_name='gender') THEN
      ALTER TABLE farmers ADD COLUMN gender TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farmers' AND column_name='civil_status') THEN
      ALTER TABLE farmers ADD COLUMN civil_status TEXT;
    END IF;
  END $$;

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
    purpose             TEXT,
    breed               TEXT,
    sex                 TEXT,
    age                 TEXT,
    status              TEXT DEFAULT 'Pending',
    photo_url           TEXT,
    ownership_proof_url TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
  );

  -- Migration: Add new columns if they don't exist (for existing databases)
  DO $$ 
  BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='purpose') THEN
      ALTER TABLE applications ADD COLUMN purpose TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='breed') THEN
      ALTER TABLE applications ADD COLUMN breed TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='sex') THEN
      ALTER TABLE applications ADD COLUMN sex TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='age') THEN
      ALTER TABLE applications ADD COLUMN age TEXT;
    END IF;
  END $$;

  CREATE TABLE IF NOT EXISTS claims (
    id             VARCHAR(20) PRIMARY KEY,
    application_id VARCHAR(20) REFERENCES applications(id) ON DELETE SET NULL,
    farmer_id      VARCHAR(20) REFERENCES farmers(id) ON DELETE SET NULL,
    farmer_name    TEXT,
    animal_type    TEXT,
    reason         TEXT,
    status         TEXT DEFAULT 'Pending',
    photo_url      TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
  );

  -- Migration: Add photo_url to claims if it doesn't exist
  DO $$ 
  BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='claims' AND column_name='photo_url') THEN
      ALTER TABLE claims ADD COLUMN photo_url TEXT;
    END IF;
  END $$;
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

