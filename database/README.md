# Financial Management System Database

This directory contains the database schema, migrations, and maintenance scripts for the Financial Management System.

## Database Schema

The database is designed to support a financial management system for a microfinance organization. It includes tables for:

- Users and clients management
- Loan types and loan management
- EMI calculations and schedules
- Journal entries and accounting
- Transactions tracking
- SMS notifications
- Tax and financial reporting

## Directory Structure

- `schema.sql`: Complete database schema with tables, indexes, constraints, and triggers
- `migrations/`: Database migration scripts for versioned deployment
- `backup/`: Backup and restore scripts for database maintenance

## Database Migrations

The migrations are numbered sequentially and should be applied in order:

1. `001_initial_schema.sql`: Creates the initial database schema
2. `002_seed_data.sql`: Populates the database with initial seed data
3. `003_sample_data.sql`: Adds sample data for testing
4. `004_performance_indexes.sql`: Adds additional indexes for query optimization
5. `005_maintenance_procedures.sql`: Adds maintenance procedures and functions

## Entity Relationship Diagram

The database follows this high-level entity relationship model:

```
Users 1──┐
         │
         └──1 Clients 1──┐
                         │
                         └──* Loans 1──┐
                                       │
                                       ├──* Loan Transactions
                                       │
                                       └──* EMI Schedule
```

## Key Tables

### Users and Clients

- `users`: Base table for all users (admins, staff, clients)
- `clients`: Extends users table for clients with account information

### Loans and Transactions

- `loan_types`: Defines different loan products
- `loans`: Stores loan information
- `loan_transactions`: Records loan payments
- `emi_schedule`: Stores EMI schedule for loans

### Accounting

- `chart_of_accounts`: Chart of accounts for accounting
- `journal_entries`: Journal entries for accounting
- `journal_entry_details`: Line items for journal entries
- `transactions`: Financial transactions

### Notifications

- `sms_templates`: Templates for SMS notifications
- `sms_logs`: Log of sent SMS messages

### Reporting

- `tax_rates`: Tax rates for financial calculations
- `tax_reports`: Generated tax reports
- `financial_reports`: Generated financial reports

## Backup and Restore

To backup the database:

```bash
cd /home/notcool/Desktop/financial-management-system/database/backup
chmod +x backup_script.sh
./backup_script.sh
```

To restore the database:

```bash
cd /home/notcool/Desktop/financial-management-system/database/backup
chmod +x restore_script.sh
./restore_script.sh backup_2023-09-01_12-00-00.sql.gz
```

## Database Maintenance

The database includes several maintenance procedures:

- `maintenance_vacuum_analyze()`: Vacuums and analyzes tables for performance
- `cleanup_old_audit_logs(days)`: Cleans up old audit logs

## Security Features

The database implements several security features:

- Password hashing using pgcrypto
- Audit logging for all important tables
- Role-based access control

## Performance Optimization

The database is optimized for performance with:

- Strategic indexes on frequently queried columns
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- Function-based indexes for complex conditions