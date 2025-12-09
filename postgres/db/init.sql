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
  display_name VARCHAR(255) NOT NULL DEFAULT '',
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

/** Insert groups with different refresh intervals */
INSERT INTO groups (group_name, data_refreshments)
VALUES
  ('Weekly Refresh Group', 604800000),
  ('Daily Check Group', 86400000)
ON CONFLICT DO NOTHING;

/** Insert sample users - shahar and demo assigned to group_id 1, alex and sara to group_id 2 */
INSERT INTO users (group_id, username, display_name)
VALUES 
  (1, 'shahar', 'שחר'),
  (1, 'demo', 'בדיקה'),
  (2, 'alex', 'אלכס'),
  (2, 'sara', 'שרה')
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
  ),
  -- Group 2: Daily Check Group Sites
  -- Paris (6 points) - alex
  (
    'Paris',
    2,
    3,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((2.2 48.8, 2.4 48.9, 2.5 48.85, 2.45 48.75, 2.3 48.7, 2.2 48.8))'),
      4326
    )
  ),
  -- London (7 points) - sara
  (
    'London',
    2,
    4,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((-0.2 51.5, -0.1 51.55, 0.0 51.56, 0.1 51.54, 0.08 51.5, 0.0 51.48, -0.2 51.5))'),
      4326
    )
  ),
  -- Berlin (6 points) - alex
  (
    'Berlin',
    2,
    3,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((13.3 52.5, 13.5 52.55, 13.6 52.52, 13.55 52.48, 13.4 52.46, 13.3 52.5))'),
      4326
    )
  ),
  -- Amsterdam (7 points) - sara
  (
    'Amsterdam',
    2,
    4,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((4.8 52.35, 4.9 52.38, 5.0 52.39, 5.1 52.37, 5.08 52.33, 4.95 52.32, 4.8 52.35))'),
      4326
    )
  ),
  -- Barcelona (6 points) - alex
  (
    'Barcelona',
    2,
    3,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((2.1 41.3, 2.2 41.35, 2.3 41.33, 2.28 41.28, 2.18 41.26, 2.1 41.3))'),
      4326
    )
  ),
  -- Rome (7 points) - sara
  (
    'Rome',
    2,
    4,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((12.4 41.8, 12.5 41.83, 12.6 41.84, 12.65 41.82, 12.62 41.78, 12.5 41.76, 12.4 41.8))'),
      4326
    )
  ),
  -- Vienna (6 points) - alex
  (
    'Vienna',
    2,
    3,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((16.3 48.2, 16.4 48.25, 16.5 48.23, 16.48 48.18, 16.38 48.16, 16.3 48.2))'),
      4326
    )
  ),
  -- Prague (7 points) - sara
  (
    'Prague',
    2,
    4,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((14.4 50.0, 14.5 50.03, 14.6 50.04, 14.65 50.02, 14.62 49.98, 14.5 49.96, 14.4 50.0))'),
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
  geometry geometry,
  display_name VARCHAR
) LANGUAGE sql STABLE AS $$
  SELECT s.site_id, s.site_name, s.group_id, s.user_id, s.seen_status, s.geometry, u.display_name
  FROM sites s
  JOIN users u ON s.user_id = u.user_id
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

-- ============================================================================
-- SITES HISTORY TABLE AND RPC FUNCTIONS
-- ============================================================================

/**
 * sites_history table - Stores historical visit status for each site
 * 
 * Records site status snapshots at the end of each period (daily/weekly).
 * Uses unique constraint on (site_id, recorded_date) to allow upsert.
 */
