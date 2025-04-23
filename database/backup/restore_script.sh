#!/bin/bash

# Database restore script for Financial Management System
# This script restores a backup of the PostgreSQL database

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

BACKUP_DIR="/home/notcool/Desktop/financial-management-system/database/backup"
LOG_FILE="$BACKUP_DIR/restore_log.txt"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Error: No backup file specified"
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_FILE does not exist"
    exit 1
fi

# Log start of restore
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
echo "Starting restore at $DATE" >> $LOG_FILE
echo "Restoring from: $BACKUP_FILE" >> $LOG_FILE

# If file is compressed, uncompress it
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Uncompressing backup file..." >> $LOG_FILE
    gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Perform the restore
echo "Restoring database..." >> $LOG_FILE

# Drop and recreate the database
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Restore the backup
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$BACKUP_FILE"

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo "Restore completed successfully" >> $LOG_FILE
else
    echo "Restore failed" >> $LOG_FILE
fi

# Log end of restore
echo "Restore process completed at $(date +"%Y-%m-%d_%H-%M-%S")" >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE