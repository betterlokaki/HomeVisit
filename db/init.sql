-- Initialize PostGIS extension, types, tables, sample data, and RPC functions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enum for site status (3 options)
DO $$ BEGIN
    CREATE TYPE site_status AS ENUM ('online','offline','maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
  id text PRIMARY KEY,
  name text,
  geometry geometry,
  status site_status DEFAULT 'offline',
  last_seen timestamptz,
  last_data timestamptz
);

-- Users table, with an array of site ids
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  sites text[]
);

-- Sample data: New York and Egypt (simple POINT geometries)
INSERT INTO sites (id, name, geometry, status, last_seen, last_data)
VALUES
  ('newyowrk', 'New York', ST_SetSRID(ST_GeomFromText('POINT(-74.0060 40.7128)'),4326), 'online', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO sites (id, name, geometry, status, last_seen, last_data)
VALUES
  ('egypt', 'Egypt', ST_SetSRID(ST_GeomFromText('POINT(31.2357 30.0444)'),4326), 'online', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Sample user
INSERT INTO users (id, sites)
VALUES ('shahar', ARRAY['egypt','newyowrk'])
ON CONFLICT (id) DO NOTHING;

-- Create anon role for PostgREST (no login)
DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON sites TO anon;
GRANT SELECT ON users TO anon;
GRANT UPDATE ON sites TO anon;

-- RPC to update a site's status by id
CREATE OR REPLACE FUNCTION public.update_site_status(site_id text, new_status site_status)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE sites SET status = new_status, last_seen = now() WHERE id = site_id;
$$;

GRANT EXECUTE ON FUNCTION public.update_site_status(text, site_status) TO anon;

-- RPC to get sites for a username (sites array in users)
CREATE OR REPLACE FUNCTION public.get_sites_by_user(username text)
RETURNS SETOF sites LANGUAGE sql AS $$
  SELECT s.* FROM sites s JOIN users u ON u.id = username WHERE s.id = ANY(u.sites);
$$;

GRANT EXECUTE ON FUNCTION public.get_sites_by_user(text) TO anon;
