# SeenStatus Refresh Feature Testing Guide

## Overview

This feature automatically refreshes the `seen_status` of sites back to "Not Seen" after a configurable countdown timer expires (default: 30 minutes).

## How It Works

1. **Database Schema Changes**:

   - Added `status_changed_at` timestamp column to the `sites` table
   - Automatically updated whenever `seen_status` changes via a PostgreSQL trigger

2. **Scheduler Service**:

   - Runs on backend startup
   - Fetches all groups and their refresh intervals from the database
   - Sets up periodic timers to check for expired statuses

3. **Refresh Logic**:
   - Every group has a `data_refreshments` interval (in milliseconds) defined in the `groups` table
   - The scheduler checks every 1/30th of the interval (e.g., every 1 minute for 30-minute intervals)
   - When the countdown expires for a site with status "Seen" or "Partial", it resets to "Not Seen"

## Database Configuration

The `groups` table has a `data_refreshments` column (default: 30000 milliseconds = 30 seconds for quick testing, or 1800000 ms = 30 minutes for production):

```sql
-- View current group refresh intervals
SELECT group_id, group_name, data_refreshments
FROM groups;

-- Update refresh interval for a group (e.g., to 5 minutes = 300000 ms)
UPDATE groups
SET data_refreshments = 300000
WHERE group_id = 1;
```

## Testing Steps

### Quick Test (with 30-second intervals)

1. **Update the test group to use 30-second refresh intervals**:

   ```sql
   UPDATE groups
   SET data_refreshments = 30000
   WHERE group_id = 1;
   ```

2. **Restart the backend server**:

   ```bash
   npm run dev
   ```

   You should see in the logs:

   ```
   🔄 Starting Status Refresh Scheduler
   📅 Scheduling refresh for group 1 (interval: 30000ms, check every: 1000ms)
   ```

3. **Mark a site as "Seen"**:

   ```sql
   UPDATE sites
   SET seen_status = 'Seen'
   WHERE site_id = 1;

   -- Verify the status was updated
   SELECT site_id, site_name, seen_status, status_changed_at
   FROM sites
   WHERE site_id = 1;
   ```

4. **Wait for refresh** (approximately 30 seconds):
   - Check the backend logs for a message like:
     ```
     ✅ Refreshed 1 site(s) for group 1
     ```
   - Verify the status in the database:
     ```sql
     SELECT site_id, site_name, seen_status, status_changed_at
     FROM sites
     WHERE site_id = 1;
     ```
   - The `seen_status` should now be "Not Seen"

### Production Test (30-minute intervals)

1. **Update the group to use 30-minute intervals**:

   ```sql
   UPDATE groups
   SET data_refreshments = 1800000  -- 30 minutes in milliseconds
   WHERE group_id = 1;
   ```

2. **Restart the backend**:

   ```bash
   npm run dev
   ```

3. **Mark a site as "Seen"**:

   ```sql
   UPDATE sites
   SET seen_status = 'Seen'
   WHERE site_id = 1;
   ```

4. **Wait 30 minutes** and verify the status has been reset

## Monitoring

### View Scheduler Status

Create an optional endpoint to check scheduler status (optional implementation):

```typescript
// In routes/health.ts or new routes/debug.ts
app.get("/debug/scheduler-status", (req, res) => {
  res.json(statusRefreshScheduler.getStatus());
});
```

### Backend Logs

Look for these log messages:

- ✅ Successful scheduler startup
- 📅 Group schedule initialization
- ✅ Successful refreshes (with count)
- ⚠️ Any errors during refresh

## Stopping the Scheduler

The scheduler automatically stops when the backend shuts down. You can also manually stop it:

```typescript
statusRefreshScheduler.stop();
```

## Troubleshooting

### Scheduler Not Starting

Check the backend logs for error messages. Common issues:

- Database connection failure
- Groups table is empty or unavailable
- PostgREST is not running

### Statuses Not Refreshing

1. Verify the `status_changed_at` timestamp is being set:

   ```sql
   SELECT site_id, seen_status, status_changed_at
   FROM sites;
   ```

2. Check that `data_refreshments` is configured for the group:

   ```sql
   SELECT * FROM groups WHERE group_id = 1;
   ```

3. Verify the scheduler is running by checking backend logs

## Architecture

```
Backend Startup
    ↓
statusRefreshScheduler.start()
    ↓
Fetch all groups from database
    ↓
For each group:
  - Create periodic timer (every 1/30th of refresh interval)
  - On each timer tick:
    - Call refreshExpiredStatuses(groupId)
    - Update sites where:
      - seen_status IN ('Seen', 'Partial')
      - status_changed_at + data_refreshments <= NOW()
    - Set seen_status = 'Not Seen' for matching sites
```

## API Contract

No new API endpoints were added. The refresh happens silently on the backend.

**Database Functions Available**:

- `refresh_expired_statuses(group_id)` - Returns count of refreshed sites
- Automatically called by the scheduler every N seconds
