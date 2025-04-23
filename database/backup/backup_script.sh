#!/bin/bash

# Database backup script for Financial Management System
# This script creates a backup of the PostgreSQL database

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
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"
LOG_FILE="$BACKUP_DIR/backup_log.txt"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log start of backup
echo "Starting backup at $DATE" >> $LOG_FILE

# Perform the backup
echo "Creating backup: $BACKUP_FILE" >> $LOG_FILE
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F p -f $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully" >> $LOG_FILE
    
    # Compress the backup file
    gzip $BACKUP_FILE
    echo "Backup compressed: $BACKUP_FILE.gz" >> $LOG_FILE
    
    # Remove backups older than 30 days
    find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +30 -delete
    echo "Old backups cleaned up" >> $LOG_FILE
else
    echo "Backup failed" >> $LOG_FILE
fi

# Log end of backup
echo "Backup process completed at $(date +"%Y-%m-%d_%H-%M-%S")" >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE