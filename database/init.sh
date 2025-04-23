#!/bin/bash

# Database initialization script for Financial Management System
# This script creates the database and applies all migrations

# Parse the DATABASE_URL from .env file
ENV_FILE="/home/notcool/Desktop/financial-management-system/.env"
if [ -f "$ENV_FILE" ]; then
    # Extract database connection details from DATABASE_URL
    DB_URL=$(grep DATABASE_URL "$ENV_FILE" | cut -d '"' -f 2)
    
    # Parse the connection string
    DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    echo "Using database configuration from .env file"
else
    # Default configuration if .env file doesn't exist
    DB_USER="postgres"
    DB_PASS="yourdad"
    DB_HOST="localhost"
    DB_PORT="5432"
    DB_NAME="microfinance"
    
    echo "Warning: .env file not found, using default configuration"
fi

# Set PGPASSWORD environment variable for passwordless connection
export PGPASSWORD="$DB_PASS"

MIGRATIONS_DIR="/home/notcool/Desktop/financial-management-system/database/migrations"
LOG_FILE="/home/notcool/Desktop/financial-management-system/database/init_log.txt"

# Log start of initialization
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
echo "Starting database initialization at $DATE" > $LOG_FILE

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..." >> $LOG_FILE
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Apply migrations in order
echo "Applying migrations..." >> $LOG_FILE

# Get all migration files sorted by name
MIGRATIONS=$(find $MIGRATIONS_DIR -name "*.sql" | sort)

for migration in $MIGRATIONS; do
    echo "Applying migration: $(basename $migration)" >> $LOG_FILE
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migration
    
    if [ $? -eq 0 ]; then
        echo "Migration $(basename $migration) applied successfully" >> $LOG_FILE
    else
        echo "Error applying migration $(basename $migration)" >> $LOG_FILE
        echo "Initialization failed" >> $LOG_FILE
        exit 1
    fi
done

# Log end of initialization
echo "Database initialization completed at $(date +"%Y-%m-%d_%H-%M-%S")" >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE

echo "Database initialization completed successfully. See $LOG_FILE for details."