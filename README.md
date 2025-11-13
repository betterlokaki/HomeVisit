# HomeVisit - Minimal Self-Hosted Backend & Web UI

A minimal self-hosted backend with Postgres + PostGIS + PostgREST, and a beautiful Svelte UI for site management and authentication.

## Architecture

- **Backend**: PostgreSQL + PostGIS (geographic data) + PostgREST (auto-generated REST API)
- **Frontend**: Svelte 4 + Vite + MapLibre GL JS (map visualization)
- **Database**: Normalized relational schema with user authentication and site assignments
- **Deployment**: Docker Compose (all-in-one)

## Features

- ✅ User authentication (username/password)
- ✅ User registration with validation
- ✅ PostgreSQL + PostGIS for geographic data
- ✅ PostgREST auto-generated REST API with RPC functions
- ✅ Beautiful Svelte UI with authentication pages
- ✅ Interactive MapLibre GL map showing site locations
- ✅ Real-time site status management (online/offline/maintenance)
- ✅ localStorage-based session persistence
- ✅ Responsive design (desktop & mobile)
- ✅ Docker-based self-hosting

## Project Structure

```
.
├── docker-compose.yml          # Docker Compose config (Postgres + PostgREST)
├── postgrest.conf              # PostgREST configuration (via env vars)
├── db/
│   └── init.sql                # Database schema, functions, seed data
├── src/
│   ├── main.ts                 # Svelte app entry point
│   ├── App.svelte              # Root component (router)
│   ├── stores/
│   │   ├── auth.ts             # Authentication store (login/register/logout)
│   │   └── sites.ts            # Sites store (CRUD operations)
│   ├── pages/
│   │   ├── Login.svelte        # Login page
│   │   ├── Register.svelte     # Registration page
│   │   └── Dashboard.svelte    # Main dashboard (sites list + map)
│   └── components/
│       ├── SiteList.svelte     # Sites sidebar list
│       ├── SiteCard.svelte     # Individual site card
│       └── Map.svelte          # MapLibre GL map component
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite build configuration
├── svelte.config.js            # Svelte preprocessor config
├── tsconfig.json               # TypeScript configuration
├── index.html                  # HTML entry point
└── .gitignore                  # Git ignore rules
```

## Quick Start

### 1. Start Backend (Docker)

```bash
cd /Users/shaharrozolio/Documents/Code/Projects/Python/HomeVisit
docker-compose up -d
```

This starts:
- **Postgres + PostGIS** on `localhost:5432` (user: postgres, password: postgres)
- **PostgREST** on `http://localhost:3000`

The database is automatically initialized with:
- User authentication schema (users, user_sites tables)
- Site and geographic data
- RPC functions for auth and site management
- Sample user (username: `demo`, password: `password`)

### 2. Start Frontend (Dev Server)

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

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Sites Table

```sql
CREATE TABLE sites (
  site_id BIGSERIAL PRIMARY KEY,
  site_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  geometry geometry(Point, 4326) NOT NULL,  -- PostGIS Point with EPSG:4326
  status site_status DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT now(),
  last_data TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### User Sites (Many-to-Many)

```sql
CREATE TABLE user_sites (
  user_site_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id),
  site_id BIGINT NOT NULL REFERENCES sites(site_id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, site_id)
);
```

### Enum: site_status

```sql
CREATE TYPE site_status AS ENUM ('online', 'offline', 'maintenance');
```

## API Endpoints

All served by PostgREST on `http://localhost:3000`

### RPC Functions

#### 1. Register User

```bash
POST /rpc/register_user
Content-Type: application/json

{
  "p_username": "newuser",
  "p_password": "password123"
}

Response: [123]  # User ID
```

#### 2. Authenticate User

```bash
POST /rpc/authenticate_user
Content-Type: application/json

{
  "p_username": "demo",
  "p_password": "password"
}

Response: [1]  # User ID if valid, NULL if invalid
```

#### 3. Get User Sites

```bash
POST /rpc/get_user_sites
Content-Type: application/json

{
  "p_user_id": 1
}

Response: [
  {
    "site_id": 1,
    "site_code": "NYC",
    "name": "New York",
    "geometry": { "type": "Point", "coordinates": [-74.006, 40.7128], ... },
    "status": "online",
    "last_seen": "2025-11-13T15:38:47...",
    "last_data": "2025-11-13T15:38:47...",
    ...
  },
  ...
]
```

#### 4. Update Site Status

```bash
POST /rpc/update_site_status
Content-Type: application/json

{
  "p_site_id": 1,
  "p_new_status": "maintenance"
}
```

### Direct Table Access

- `GET /users` — List all users
- `GET /sites` — List all sites
- `GET /user_sites` — List all user-site assignments

## Frontend Architecture

### Stores

**Auth Store** (`src/stores/auth.ts`)
- Manages login, registration, logout
- Persists auth state to localStorage
- Reactive subscription to auth changes

**Sites Store** (`src/stores/sites.ts`)
- Manages site data for current user
- Handles site status updates
- Optimistic UI updates

### Components

**SiteList** — Sidebar displaying all user sites with status badges and quick actions

**SiteCard** — Individual site card showing code, coordinates, timestamps, and status dropdown

**Map** — MapLibre GL map with color-coded markers (green=online, red=offline, yellow=maintenance)

## Authentication Flow

1. **Login Page** → User enters username & password
2. **Authenticate** → Backend verifies credentials via `authenticate_user` RPC
3. **Store Auth** → Auth store saves user ID & username to localStorage
4. **Redirect** → App detects auth state and navigates to Dashboard
5. **Load Data** → Dashboard fetches user sites via `get_user_sites` RPC
6. **Display** → Sites shown in sidebar list and on map

## Development

### Environment Variables

```bash
# .env (optional, defaults to localhost)
VITE_POSTGREST_URL=http://localhost:3000
```

### Svelte Best Practices Used

✅ Reactive declarations (`$:`)
✅ Component event dispatching
✅ Derived stores
✅ Proper TypeScript typing
✅ JSDoc comments on files and functions
✅ Scoped styles (CSS in components)
✅ Accessible form inputs
✅ Error handling and loading states

### PostgreSQL Best Practices

✅ Normalized schema (users, sites, user_sites)
✅ Proper indexes on frequently queried columns
✅ Constraints (NOT NULL, UNIQUE, FK)
✅ Timestamps (created_at, updated_at)
✅ Documented RPC functions with JSDoc
✅ Secure SECURITY DEFINER functions
✅ Proper role and permission management

## Sample Data

### Users

- Username: `demo`
- Password: `password`
- Sites: New York, Egypt

### Sites

- **New York** (NYC): (-74.0060, 40.7128), Status: online
- **Egypt** (EGYPT): (31.2357, 30.0444), Status: online

## Troubleshooting

### Backend Issues

```bash
# Check Docker logs
docker-compose logs db
docker-compose logs postgrest

# Verify services running
docker ps

# Test PostgREST
curl http://localhost:3000/sites
```

### Frontend Issues

```bash
# Clear build cache
rm -rf node_modules dist .svelte-kit
npm install
npm run dev

# Check console for errors (F12 Dev Tools)
# Check Network tab for API calls
```

### Database Connection Failed

```bash
# Restart containers
docker-compose restart

# Nuke and rebuild
docker-compose down -v
docker-compose up -d
```

## Production Notes

⚠️ **Security Warnings:**
- Passwords are stored as plain text for demo - use bcrypt in production
- PostgREST has no API key authentication - add JWT in production
- Database password is hardcoded - use secrets management
- Allow CORS carefully in production
- Use HTTPS/TLS for all connections
- Validate and sanitize all inputs

## Next Steps

- [ ] Add JWT authentication to PostgREST
- [ ] Hash passwords with bcrypt on registration
- [ ] Add email verification
- [ ] Implement password reset flow
- [ ] Add role-based access control (RBAC)
- [ ] Add geofencing / proximity alerts
- [ ] Real-time updates via WebSocket
- [ ] Export site data to GeoJSON
- [ ] Custom map base layers / styling
- [ ] Site creation/deletion UI
- [ ] User profile / settings page
- [ ] Database backups and migrations

---

Made with ❤️ using Svelte, MapLibre, PostgreSQL, and PostgREST.
