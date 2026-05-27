import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import sharp from 'sharp';
import { OAuth2Client } from 'google-auth-library';

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const sql = neon(process.env.NEON_DATABASE_URL || 'postgresql://dummy:dummy@ep-dummy.neon.tech/neondb?sslmode=require');

// Configure R2 S3 Client
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

// Middleware for JWT Verification
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// --- API ROUTES ---

// 1. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName, isAgent } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, is_verified_agent) 
      VALUES (${email}, ${passwordHash}, ${fullName || ''}, ${isAgent ? true : false})
      RETURNING id, email, full_name, is_verified_agent;
    `;
    const user = result[0];
    const token = jwt.sign({ id: user.id, email: user.email, isAgent: user.is_verified_agent }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error: any) {
    console.error(error);
    if (error.code === '23505') return res.status(400).json({ error: 'Email already exists.' });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    const user = result[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, email: user.email, isAgent: user.is_verified_agent }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      user: { id: user.id, email: user.email, fullName: user.full_name, isAgent: user.is_verified_agent }, 
      token 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2.5 Auth: Google Login
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No credential provided.' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google payload');

    const { email, name, picture } = payload;
    if (!email) return res.status(400).json({ error: 'Email missing from Google payload.' });

    // Find or create user
    let userResult = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    let user = userResult[0];

    if (!user) {
       // Create a generic user (no password since it's OAuth)
       // We'll generate a random hashed password string just to satisfy NOT NULL constraints if any
       const dummyHash = await bcrypt.hash(Math.random().toString(36), 10);
       const inserted = await sql`
         INSERT INTO users (email, password_hash, full_name, avatar_url, is_verified_agent) 
         VALUES (${email}, ${dummyHash}, ${name || ''}, ${picture || ''}, false)
         RETURNING *;
       `;
       user = inserted[0];
    } else {
       // Optionally update avatar layout mapping
       if (picture && !user.avatar_url) {
          await sql`UPDATE users SET avatar_url = ${picture} WHERE id = ${user.id}`;
          user.avatar_url = picture;
       }
    }

    const token = jwt.sign({ id: user.id, email: user.email, isAgent: user.is_verified_agent }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      user: { id: user.id, email: user.email, fullName: user.full_name, isAgent: user.is_verified_agent, avatarUrl: user.avatar_url }, 
      token 
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Invalid Google token.' });
  }
});

// 3. Current User
app.get('/api/auth/me', requireAuth, async (req: any, res) => {
  try {
    const result = await sql`SELECT id, email, full_name, avatar_url, phone_number, is_verified_agent FROM users WHERE id = ${req.user.id}`;
    if (!result[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Generate Presigned URL for R2 Uploads
app.post('/api/upload/presign', requireAuth, async (req, res) => {
  const { filename, contentType } = req.body;
  if (!filename || !contentType) return res.status(400).json({ error: 'Filename and contentType required.' });
  
  if (!process.env.R2_BUCKET_NAME) return res.status(500).json({ error: 'Storage not configured.' });

  try {
    const key = `properties/${Date.now()}-${filename.replace(/\s+/g, '-')}`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    // Assuming custom domain for R2 or public access enabled on bucket
    const publicUrl = `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`;
    res.json({ uploadUrl: url, publicUrl, key });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// 4.1 Process & Upload Image via Sharp (New)
app.post('/api/upload/process', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });
  if (!process.env.R2_BUCKET_NAME) return res.status(500).json({ error: 'Storage not configured.' });

  try {
    const timestamp = Date.now();
    const originalName = req.file.originalname.replace(/\s+/g, '-');
    
    // Process image sizes with sharp
    const fullBuffer = await sharp(req.file.buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
      
    const thumbBuffer = await sharp(req.file.buffer)
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 70 })
      .toBuffer();

    const fullKey = `properties/${timestamp}-full-${originalName}.webp`;
    const thumbKey = `properties/${timestamp}-thumb-${originalName}.webp`;

    // Upload Full
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fullKey,
      Body: fullBuffer,
      ContentType: 'image/webp',
    }));

    // Upload Thumb
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: 'image/webp',
    }));

    const publicUrl = `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${fullKey}`;
    const thumbUrl = `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${thumbKey}`;

    res.json({ publicUrl, thumbUrl });
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ error: 'Failed to process and upload image.' });
  }
});

// 5. Property Search (Map & List)
app.get('/api/properties', async (req, res) => {
  const { lat, lng, radius, agent_id, listing_type, min_price, max_price, min_rooms, min_baths, property_type, sort } = req.query;

  try {
    let properties;
    if (lat && lng && radius) {
      properties = await sql`
        SELECT 
          p.id, p.title, p.price, p.rooms, p.bathrooms, p.area_sqm, p.property_type, p.listing_type, p.agent_id, p.created_at, p.status,
          ST_Y(p.location::geometry) as lat,
          ST_X(p.location::geometry) as lng,
          (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY is_featured DESC, display_order ASC LIMIT 1) as thumbnail
        FROM properties p
        WHERE p.status = 'published'
          AND ST_DWithin(
            p.location::geography,
            ST_SetSRID(ST_MakePoint(${Number(lng)}, ${Number(lat)}), 4326)::geography,
            ${Number(radius)}
          )
        LIMIT 100
      `;
    } else if (agent_id) {
       properties = await sql`
        SELECT 
          p.id, p.title, p.price, p.rooms, p.bathrooms, p.area_sqm, p.property_type, p.listing_type, p.agent_id, p.created_at, p.status,
          ST_Y(p.location::geometry) as lat,
          ST_X(p.location::geometry) as lng,
          (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY is_featured DESC, display_order ASC LIMIT 1) as thumbnail
        FROM properties p
        WHERE p.agent_id = ${agent_id as string}
      `;
    } else {
      properties = await sql`
        SELECT 
          p.id, p.title, p.price, p.rooms, p.bathrooms, p.area_sqm, p.property_type, p.listing_type, p.agent_id, p.created_at, p.status,
          ST_Y(p.location::geometry) as lat,
          ST_X(p.location::geometry) as lng,
          (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY is_featured DESC, display_order ASC LIMIT 1) as thumbnail
        FROM properties p
        WHERE p.status = 'published'
        LIMIT 100
      `;
    }
    
    if (listing_type && listing_type !== 'all') {
       properties = properties.filter((p: any) => p.listing_type === listing_type);
    }
    
    if (agent_id && lat) {
       properties = properties.filter((p: any) => p.agent_id === agent_id);
    }

    if (min_price) {
       properties = properties.filter((p: any) => Number(p.price) >= Number(min_price));
    }
    
    if (max_price) {
       properties = properties.filter((p: any) => Number(p.price) <= Number(max_price));
    }
    
    if (min_rooms) {
       properties = properties.filter((p: any) => Number(p.rooms) >= Number(min_rooms));
    }
    
    if (min_baths) {
       properties = properties.filter((p: any) => Number(p.bathrooms) >= Number(min_baths));
    }
    
    if (property_type && property_type !== 'all') {
       properties = properties.filter((p: any) => p.property_type === property_type);
    }

    if (sort === 'price_asc') {
       properties.sort((a: any, b: any) => Number(a.price) - Number(b.price));
    } else if (sort === 'price_desc') {
       properties.sort((a: any, b: any) => Number(b.price) - Number(a.price));
    } else {
       // default newest
       properties.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search properties' });
  }
});

// 6. Property Detail & Klyvo Score
app.get('/api/properties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql`
      SELECT 
        p.*,
        ST_Y(p.location::geometry) as lat,
        ST_X(p.location::geometry) as lng,
        u.full_name as agent_name,
        u.phone_number as agent_phone,
        u.avatar_url as agent_avatar,
        (
          SELECT AVG(price / NULLIF(area_sqm, 0))
          FROM properties
          WHERE neighborhood = p.neighborhood 
            AND status = 'published'
            AND area_sqm > 0
        ) as neighborhood_avg_price_per_sqm,
        (
          SELECT json_agg(json_build_object('url', image_url, 'is_featured', is_featured) ORDER BY is_featured DESC, display_order ASC)
          FROM property_images
          WHERE property_id = p.id
        ) as images
      FROM properties p
      LEFT JOIN users u ON p.agent_id = u.id
      WHERE p.id = ${id}
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = result[0];
    
    // Klyvo Score Logic
    let klyvoScore = 'Fair Value';
    if (property.area_sqm > 0 && property.neighborhood_avg_price_per_sqm) {
      const pricePerSqm = Number(property.price) / Number(property.area_sqm);
      const avg = Number(property.neighborhood_avg_price_per_sqm);
      
      if (pricePerSqm < avg * 0.9) {
        klyvoScore = 'Underpriced';
      } else if (pricePerSqm > avg * 1.1) {
        klyvoScore = 'Overpriced';
      }
    }

    res.json({ ...property, klyvoScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// 7. Favorites
app.get('/api/favorites', requireAuth, async (req: any, res) => {
  try {
    const favorites = await sql`
      SELECT property_id FROM favorites WHERE user_id = ${req.user.id}
    `;
    res.json({ favorites: favorites.map(f => f.property_id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', requireAuth, async (req: any, res) => {
  const { propertyId } = req.body;
  
  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required' });
  }

  try {
    const existing = await sql`
      SELECT * FROM favorites WHERE user_id = ${req.user.id} AND property_id = ${propertyId}
    `;
    
    let isFavorited = false;
    if (existing.length > 0) {
      // Remove favorite
      await sql`DELETE FROM favorites WHERE user_id = ${req.user.id} AND property_id = ${propertyId}`;
    } else {
      // Add favorite
      await sql`INSERT INTO favorites (user_id, property_id) VALUES (${req.user.id}, ${propertyId})`;
      isFavorited = true;
    }
    
    res.json({ success: true, isFavorited });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

import fs from 'fs';

app.post('/api/init-db', async (req, res) => {
  try {
    const migration = fs.readFileSync(path.join(process.cwd(), 'neon', 'migrations', '00001_initial_schema.sql'), 'utf-8');
    await sql.query(migration);
    res.json({ success: true, message: 'Database initialized successfully' });
  } catch (error: any) {
    console.error('Init DB Error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS postgis`;
      
    await sql`CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        phone_number TEXT,
        is_verified_agent BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    )`;
    
    await sql`CREATE TABLE IF NOT EXISTS properties (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        price DECIMAL(12, 2) NOT NULL,
        property_type TEXT CHECK (property_type IN ('apartment', 'house', 'land', 'commercial')),
        listing_type TEXT CHECK (listing_type IN ('sale', 'rent')),
        rooms INTEGER DEFAULT 0,
        bathrooms INTEGER DEFAULT 0,
        area_sqm DECIMAL(10, 2),
        location GEOGRAPHY(POINT, 4326) NOT NULL,
        neighborhood TEXT,
        city TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'sold')),
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    )`;
    
    await sql`CREATE INDEX IF NOT EXISTS properties_location_gix ON properties USING GIST (location)`;
    
    await sql`CREATE TABLE IF NOT EXISTS property_images (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        is_featured BOOLEAN DEFAULT false,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
    )`;
    
    await sql`CREATE TABLE IF NOT EXISTS favorites (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (user_id, property_id)
    )`;
    
    await sql`CREATE TABLE IF NOT EXISTS inquiries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
        created_at TIMESTAMPTZ DEFAULT now()
    )`;
    
    console.log('Database schema successfully initialized/verified.');
  } catch (err) {
    console.error('Failed to run database migrations on startup:', err);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
