# HomeVisit Copilot Instructions

## Architecture Overview

HomeVisit is a monorepo (pnpm workspaces) for aerial photography site visit management with:

- **apps/backend**: Express + TypeScript API (port 4000), connects to PostgREST (port 3000)
- **apps/frontend**: SvelteKit + Tailwind app (port 5173), RTL Hebrew interface
- **packages/common**: Shared TypeScript types used by both apps
- **postgres**: Docker Compose stack with PostGIS + PostgREST

**Data Flow**: Frontend → Backend API → PostgREST → PostgreSQL/PostGIS

## SOLID Principles & Code Structure

**Strictly enforced in this codebase:**

- **One type/class per file** - Never define multiple types or classes in a single file
- **Max 100 lines per file** - Split larger files into focused modules
- **Single responsibility** - Each class handles one logic only
- **Helper functions** - When a function needs multiple operations, split into helpers and orchestrate
- **Dependency injection** - Never instantiate dependencies inside classes, inject from outside
- **Interface contracts** - Use interfaces between classes/services, never couple directly

### Backend Service Directory Structure

Each service lives in its own directory with co-located interfaces:

```
services/
  serviceName/
    interfaces/
      IServiceName.ts    # Interface definition
      index.ts           # Interface exports
    serviceName.ts       # Implementation
    helperFunction.ts    # Helper functions (if needed)
    index.ts             # Service exports
```

Example: `services/site/interfaces/ISiteService.ts`

### Shared Types Directory Structure

Types in `packages/common` are organized by domain:

```
packages/common/src/models/
  site/       # Site, EnrichedSite, SeenStatus, UpdatedStatus
  user/       # User, AuthPayload
  filter/     # SiteFilters, FilterRequest
  enrichment/ # EnrichmentRequestBody, EnrichmentResponseBody
  history/    # SiteHistory, CoverUpdateEntry, MergedHistoryEntry
  group/      # Group
  api/        # ApiResponse types
  overlay/    # ElasticProviderOverlay, FilterSchema
```

## Development Workflow

```bash
# Start full stack (Docker + Backend + Frontend)
# Use VS Code task: "🚀 Start Full Development Stack"

# Or manually:
cd postgres && docker-compose up -d   # Start DB + PostgREST
cd apps/backend && npm run dev        # tsx watch mode (port 4000)
cd apps/frontend && npm run dev       # Vite dev server (port 5173)
```

**API Docs**: http://localhost:4000/api-docs (Swagger UI)

## Key Patterns

### Backend Dependency Injection

All dependencies injected via constructor. Factory pattern in `controllers/controllerFactory.ts`:

```typescript
const postgrestClient = new PostgRESTClient();
const siteService = new SiteService(postgrestClient);
const groupService = new GroupService(postgrestClient);
export const sitesController = new SitesController(siteService, groupService, ...);
```

### Shared Types

Import from `@homevisit/common` - never duplicate types between apps:

```typescript
import type { EnrichedSite, User, FilterRequest } from "@homevisit/common";
```

### Frontend Store Pattern

Svelte stores in `src/stores/visit/` with API clients separated:

- `visitStore.ts` - State management with Svelte writable
- `visitApiClient.ts` - HTTP communication (single responsibility)
- Types separated into individual files

### Response Helpers

Use utility functions in `utils/responseHelper.ts`:

```typescript
sendSuccess(res, data);
sendError(res, message, 500, error);
sendValidationError(res, "Missing required parameter");
```

## Frontend Conventions

- **RTL Layout**: All components use `dir="rtl"` - Hebrew is the primary language
- **No px units**: Use `%`, `rem`, or Tailwind relative classes only
- **Generic components**: Build components as reusable/generic as possible
- **Context separation**: Split Svelte context into separate files by concern
- **Component drilling**: Pass data via props, use Svelte context for deep sharing
- **Map library**: MapLibre GL for geographic visualization

### Figma-to-Code Workflow

Components map from Figma frames (see `apps/frontend/README.md` for element mapping):

- Frame IDs in comments help trace design → code
- Status types: בתהליך ביקור, אין איסוף, מחכה לביקור, בוצע, בוצע חלקית
- Dark theme (#000000 background, #141414 containers)

## Backend Services

| Service               | Directory                | Purpose                                 |
| --------------------- | ------------------------ | --------------------------------------- |
| `SiteService`         | `services/site/`         | CRUD operations for sites via PostgREST |
| `GroupService`        | `services/group/`        | Group management                        |
| `UserService`         | `services/user/`         | User data access                        |
| `EnrichmentService`   | `services/enrichment/`   | Calls external API to enrich site data  |
| `FilterService`       | `services/filter/`       | Runtime filtering logic                 |
| `SiteHistoryService`  | `services/siteHistory/`  | Site history tracking                   |
| `CoverUpdateService`  | `services/coverUpdate/`  | Cover update fetching                   |
| `HistoryMergeService` | `services/historyMerge/` | Merges cover and visit history          |
| `OverlayService`      | `services/overlay/`      | Fetches overlays from elastic provider  |
| `GeometryService`     | `services/geometry/`     | Geometry conversions                    |
| `PostgRESTClient`     | `services/postgrest/`    | HTTP client for PostgREST API           |

### External Enrichment Service

Configured in `config.json` at startup (loaded in `config/enrichmentConfig.ts`):

```typescript
// Request structure uses configurable keys:
{ [dataKey]: { text: geometries, text_id: siteNames }, [dateKey]: { StartTime: { From, To } } }
```

- Returns site status (`Full`, `Partial`, `No`) and project links
- Fallback: Sites get `updatedStatus: "No"` if service fails

## Configuration

- **Backend**: Zod-validated env vars in `config/env.ts` - fails fast on invalid config
- **Frontend**: Vite env vars with `VITE_` prefix in `config/env.ts`
- **Enrichment config**: External JSON loaded at startup (`config.json`)
- **Config types**: Separated in `config/types/` directory

## Database

PostGIS-enabled PostgreSQL via PostgREST API. Schema in `postgres/db/init.sql`.

- Geometries stored as WKT strings
- Use `@turf/turf` for geometry operations in backend

## Important Files

- `apps/backend/src/controllers/controllerFactory.ts` - DI composition root
- `apps/backend/src/services/index.ts` - All service exports
- `packages/common/src/models/` - All shared types (one type per file per subdirectory)
- `apps/frontend/src/stores/visit/` - Main frontend state
- `apps/backend/config.json` - External service configuration
