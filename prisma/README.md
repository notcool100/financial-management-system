# Prisma Schema for Financial Management System

This directory contains the Prisma schema and related files for the Financial Management System.

## Overview

The Prisma schema defines the data model for the application, mapping to the PostgreSQL database tables. It includes models for:

- Users and clients
- Loans and loan transactions
- EMI schedules
- Accounting (chart of accounts, journal entries)
- Transactions
- SMS notifications
- Reporting

## Files

- `schema.prisma`: The Prisma schema file defining the data model
- `generate.sh`: Script to generate the Prisma client

## Usage

### Generate Prisma Client

To generate the Prisma client after making changes to the schema:

```bash
cd /home/notcool/Desktop/financial-management-system/prisma
./generate.sh
```

Or run:

```bash
npx prisma generate
```

### Database Migrations with Prisma

To create a new migration after changing the schema:

```bash
npx prisma migrate dev --name migration_name
```

To apply migrations in production:

```bash
npx prisma migrate deploy
```

## Model Relationships

The schema defines the following key relationships:

- `User` ↔ `Client`: One-to-one relationship (a client is a user with additional attributes)
- `Client` ↔ `Loan`: One-to-many relationship (a client can have multiple loans)
- `Loan` ↔ `LoanTransaction`: One-to-many relationship (a loan can have multiple transactions)
- `Loan` ↔ `EmiSchedule`: One-to-many relationship (a loan has multiple EMI schedule entries)
- `ChartOfAccount` ↔ `JournalEntryDetail`: One-to-many relationship (an account can be used in multiple journal entries)

## Environment Variables

The Prisma schema uses the `DATABASE_URL` environment variable from the `.env` file to connect to the database. Make sure this variable is properly set:

```
DATABASE_URL="postgresql://postgres:yourdad@localhost:5432/microfinance?schema=public"
```

## Notes

- The schema uses UUID as the primary key type for all models
- Timestamps are stored with timezone information
- Decimal fields use appropriate precision for financial calculations
- Enums are used for fields with a fixed set of possible values