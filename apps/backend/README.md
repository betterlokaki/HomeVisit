# HomeVisit Backend API

Node.js/Express backend service that enriches site data with dynamic calculations.

## Features

- ✅ TypeScript for type safety
- ✅ Express server with best practices
- ✅ PostgREST integration
- ✅ Async status calculation (simulated)
- ✅ Random site link generation
- ✅ Comprehensive logging
- ✅ CORS enabled
- ✅ Error handling & validation

## Architecture

```
src/
├── server.ts              # Main Express server
├── config/
│   └── env.ts            # Environment configuration
├── middleware/
│   └── logger.ts         # Logging utility
├── services/
│   └── postgrestService.ts  # PostgREST API client
├── controllers/
│   └── sitesController.ts   # Business logic
├── routes/
│   └── sitesRoutes.ts    # API endpoints
└── utils/
    └── siteEnricher.ts   # Site data enrichment functions
```

## Installation

```bash
npm install
```

## Running

### Development (with watch mode)

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and configuration.

### Get User Sites

```
GET /sites/userSites?user_id=1
```

**Query Parameters:**

- `user_id` (required): The ID of the user

**Response:**

```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "sites": [
      {
        "site_id": 1,
        "site_code": "NYC",
        "name": "New York",
        "geometry": {...},
        "status": "online",
        "last_seen": "2025-11-16T...",
        "last_data": "2025-11-16T...",
        "created_at": "2025-11-16T...",
        "updated_at": "2025-11-16T...",
        "updatedStatus": "Full",
        "siteLink": "https://site-abc123-def456.homevisit.local"
      }
    ]
  }
}
```

## Data Enrichment

Each site is enriched with two additional fields:

### `updatedStatus`

- Calculated asynchronously with a 1-second delay (simulating real-world calculation)
- Returns one of: `Full`, `Partial`, `No`
- Randomly selected from closed list

### `siteLink`

- Randomly generated string in URL format
- Example: `https://site-abc123-def456.homevisit.local`

## Configuration

Configuration is managed via environment variables (see `.env`):

- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment mode (development/production)
- `POSTGREST_URL`: PostgREST API URL (default: http://localhost:3000)
- `LOG_LEVEL`: Logging level (default: info)

## Dependencies

### Production

- `express`: Web framework
- `axios`: HTTP client for PostgREST
- `cors`: CORS middleware
- `dotenv`: Environment configuration

### Development

- `typescript`: Type safety
- `@types/express`, `@types/node`: Type definitions
- `nodemon`: Auto-restart on file changes
