#!/bin/bash

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

echo "Testing database connection..."
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_USER"
echo "Database: $DB_NAME"

# Test connection
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 'Connection successful!' as status;"

# Get table count
echo -e "\nTable count:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"

# Get list of tables
echo -e "\nTables in the database:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

# Get record counts
echo -e "\nRecord counts:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 'Users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'Clients', COUNT(*) FROM clients UNION ALL SELECT 'Loan Types', COUNT(*) FROM loan_types UNION ALL SELECT 'Loans', COUNT(*) FROM loans ORDER BY table_name;"