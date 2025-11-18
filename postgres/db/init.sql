/**
 * HomeVisit Database Schema
 * 
 * This script initializes the PostgreSQL database with the following tables:
 * - groups: Group definitions with refresh intervals
 * - users: User records linked to groups
 * - sites: Site data with seen_status and polygon geometry linked to users and groups
 */

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- DROP OLD TABLES (for schema migration)
-- ============================================================================

/** Drop old tables if they exist */
DROP TABLE IF EXISTS user_sites CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

/** Site seen_status enumeration: Seen, Partial, Not Seen */
DO $$ BEGIN
    CREATE TYPE seen_status AS ENUM ('Seen', 'Partial', 'Not Seen');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

/**
 * groups table - Group definitions for organizing sites and users
 * 
 * Stores group information including the refresh interval for data statuses.
 */
CREATE TABLE IF NOT EXISTS groups (
  group_id BIGSERIAL PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  data_refreshments BIGINT NOT NULL DEFAULT 30000,
  CONSTRAINT chk_refresh_positive CHECK (data_refreshments > 0)
);

-- Index on group_name for lookups
CREATE INDEX IF NOT EXISTS idx_groups_group_name ON groups(group_name);

/**
 * users table - User profile data (simplified)
 * 
 * Stores minimal user information.
 * Each user belongs to a group via group_id.
 */
CREATE TABLE IF NOT EXISTS users (
  user_id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL,
  username VARCHAR(255) NOT NULL,
  CONSTRAINT fk_users_group FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
);

-- Index on group_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id);

-- Index on username for lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

/**
 * sites table - Site data with seen_status and polygon geometry
 * 
 * Stores site information with simplified schema including polygon boundaries.
 * Each site belongs to a group and a user.
 */
CREATE TABLE IF NOT EXISTS sites (
  site_id BIGSERIAL PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  group_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  seen_status seen_status DEFAULT 'Not Seen',
  -- status_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  seen_date TIMESTAMP NOT NULL DEFAULT DATE_TRUNC('day', CURRENT_TIMESTAMP),
  geometry geometry(Polygon, 4326) NOT NULL,
  CONSTRAINT fk_sites_group FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
  CONSTRAINT fk_sites_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sites_group_id ON sites(group_id);
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_seen_status ON sites(seen_status);
CREATE INDEX IF NOT EXISTS idx_sites_geometry ON sites USING GIST(geometry);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

/** Insert 7-day refresh group */
INSERT INTO groups (group_name, data_refreshments)
VALUES
  ('Weekly Refresh Group', 604800000)
ON CONFLICT DO NOTHING;

/** Insert sample users - shahar and demo assigned to group_id 1 */
INSERT INTO users (group_id, username)
VALUES 
  (1, 'shahar'),
  (1, 'demo')
ON CONFLICT DO NOTHING;

/** Insert sample sites - with 6+ point polygons for shahar and demo users */
INSERT INTO sites (site_name, group_id, user_id, seen_status, geometry)
VALUES
  -- New York (6 points)
  (
    'New York',
    1,
    1,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((-74.3 40.5, -73.9 40.6, -73.7 40.5, -73.8 40.9, -74.2 40.8, -74.3 40.5))'),
      4326
    )
  ),
  -- Egypt (6 points)
  (
    'Egypt',
    1,
    2,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((24.0 24.0, 30.0 24.5, 36.0 24.0, 35.5 32.0, 30.0 31.5, 24.0 24.0))'),
      4326
    )
  ),
  -- Tel Aviv (7 points)
  (
    'Tel Aviv',
    1,
    1,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((34.7 32.0, 34.8 32.05, 34.85 32.08, 34.88 32.08, 34.87 32.06, 34.82 32.02, 34.7 32.0))'),
      4326
    )
  ),
  -- Jerusalem (7 points)
  (
    'Jerusalem',
    1,
    2,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((35.2 31.75, 35.25 31.78, 35.27 31.8, 35.29 31.82, 35.28 31.79, 35.25 31.76, 35.2 31.75))'),
      4326
    )
  ),
  -- Haifa (6 points)
  (
    'Haifa',
    1,
    1,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((34.95 32.8, 35.0 32.85, 35.05 32.84, 35.04 32.81, 35.0 32.79, 34.95 32.8))'),
      4326
    )
  ),
  -- Beer Sheva (7 points)
  (
    'Beer Sheva',
    1,
    2,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((34.78 31.2, 34.83 31.25, 34.85 31.28, 34.87 31.27, 34.85 31.24, 34.82 31.21, 34.78 31.2))'),
      4326
    )
  ),
  -- Eilat (6 points)
  (
    'Eilat',
    1,
    1,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((34.95 29.5, 35.0 29.55, 35.05 29.54, 35.04 29.51, 35.0 29.49, 34.95 29.5))'),
      4326
    )
  ),
  -- Tiberias (7 points)
  (
    'Tiberias',
    1,
    2,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((35.5 32.78, 35.55 32.8, 35.58 32.82, 35.6 32.84, 35.58 32.82, 35.54 32.79, 35.5 32.78))'),
      4326
    )
  ),
  -- Netanya (6 points)
  (
    'Netanya',
    1,
    1,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((34.85 32.3, 34.9 32.33, 34.95 32.32, 34.93 32.29, 34.89 32.27, 34.85 32.3))'),
      4326
    )
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

