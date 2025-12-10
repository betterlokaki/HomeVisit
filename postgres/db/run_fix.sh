#!/bin/bash
# Script to fix duplicate history entries in the database

echo "Fixing duplicate history entries..."

# Get database connection details from docker-compose
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-homevisit}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

# Run the fix script
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f fix_duplicates.sql

echo "Done! Check the output above for any remaining duplicates."

