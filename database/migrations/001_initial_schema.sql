-- Migration: 001_initial_schema.sql
-- Description: Initial database schema setup
-- Created: 2023-09-01

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE account_type AS ENUM ('SB', 'BB', 'MB'); -- Sadaran Bachat, Baal Bachat, Masik Bachat
CREATE TYPE user_status AS ENUM ('active', 'pending', 'inactive');
CREATE TYPE loan_type AS ENUM ('flat', 'diminishing');
CREATE TYPE loan_status AS ENUM ('active', 'pending', 'closed', 'defaulted');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'loan_disbursement', 'loan_payment', 'interest_payment', 'fee');
CREATE TYPE sms_type AS ENUM ('reminder', 'onboarding', 'notification', 'statement');
CREATE TYPE sms_status AS ENUM ('sent', 'failed', 'pending');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);

-- Clients table (extends users for clients with accounts)
CREATE TABLE clients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    account_type account_type NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status user_status NOT NULL DEFAULT 'pending',
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    date_created DATE NOT NULL DEFAULT CURRENT_DATE,
    last_transaction_date TIMESTAMP WITH TIME ZONE
);

-- Create indexes on clients
CREATE INDEX idx_clients_account_number ON clients(account_number);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_account_type ON clients(account_type);

-- Loan Types table
CREATE TABLE loan_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    interest_rate DECIMAL(5, 2) NOT NULL,
    processing_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    late_fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    min_amount DECIMAL(15, 2) NOT NULL,
    max_amount DECIMAL(15, 2) NOT NULL,
    min_tenure_months INTEGER NOT NULL,
    max_tenure_months INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on loan_types
CREATE INDEX idx_loan_types_active ON loan_types(is_active);

-- Loans table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    loan_type_id UUID NOT NULL REFERENCES loan_types(id) ON DELETE RESTRICT,
    calculation_type loan_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    emi_amount DECIMAL(15, 2) NOT NULL,
    disburse_date DATE NOT NULL,
    end_date DATE NOT NULL,
    processing_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_interest DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    status loan_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on loans
