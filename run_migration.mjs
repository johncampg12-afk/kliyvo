import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.NEON_DATABASE_URL || 'postgresql://dummy:dummy@ep-dummy.neon.tech/neondb?sslmode=require');

async function main() {
  const stmts = [
    `CREATE EXTENSION IF NOT EXISTS postgis`,
    `CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        phone_number TEXT,
        is_verified_agent BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS properties (
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
    )`
  ];

  for (const stmt of stmts) {
    try {
      await sql(stmt);
      console.log('Success:', stmt.substring(0, 50));
    } catch (e) {
      console.error('Failed:', stmt.substring(0, 50), e.message);
    }
  }
}
main();
