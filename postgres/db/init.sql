/**
 * HomeVisit Database Schema
 * 
 * This script initializes the PostgreSQL database with PostGIS support.
 * It creates users, sites, and site assignments tables with proper indexes,
 * constraints, and RPC functions for authentication and site management.
 */

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- DROP OLD TABLES (for schema migration)
-- ============================================================================

/** Drop old user_sites many-to-many table if it exists */
DROP TABLE IF EXISTS user_sites CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

/** Site status enumeration: online, offline, or maintenance */
DO $$ BEGIN
    CREATE TYPE site_status AS ENUM ('online', 'offline', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

/**
 * users table - User profile data
 * 
 * Stores user information. Simple username-based access (no passwords).
 * Each user belongs to a group via group_id, determining which sites they can access.
 */
CREATE TABLE IF NOT EXISTS users (
  user_id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  group_id BIGINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index on username for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
-- Index on group_id for efficient site queries
CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id);

/**
 * sites table - Geographic location data with PostGIS geometry
 * 
 * Stores site information including geographic coordinates (via PostGIS geometry),
 * status, and timestamps for monitoring. Each site belongs to a group via group_id.
 */
CREATE TABLE IF NOT EXISTS sites (
  site_id BIGSERIAL PRIMARY KEY,
  site_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  geometry geometry(Point, 4326) NOT NULL,
  group_id BIGINT NOT NULL DEFAULT 1,
  status site_status DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT now(),
  last_data TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sites_site_code ON sites(site_code);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_group_id ON sites(group_id);
CREATE INDEX IF NOT EXISTS idx_sites_geometry ON sites USING GIST(geometry);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

/** Insert sample sites - both assigned to group_id 1 */
INSERT INTO sites (site_code, name, geometry, group_id, status, last_seen, last_data)
VALUES
  ('NYC', 'New York', ST_SetSRID(ST_GeomFromText('POINT(-74.0060 40.7128)'), 4326), 1, 'online', now(), now()),
  ('EGYPT', 'Egypt', ST_SetSRID(ST_GeomFromText('POINT(31.2357 30.0444)'), 4326), 1, 'online', now(), now())
ON CONFLICT (site_code) DO NOTHING;

/** Insert sample users - both assigned to group_id 1 */
INSERT INTO users (username, email, group_id)
VALUES 
  ('demo', 'demo@example.com', 1),
  ('shahar', 'shahar@example.com', 1)
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- ROLES AND PERMISSIONS
-- ============================================================================

/** Create anon role for PostgREST (unauthenticated requests) */
DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

/** Grant basic permissions to anon role */
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON users, sites TO anon;
GRANT UPDATE ON sites TO anon;

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

/**
 * get_or_create_user - Get existing user or create new one by username
 * 
 * @param p_username - Username (unique, no password required)
 * 
 * @returns user_id of the user
 */
CREATE OR REPLACE FUNCTION public.get_or_create_user(p_username TEXT)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id BIGINT;
BEGIN
  -- Try to get existing user
  SELECT user_id INTO v_user_id FROM users WHERE username = p_username LIMIT 1;
  
  -- If user exists, return their ID
  IF v_user_id IS NOT NULL THEN
    RETURN v_user_id;
  END IF;
  
  -- Otherwise create new user
  INSERT INTO users (username)
  VALUES (p_username)
  RETURNING user_id INTO v_user_id;
  
  RETURN v_user_id;
EXCEPTION
  WHEN unique_violation THEN
    -- Race condition: user was created between check and insert
    SELECT user_id INTO v_user_id FROM users WHERE username = p_username LIMIT 1;
    RETURN v_user_id;
END $$;

GRANT EXECUTE ON FUNCTION public.get_or_create_user(TEXT) TO anon;

/**
 * get_user_sites - Retrieve all sites for a given user
 * 
 * Based on the user's group_id, returns all sites in the same group.
 * 
 * @param p_user_id - ID of the user
 * 
 * @returns Set of site records belonging to the user's group
 */
CREATE OR REPLACE FUNCTION public.get_user_sites(p_user_id BIGINT)
RETURNS TABLE (
  site_id BIGINT,
  site_code VARCHAR,
  name VARCHAR,
  geometry geometry,
  status site_status,
  last_seen TIMESTAMPTZ,
  last_data TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) LANGUAGE sql STABLE AS $$
  SELECT s.site_id, s.site_code, s.name, s.geometry, s.status, s.last_seen, s.last_data, s.created_at, s.updated_at
  FROM sites s
  WHERE s.group_id = (SELECT group_id FROM users WHERE user_id = p_user_id)
  ORDER BY s.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_sites(BIGINT) TO anon;

/**
 * update_site_status - Update a site's status and last_seen timestamp
 * 
 * @param p_site_id - ID of the site to update
 * @param p_new_status - New status value
 */
CREATE OR REPLACE FUNCTION public.update_site_status(p_site_id BIGINT, p_new_status site_status)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE sites
  SET status = p_new_status, last_seen = now(), updated_at = now()
  WHERE site_id = p_site_id;
$$;

GRANT EXECUTE ON FUNCTION public.update_site_status(BIGINT, site_status) TO anon;