CREATE INDEX idx_loans_client_id ON loans(client_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_disburse_date ON loans(disburse_date);

-- Loan Transactions table
CREATE TABLE loan_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    amount DECIMAL(15, 2) NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_amount DECIMAL(15, 2) NOT NULL,
    late_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    is_late_payment BOOLEAN NOT NULL DEFAULT FALSE,
    remaining_principal DECIMAL(15, 2) NOT NULL,
    transaction_reference VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on loan_transactions
CREATE INDEX idx_loan_transactions_loan_id ON loan_transactions(loan_id);
CREATE INDEX idx_loan_transactions_payment_date ON loan_transactions(payment_date);
CREATE INDEX idx_loan_transactions_due_date ON loan_transactions(due_date);

-- EMI Schedule table
CREATE TABLE emi_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    emi_amount DECIMAL(15, 2) NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_amount DECIMAL(15, 2) NOT NULL,
    remaining_principal DECIMAL(15, 2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_date DATE,
    payment_transaction_id UUID REFERENCES loan_transactions(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on emi_schedule
CREATE INDEX idx_emi_schedule_loan_id ON emi_schedule(loan_id);
CREATE INDEX idx_emi_schedule_due_date ON emi_schedule(due_date);
CREATE INDEX idx_emi_schedule_is_paid ON emi_schedule(is_paid);

-- Chart of Accounts table
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code VARCHAR(20) NOT NULL UNIQUE,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on chart_of_accounts
CREATE INDEX idx_chart_of_accounts_account_code ON chart_of_accounts(account_code);
CREATE INDEX idx_chart_of_accounts_account_type ON chart_of_accounts(account_type);
CREATE INDEX idx_chart_of_accounts_parent_id ON chart_of_accounts(parent_account_id);

-- Journal Entries table
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_date DATE NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    is_posted BOOLEAN NOT NULL DEFAULT FALSE,
    posted_by UUID REFERENCES users(id),
    posted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on journal_entries
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_reference_number ON journal_entries(reference_number);
CREATE INDEX idx_journal_entries_is_posted ON journal_entries(is_posted);

-- Journal Entry Details table
CREATE TABLE journal_entry_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    debit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    credit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on journal_entry_details
CREATE INDEX idx_journal_entry_details_journal_id ON journal_entry_details(journal_entry_id);
CREATE INDEX idx_journal_entry_details_account_id ON journal_entry_details(account_id);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reference_number VARCHAR(50),
    description TEXT,
    related_loan_id UUID REFERENCES loans(id),
    journal_entry_id UUID REFERENCES journal_entries(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on transactions
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_related_loan_id ON transactions(related_loan_id);

-- SMS Templates table
CREATE TABLE sms_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    template_text TEXT NOT NULL,
    template_type sms_type NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on sms_templates
CREATE INDEX idx_sms_templates_template_type ON sms_templates(template_type);
CREATE INDEX idx_sms_templates_is_active ON sms_templates(is_active);

-- SMS Logs table
CREATE TABLE sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    template_id UUID REFERENCES sms_templates(id) ON DELETE SET NULL,
    status sms_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on sms_logs
CREATE INDEX idx_sms_logs_client_id ON sms_logs(client_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at);

-- Tax Rates table
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on tax_rates
CREATE INDEX idx_tax_rates_is_active ON tax_rates(is_active);
CREATE INDEX idx_tax_rates_effective_dates ON tax_rates(effective_from, effective_to);

-- Tax Reports table
CREATE TABLE tax_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_taxable_amount DECIMAL(15, 2) NOT NULL,
    total_tax_amount DECIMAL(15, 2) NOT NULL,
    report_data JSONB NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- Create indexes on tax_reports
CREATE INDEX idx_tax_reports_date_range ON tax_reports(start_date, end_date);
CREATE INDEX idx_tax_reports_report_type ON tax_reports(report_type);

-- Financial Reports table
CREATE TABLE financial_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    report_data JSONB NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- Create indexes on financial_reports
CREATE INDEX idx_financial_reports_date_range ON financial_reports(start_date, end_date);
CREATE INDEX idx_financial_reports_report_type ON financial_reports(report_type);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes on audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- System Settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    is_editable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on system_settings
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values
        ) VALUES (
            current_setting('app.current_user_id', true)::UUID,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD),
            NULL
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values
        ) VALUES (
            current_setting('app.current_user_id', true)::UUID,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values
        ) VALUES (
            current_setting('app.current_user_id', true)::UUID,
            'INSERT',
            TG_TABLE_NAME,
            NEW.id,
            NULL,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER audit_clients_trigger
AFTER INSERT OR UPDATE OR DELETE ON clients
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER audit_loans_trigger
AFTER INSERT OR UPDATE OR DELETE ON loans
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER audit_loan_transactions_trigger
AFTER INSERT OR UPDATE OR DELETE ON loan_transactions
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER audit_journal_entries_trigger
AFTER INSERT OR UPDATE OR DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER audit_transactions_trigger
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- Create function to update client balance
CREATE OR REPLACE FUNCTION update_client_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.transaction_type = 'deposit' THEN
            UPDATE clients SET 
                balance = balance + NEW.amount,
                last_transaction_date = NEW.transaction_date,
                updated_at = NOW()
            WHERE id = NEW.client_id;
        ELSIF NEW.transaction_type IN ('withdrawal', 'loan_disbursement') THEN
            UPDATE clients SET 
                balance = balance - NEW.amount,
                last_transaction_date = NEW.transaction_date,
                updated_at = NOW()
            WHERE id = NEW.client_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to update client balance on transaction
CREATE TRIGGER update_client_balance_trigger
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_client_balance();

-- Create function to update loan status and remaining amount
CREATE OR REPLACE FUNCTION update_loan_after_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the remaining amount in the loan
    UPDATE loans SET 
        remaining_amount = NEW.remaining_principal,
        updated_at = NOW(),
        status = CASE 
            WHEN NEW.remaining_principal <= 0 THEN 'closed'::loan_status
            ELSE status
        END
    WHERE id = NEW.loan_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to update loan after payment
CREATE TRIGGER update_loan_after_payment_trigger
AFTER INSERT ON loan_transactions
FOR EACH ROW EXECUTE FUNCTION update_loan_after_payment();

-- Create function to update EMI schedule after payment
CREATE OR REPLACE FUNCTION update_emi_schedule_after_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the EMI schedule entry
    UPDATE emi_schedule SET 
        is_paid = TRUE,
        payment_date = NEW.payment_date,
        payment_transaction_id = NEW.id
    WHERE loan_id = NEW.loan_id 
    AND installment_number = (
        SELECT MIN(installment_number) 
        FROM emi_schedule 
        WHERE loan_id = NEW.loan_id AND is_paid = FALSE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to update EMI schedule after payment
CREATE TRIGGER update_emi_schedule_after_payment_trigger
AFTER INSERT ON loan_transactions
FOR EACH ROW EXECUTE FUNCTION update_emi_schedule_after_payment();

COMMIT;