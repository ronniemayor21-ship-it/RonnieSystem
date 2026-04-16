const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('./db');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure Cloudinary credentials exist
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️ Cloudinary environment variables are missing. File uploads will fail.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Multer Storage — images go directly to Cloudinary, no local disk
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'livestox-care',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload = multer({ storage: storage });

// Also keep local /uploads for any existing files (backwards compat)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', (req, res, next) => {
  console.log(`[Static] Request for ${req.url}`);
  next();
}, express.static(uploadsDir));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: db.getIsConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  });
});

// File Upload Endpoint — uploads to Cloudinary, returns a persistent URL
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.error('Upload attempt failed: No file provided');
    return res.status(400).send('No file uploaded.');
  }
  // Cloudinary gives us req.file.path which is the full https:// URL
  const fileUrl = req.file.path;
  console.log('✅ File uploaded successfully:', fileUrl);
  res.json({ url: fileUrl });
});

// ==========================================
// FARMERS API
// ==========================================

// Get all farmers
app.get('/api/farmers', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM farmers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a farmer
app.post('/api/farmers', async (req, res) => {
  try {
    const { id, name, username, password, mobile, address, district, status, dob, gender, civil_status } = req.body;
    
    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const newFarmer = await db.query(
      'INSERT INTO farmers (id, name, username, password, mobile, address, district, status, dob, gender, civil_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [id, name, username, password, mobile, address, district, status || 'Pending', dob, gender, civil_status]
    );
    res.json(newFarmer.rows[0]);
  } catch (err) {
    if (err.code === '23505') { 
      if (err.message.includes('farmers_username_key')) {
        return res.status(409).json({ error: 'Username already exists. Please choose a different one.' });
      }
      if (err.message.includes('farmers_pkey')) {
        return res.status(409).json({ error: 'A conflict occurred with the generated Farmer ID. Please try again.' });
      }
      return res.status(409).json({ error: 'This farmer already exists in the system.' });
    }
    console.error('Registration Error:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred during registration' });
  }
});

// Farmer Login
app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Mobile and password are required' });
    }

    const result = await db.query(
      'SELECT * FROM farmers WHERE LOWER(username) = LOWER($1) OR mobile = $1 OR LOWER(id) = LOWER($1)',
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found. Please check your credentials.' });
    }

    const farmer = result.rows[0];

    if (farmer.password !== password) {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }

    res.json(farmer);
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'An unexpected error occurred during login' });
  }
});

// Update a farmer by id
app.put('/api/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, mobile, address, district, status, dob, gender, civil_status, civilStatus } = req.body;
    const actualCivilStatus = civil_status || civilStatus;
    
    // Dynamically build the update query based on provided fields
    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (name) { fields.push(`name = $${queryIndex++}`); values.push(name); }
    if (username) { fields.push(`username = $${queryIndex++}`); values.push(username); }
    if (password) { fields.push(`password = $${queryIndex++}`); values.push(password); }
    if (mobile) { fields.push(`mobile = $${queryIndex++}`); values.push(mobile); }
    if (address) { fields.push(`address = $${queryIndex++}`); values.push(address); }
    if (district) { fields.push(`district = $${queryIndex++}`); values.push(district); }
    if (status) { fields.push(`status = $${queryIndex++}`); values.push(status); }
    if (dob) { fields.push(`dob = $${queryIndex++}`); values.push(dob); }
    if (gender) { fields.push(`gender = $${queryIndex++}`); values.push(gender); }
    if (actualCivilStatus) { fields.push(`civil_status = $${queryIndex++}`); values.push(actualCivilStatus); }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE farmers SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`;
    
    const updateFarmer = await db.query(query, values);
    res.json(updateFarmer.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a farmer
app.delete('/api/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM farmers WHERE id = $1', [id]);
    res.json('Farmer was deleted');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ==========================================
// APPLICATIONS API
// ==========================================

// Get all applications
app.get('/api/applications', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM applications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create an application
app.post('/api/applications', async (req, res) => {
  try {
    const { id, farmer_id, name, type, mobile, address, district, value, start_date, end_date, status, photo_url, ownership_proof_url, purpose, breed, sex, age } = req.body;
    const newApp = await db.query(
      `INSERT INTO applications (id, farmer_id, name, type, mobile, address, district, value, start_date, end_date, status, photo_url, ownership_proof_url, purpose, breed, sex, age) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [id, farmer_id, name, type, mobile, address, district, value, start_date, end_date, status || 'Pending', photo_url, ownership_proof_url, purpose, breed, sex, age]
    );
    res.json(newApp.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update an application status
app.put('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateApp = await db.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(updateApp.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ==========================================
// CLAIMS API
// ==========================================

// Get all claims
app.get('/api/claims', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM claims ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a claim
app.post('/api/claims', async (req, res) => {
  try {
    const { id, application_id, farmer_id, farmer_name, animal_type, reason, status, photo_url } = req.body;
    const newClaim = await db.query(
      `INSERT INTO claims (id, application_id, farmer_id, farmer_name, animal_type, reason, status, photo_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, application_id, farmer_id, farmer_name, animal_type, reason, status || 'Pending', photo_url]
    );
    res.json(newClaim.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a claim status
app.put('/api/claims/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateClaim = await db.query(
      'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(updateClaim.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ==========================================
// SERVE FRONTEND (React built files)
// ==========================================

// Hashed assets (JS, CSS) — cache aggressively since filenames change on each build
app.use('/assets', express.static(path.join(__dirname, '../dist/assets'), {
  maxAge: '1y',
  immutable: true,
}));

// All other static files — no cache to ensure fresh content after deploy
app.use(express.static(path.join(__dirname, '../dist'), {
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    // Never cache index.html or other non-hashed files
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  },
}));

// Catch-all to serve index.html for React Router (with no-cache headers)
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

const runSchema = require('./setup');

// Start server
async function startServer() {
  try {
    await runSchema();
    console.log('✅ Database schema verified.');
  } catch (err) {
    console.error('⚠️ Database setup deferred:', err.message);
    console.warn('   The server will still start to provide the frontend, but API functionality might be limited.');
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
