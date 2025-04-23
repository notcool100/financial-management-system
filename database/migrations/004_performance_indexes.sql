-- Migration: 004_performance_indexes.sql
-- Description: Additional indexes for query optimization
-- Created: 2023-09-01

BEGIN;

-- Create extension for trigram-based text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Composite indexes for frequently used queries

-- Clients table - for filtering by account type and status
CREATE INDEX idx_clients_account_type_status ON clients(account_type, status);

-- Loans table - for filtering by status and date range
CREATE INDEX idx_loans_status_disburse_date ON loans(status, disburse_date);

-- Loans table - for client loans with status
CREATE INDEX idx_loans_client_id_status ON loans(client_id, status);

-- Loan transactions - for date range queries
CREATE INDEX idx_loan_transactions_payment_date_range ON loan_transactions(payment_date, loan_id);

-- EMI schedule - for finding upcoming payments
CREATE INDEX idx_emi_schedule_due_date_is_paid ON emi_schedule(due_date, is_paid);

-- Journal entries - for date range and posting status
CREATE INDEX idx_journal_entries_date_posted ON journal_entries(entry_date, is_posted);

-- Transactions - for client transaction history by date
CREATE INDEX idx_transactions_client_id_date ON transactions(client_id, transaction_date);

-- SMS logs - for client SMS history
CREATE INDEX idx_sms_logs_client_id_sent_at ON sms_logs(client_id, sent_at);

-- Partial indexes for common filtered queries

-- Active loans
CREATE INDEX idx_active_loans ON loans(client_id, disburse_date)
WHERE status = 'active';

-- Unpaid EMIs
CREATE INDEX idx_unpaid_emis ON emi_schedule(loan_id, due_date)
WHERE is_paid = FALSE;

-- Pending SMS
CREATE INDEX idx_pending_sms ON sms_logs(created_at)
WHERE status = 'pending';

-- Active clients
CREATE INDEX idx_active_clients ON clients(account_type, date_created)
WHERE status = 'active';

-- Create GIN index for JSONB columns for efficient JSON querying
CREATE INDEX idx_tax_reports_data ON tax_reports USING GIN (report_data);
CREATE INDEX idx_financial_reports_data ON financial_reports USING GIN (report_data);
CREATE INDEX idx_audit_logs_old_values ON audit_logs USING GIN (old_values);
CREATE INDEX idx_audit_logs_new_values ON audit_logs USING GIN (new_values);

-- Create indexes for full-text search on descriptions
CREATE INDEX idx_journal_entries_description_trgm ON journal_entries USING GIN (description gin_trgm_ops);
CREATE INDEX idx_transactions_description_trgm ON transactions USING GIN (description gin_trgm_ops);

COMMIT;