/**
 * Trigger to update status_changed_at when seen_status changes
 */
CREATE OR REPLACE FUNCTION update_status_changed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update status_changed_at if seen_status actually changed
  IF OLD.seen_status IS DISTINCT FROM NEW.seen_status THEN
    NEW.seen_date = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_status_changed_at ON sites;
CREATE TRIGGER trigger_update_status_changed_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_status_changed_at();

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
GRANT SELECT ON groups, users, sites TO anon;
GRANT UPDATE ON sites TO anon;

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

/**
 * get_or_create_user - Get existing user or create new one with default group
 * 
 * @param p_group_id - Group ID to assign to the user (default: 1)
 * 
 * @returns user_id of the user
 */
CREATE OR REPLACE FUNCTION public.get_or_create_user(p_group_id BIGINT DEFAULT 1)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id BIGINT;
BEGIN
  -- Create new user in the specified group
  INSERT INTO users (group_id)
  VALUES (p_group_id)
  RETURNING user_id INTO v_user_id;
  
  RETURN v_user_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error or handle as needed
    RAISE;
END $$;

GRANT EXECUTE ON FUNCTION public.get_or_create_user(BIGINT) TO anon;

/**
 * get_user_sites - Retrieve all sites for a given user
 * 
 * Based on the user's ID, returns all sites assigned to that user including geometry.
 * 
 * @param p_user_id - ID of the user
 * 
 * @returns Set of site records belonging to the user
 */
CREATE OR REPLACE FUNCTION public.get_user_sites(p_user_id BIGINT)
RETURNS TABLE (
  site_id BIGINT,
  site_name VARCHAR,
  group_id BIGINT,
  user_id BIGINT,
  seen_status seen_status,
  geometry geometry
) LANGUAGE sql STABLE AS $$
  SELECT s.site_id, s.site_name, s.group_id, s.user_id, s.seen_status, s.geometry
  FROM sites s
  WHERE s.user_id = p_user_id
  ORDER BY s.site_name;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_sites(BIGINT) TO anon;

/**
 * update_site_status - Update a site's seen_status
 * 
 * @param p_site_id - ID of the site to update
 * @param p_new_status - New status value (Seen, Partial, Not Seen)
 */
CREATE OR REPLACE FUNCTION public.update_site_status(p_site_id BIGINT, p_new_status seen_status)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE sites
  SET seen_status = p_new_status
  WHERE site_id = p_site_id;
$$;

GRANT EXECUTE ON FUNCTION public.update_site_status(BIGINT, seen_status) TO anon;

/**
 * refresh_expired_statuses - Reset seen_status to 'Not Seen' for sites whose countdown has expired
 * 
 * Based on the group's data_refreshments interval (in milliseconds),
 * reset any 'Seen' or 'Partial' sites back to 'Not Seen' if the refresh interval has passed.
 * 
 * @param p_group_id - ID of the group whose sites should be refreshed
 * 
 * @returns Number of sites that were refreshed
 */
CREATE OR REPLACE FUNCTION public.refresh_expired_statuses(p_group_id BIGINT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_refresh_interval INTERVAL;
  v_count INTEGER;
BEGIN
  -- Get the refresh interval for the group (convert from milliseconds to interval)
  SELECT (data_refreshments || ' milliseconds')::INTERVAL INTO v_refresh_interval
  FROM groups
  WHERE group_id = p_group_id;
  
  IF v_refresh_interval IS NULL THEN
    RAISE EXCEPTION 'Group % not found', p_group_id;
  END IF;
  
  -- Update sites that have passed the refresh interval
  UPDATE sites
  SET seen_status = 'Not Seen'
  WHERE 
    group_id = p_group_id
    AND seen_status IN ('Seen', 'Partial')
    AND seen_date + v_refresh_interval <= CURRENT_TIMESTAMP
  RETURNING site_id INTO v_count;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

GRANT EXECUTE ON FUNCTION public.refresh_expired_statuses(BIGINT) TO anon;
