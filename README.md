# HomeVisit - Minimal Self-Hosted Backend & Web UI

A minimal self-hosted backend with Postgres + PostGIS + PostgREST, and a beautiful Svelte UI to manage site locations.

## Architecture

- **Backend**: Postgres (PostGIS extension) + PostgREST
- **Frontend**: Svelte + Vite + MapLibre GL
- **Deployment**: Docker Compose

## Features

- ✅ PostgreSQL + PostGIS for geographic data
- ✅ PostgREST auto-generated REST API
- ✅ Beautiful Svelte UI with real-time updates
- ✅ Interactive MapLibre map to view site locations
- ✅ Status management (online/offline/maintenance)
- ✅ Hardcoded user (shahar) with assigned sites
- ✅ Docker-based self-hosting

## Project Structure

```
.
├── docker-compose.yml       # Runs Postgres + PostgREST
├── postgrest.conf          # PostgREST configuration
├── db/init.sql             # Database schema & seed data
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite build config
├── svelte.config.js        # Svelte preprocessor config
├── tsconfig.json           # TypeScript config
├── index.html              # Entry HTML
└── src/
    ├── main.ts             # Svelte app entry
    ├── App.svelte          # Main app component
    └── components/
        ├── SiteList.svelte # List of sites sidebar
        ├── SiteCard.svelte # Individual site card
        └── Map.svelte      # MapLibre map integration
```

## Quick Start

### 1. Start the Backend (Docker)

```bash
cd /Users/shaharrozolio/Documents/Code/Projects/Python/HomeVisit
docker-compose up -d
```

This starts:
- **Postgres + PostGIS** on `localhost:5432` (user: postgres, password: postgres)
- **PostgREST** on `http://localhost:3000`

The database is automatically initialized with:
- `sites` table: geographic locations with status
- `users` table: users with assigned site IDs
- Sample data: New York and Egypt sites for user `shahar`
- RPC endpoints: `update_site_status` and `get_sites_by_user`

### 2. Start the Frontend (Development)

In a new terminal:

```bash
cd /Users/shaharrozolio/Documents/Code/Projects/Python/HomeVisit
npm install
npm run dev
```

Opens at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
npm run preview
```

## Available API Endpoints

All served by PostgREST on `http://localhost:3000`

### GET Tables

- `GET /sites` — List all sites
- `GET /users` — List all users

### RPC Functions

- **Update Site Status**
  ```bash
  POST /rpc/update_site_status
  Body: { "site_id": "egypt", "new_status": "maintenance" }
  ```

- **Get Sites by User**
  ```bash
  POST /rpc/get_sites_by_user
  Body: { "username": "shahar" }
  ```

## Database Schema

### Enum: site_status

```sql
CREATE TYPE site_status AS ENUM ('online', 'offline', 'maintenance');
```

### Table: sites

```sql
CREATE TABLE sites (
  id text PRIMARY KEY,
  name text,
  geometry geometry,  -- PostGIS geometry
  status site_status,
  last_seen timestamptz,
  last_data timestamptz
);
```

### Table: users

```sql
CREATE TABLE users (
  id text PRIMARY KEY,
  sites text[]  -- Array of site IDs
);
```

## Sample Data

### Sites

- **New York**: Coordinates (-74.0060, 40.7128), Status: online
- **Egypt**: Coordinates (31.2357, 30.0444), Status: online

### Users

- **shahar**: Has access to sites ["egypt", "newyowrk"]

## Frontend Features

- **Site List Sidebar**: Shows all sites for the logged-in user (hardcoded as "shahar")
- **Interactive Map**: MapLibre GL map displaying all site locations with markers
- **Status Badge**: Color-coded status (green=online, red=offline, yellow=maintenance)
- **Quick Updates**: Click a site card to select it; use the dropdown to update status
- **Responsive Design**: Works on desktop and mobile (sidebar → stacked layout)

## Environment Variables

For the frontend, you can set:

```bash
VITE_POSTGREST_URL=http://localhost:3000
```

Default is `http://localhost:3000` if not set.

## Troubleshooting

### Map not loading?
- Ensure PostgREST is running on port 3000
- Check browser console for CORS errors
- Verify sites table has geometry data

### Database connection failed?
```bash
# Check Docker logs
docker-compose logs db

# Verify Postgres is running
docker ps
```

### Frontend build errors?
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

## Next Steps

- Add user authentication (currently hardcoded as "shahar")
- Add geofencing / proximity alerts
- Real-time updates via WebSocket
- Export site data to GeoJSON
- Customize map base layer / styling

---

Made with ❤️ using Svelte, MapLibre, and PostgreSQL.