CREATE TABLE IF NOT EXISTS sites_history (
  history_id BIGSERIAL PRIMARY KEY,
  site_id BIGINT NOT NULL,
  status seen_status NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT fk_history_site FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE CASCADE,
  CONSTRAINT uq_site_date UNIQUE (site_id, recorded_date)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_history_site_id ON sites_history(site_id);
CREATE INDEX IF NOT EXISTS idx_history_recorded_date ON sites_history(recorded_date);

-- Grant permissions to anon role
GRANT SELECT, INSERT, UPDATE ON sites_history TO anon;
GRANT USAGE, SELECT ON SEQUENCE sites_history_history_id_seq TO anon;

/**
 * upsert_site_history - Insert or update a site's history record for a specific date
 * 
 * @param p_site_id - ID of the site
 * @param p_status - Status to record
 * @param p_date - Date for the record (defaults to current date)
 */
CREATE OR REPLACE FUNCTION public.upsert_site_history(
  p_site_id BIGINT,
  p_status seen_status,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO sites_history (site_id, status, recorded_date)
  VALUES (p_site_id, p_status, p_date)
  ON CONFLICT (site_id, recorded_date)
  DO UPDATE SET status = EXCLUDED.status;
END $$;

GRANT EXECUTE ON FUNCTION public.upsert_site_history(BIGINT, seen_status, DATE) TO anon;

/**
 * save_group_statuses_to_history - Save current status of all sites in a group to history
 * 
 * Called before refresh_expired_statuses to preserve the status snapshot.
 * 
 * @param p_group_id - ID of the group whose site statuses should be saved
 * 
 * @returns Number of history records saved
 */
CREATE OR REPLACE FUNCTION public.save_group_statuses_to_history(p_group_id BIGINT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO sites_history (site_id, status, recorded_date)
  SELECT site_id, seen_status, CURRENT_DATE
  FROM sites
  WHERE group_id = p_group_id
  ON CONFLICT (site_id, recorded_date)
  DO UPDATE SET status = EXCLUDED.status;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

GRANT EXECUTE ON FUNCTION public.save_group_statuses_to_history(BIGINT) TO anon;

/**
 * get_site_history_by_name_and_group - Get history records for a site by name and group
 * 
 * @param p_site_name - Name of the site
 * @param p_group_name - Name of the group
 * 
 * @returns Table of history records with site_name included
 */
CREATE OR REPLACE FUNCTION public.get_site_history_by_name_and_group(
  p_site_name VARCHAR,
  p_group_name VARCHAR
)
RETURNS TABLE (
  history_id BIGINT,
  site_id BIGINT,
  site_name VARCHAR,
  status seen_status,
  recorded_date DATE
) LANGUAGE sql STABLE AS $$
  SELECT 
    h.history_id,
    h.site_id,
    s.site_name,
    h.status,
    h.recorded_date
  FROM sites_history h
  JOIN sites s ON h.site_id = s.site_id
  JOIN groups g ON s.group_id = g.group_id
  WHERE s.site_name = p_site_name
    AND g.group_name = p_group_name
  ORDER BY h.recorded_date DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_site_history_by_name_and_group(VARCHAR, VARCHAR) TO anon;

/**
 * update_site_history - Update or insert a specific history record by site name, group name, and date
 * 
 * This function performs an UPSERT operation - it will INSERT a new record if it doesn't exist,
 * or UPDATE the existing record if it does. This ensures the database is always updated.
 * 
 * @param p_site_name - Name of the site
 * @param p_group_name - Name of the group
 * @param p_date - Date of the history record to update/insert
 * @param p_new_status - New status to set
 * 
 * @returns Boolean indicating success
 */
CREATE OR REPLACE FUNCTION public.update_site_history(
  p_site_name VARCHAR,
  p_group_name VARCHAR,
  p_date DATE,
  p_new_status seen_status
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_site_id BIGINT;
BEGIN
  -- Get site_id matching both site_name and group_name
  SELECT s.site_id INTO v_site_id
  FROM sites s
  JOIN groups g ON s.group_id = g.group_id
  WHERE s.site_name = p_site_name
    AND g.group_name = p_group_name
  LIMIT 1;
  
  IF v_site_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- UPSERT: Insert if doesn't exist, update if it does
  INSERT INTO sites_history (site_id, status, recorded_date)
  VALUES (v_site_id, p_new_status, p_date)
  ON CONFLICT (site_id, recorded_date)
  DO UPDATE SET status = EXCLUDED.status;
  
  RETURN TRUE;
END $$;

GRANT EXECUTE ON FUNCTION public.update_site_history(VARCHAR, VARCHAR, DATE, seen_status) TO anon;

-- ============================================================================
-- ADDITIONAL SAMPLE DATA: 5minutely Group and Site History
-- ============================================================================

/** Insert 5minutely group (300000ms = 5 minutes) */
INSERT INTO groups (group_name, data_refreshments)
VALUES
  ('5minutely Group', 300000)
ON CONFLICT DO NOTHING;

/** Insert users for 5minutely group (group_id = 3) */
INSERT INTO users (group_id, username, display_name)
VALUES 
  (3, 'fast_user1', 'משתמש מהיר 1'),
  (3, 'fast_user2', 'משתמש מהיר 2')
ON CONFLICT DO NOTHING;

/** Insert sites for 5minutely group */
INSERT INTO sites (site_name, group_id, user_id, seen_status, geometry)
VALUES
  -- Tokyo (6 points) - fast_user1
  (
    'Tokyo',
    3,
    5,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((139.6 35.6, 139.8 35.7, 140.0 35.65, 139.95 35.55, 139.75 35.5, 139.6 35.6))'),
      4326
    )
  ),
  -- Sydney (7 points) - fast_user2
  (
    'Sydney',
    3,
    6,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((151.0 -33.9, 151.1 -33.85, 151.25 -33.8, 151.3 -33.85, 151.25 -33.95, 151.1 -34.0, 151.0 -33.9))'),
      4326
    )
  ),
  -- Singapore (6 points) - fast_user1
  (
    'Singapore',
    3,
    5,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((103.7 1.2, 103.85 1.35, 104.0 1.3, 103.95 1.2, 103.8 1.15, 103.7 1.2))'),
      4326
    )
  ),
  -- Dubai (7 points) - fast_user2
  (
    'Dubai',
    3,
    6,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((55.1 25.0, 55.2 25.1, 55.35 25.15, 55.4 25.1, 55.35 25.0, 55.2 24.95, 55.1 25.0))'),
      4326
    )
  ),
  -- Mumbai (6 points) - fast_user1
  (
    'Mumbai',
    3,
    5,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((72.8 18.9, 72.9 19.0, 73.0 19.05, 72.95 18.95, 72.85 18.88, 72.8 18.9))'),
      4326
    )
  ),
  -- Hong Kong (7 points) - fast_user2
  (
    'Hong Kong',
    3,
    6,
    'Not Seen',
    ST_SetSRID(
      ST_GeomFromText('POLYGON((114.0 22.2, 114.1 22.3, 114.25 22.35, 114.3 22.3, 114.25 22.2, 114.1 22.15, 114.0 22.2))'),
      4326
    )
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SITE HISTORY DATA (6 random dates for each group)
-- ============================================================================

/** Insert site history for Weekly Refresh Group (group_id = 1) sites */
-- New York (site_id 1)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (1, 'Seen', '2025-11-01'),
  (1, 'Partial', '2025-11-08'),
  (1, 'Seen', '2025-11-15'),
  (1, 'Not Seen', '2025-11-22'),
  (1, 'Seen', '2025-11-29'),
  (1, 'Partial', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Egypt (site_id 2)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (2, 'Partial', '2025-10-15'),
  (2, 'Seen', '2025-10-22'),
  (2, 'Seen', '2025-11-05'),
  (2, 'Not Seen', '2025-11-12'),
  (2, 'Partial', '2025-11-26'),
  (2, 'Seen', '2025-12-02')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Tel Aviv (site_id 3)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (3, 'Seen', '2025-10-01'),
  (3, 'Seen', '2025-10-20'),
  (3, 'Partial', '2025-11-03'),
  (3, 'Seen', '2025-11-17'),
  (3, 'Seen', '2025-11-28'),
  (3, 'Partial', '2025-12-01')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Jerusalem (site_id 4)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (4, 'Not Seen', '2025-09-25'),
  (4, 'Partial', '2025-10-10'),
  (4, 'Seen', '2025-10-28'),
  (4, 'Seen', '2025-11-15'),
  (4, 'Partial', '2025-11-25'),
  (4, 'Seen', '2025-12-02')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Haifa (site_id 5)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (5, 'Seen', '2025-10-05'),
  (5, 'Seen', '2025-10-19'),
  (5, 'Partial', '2025-11-02'),
  (5, 'Not Seen', '2025-11-16'),
  (5, 'Seen', '2025-11-30'),
  (5, 'Seen', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Beer Sheva (site_id 6)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (6, 'Partial', '2025-10-08'),
  (6, 'Seen', '2025-10-22'),
  (6, 'Seen', '2025-11-05'),
  (6, 'Partial', '2025-11-19'),
  (6, 'Seen', '2025-11-27'),
  (6, 'Not Seen', '2025-12-01')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

/** Insert site history for Daily Check Group (group_id = 2) sites */
-- Paris (site_id 10)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (10, 'Seen', '2025-11-28'),
  (10, 'Seen', '2025-11-29'),
  (10, 'Partial', '2025-11-30'),
  (10, 'Seen', '2025-12-01'),
  (10, 'Not Seen', '2025-12-02'),
  (10, 'Seen', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- London (site_id 11)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (11, 'Partial', '2025-11-27'),
  (11, 'Seen', '2025-11-28'),
  (11, 'Seen', '2025-11-29'),
  (11, 'Not Seen', '2025-11-30'),
  (11, 'Partial', '2025-12-02'),
  (11, 'Seen', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Berlin (site_id 12)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (12, 'Seen', '2025-11-26'),
  (12, 'Partial', '2025-11-28'),
  (12, 'Seen', '2025-11-30'),
  (12, 'Seen', '2025-12-01'),
  (12, 'Partial', '2025-12-02'),
  (12, 'Seen', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Amsterdam (site_id 13)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (13, 'Not Seen', '2025-11-25'),
  (13, 'Seen', '2025-11-27'),
  (13, 'Seen', '2025-11-29'),
  (13, 'Partial', '2025-12-01'),
  (13, 'Seen', '2025-12-02'),
  (13, 'Seen', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

/** Insert site history for 5minutely Group (group_id = 3) sites */
-- Tokyo (site_id 18)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (18, 'Seen', '2025-11-28'),
  (18, 'Partial', '2025-11-29'),
  (18, 'Seen', '2025-11-30'),
  (18, 'Not Seen', '2025-12-01'),
  (18, 'Seen', '2025-12-02'),
  (18, 'Partial', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Sydney (site_id 19)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (19, 'Partial', '2025-11-27'),
  (19, 'Seen', '2025-11-29'),
  (19, 'Seen', '2025-11-30'),
  (19, 'Partial', '2025-12-01'),
  (19, 'Seen', '2025-12-02'),
  (19, 'Not Seen', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Singapore (site_id 20)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (20, 'Seen', '2025-11-26'),
  (20, 'Seen', '2025-11-28'),
  (20, 'Partial', '2025-11-30'),
  (20, 'Seen', '2025-12-01'),
  (20, 'Seen', '2025-12-02'),
  (20, 'Partial', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Dubai (site_id 21)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (21, 'Not Seen', '2025-11-25'),
  (21, 'Partial', '2025-11-28'),
  (21, 'Seen', '2025-11-30'),
  (21, 'Seen', '2025-12-01'),
  (21, 'Partial', '2025-12-02'),
  (21, 'Seen', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Mumbai (site_id 22)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (22, 'Seen', '2025-11-24'),
  (22, 'Seen', '2025-11-27'),
  (22, 'Seen', '2025-11-29'),
  (22, 'Partial', '2025-12-01'),
  (22, 'Not Seen', '2025-12-02'),
  (22, 'Seen', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;

-- Hong Kong (site_id 23)
INSERT INTO sites_history (site_id, status, recorded_date) VALUES
  (23, 'Partial', '2025-11-23'),
  (23, 'Seen', '2025-11-26'),
  (23, 'Not Seen', '2025-11-29'),
  (23, 'Seen', '2025-12-01'),
  (23, 'Seen', '2025-12-02'),
  (23, 'Seen', '2025-12-03')
ON CONFLICT (site_id, recorded_date) DO NOTHING;
