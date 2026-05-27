-- KLYVO: Initial Database Schema for Neon Postgres (Sprint 1 -> 2 Migration)
-- Enable PostGIS extension for geospatial features
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users (Verified Agents & Users) replacing Supabase Auth
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    is_verified_agent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Properties
CREATE TABLE IF NOT EXISTS properties (
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
    
    -- Geospatial Data (PostGIS)
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    neighborhood TEXT,
    city TEXT,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'sold')),
    is_verified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for Spatial Queries
CREATE INDEX IF NOT EXISTS properties_location_gix ON properties USING GIST (location);

-- 3. Property Images
CREATE TABLE IF NOT EXISTS property_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Favorites 
CREATE TABLE IF NOT EXISTS favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, property_id)
);

-- 5. Inquiries (Leads for agents)
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who inquired, if logged in
    agent_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Agent receiving the inquiry
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: Row Level Security (RLS) is disabled natively in Postgres.
-- API Endpoint Security logic handles authorization constraints (e.g. only verified agents can insert properties).

-- Function for Radius Search (ST_DWithin)
-- In Neon, call this via standard pg query: SELECT * FROM search_properties_in_radius(...)
CREATE OR REPLACE FUNCTION search_properties_in_radius(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION
) RETURNS SETOF properties AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM properties
    WHERE status = 'published'
      AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
          radius_meters
      );
END;
$$ LANGUAGE plpgsql STABLE;
