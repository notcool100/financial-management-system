-- Database schema for Financial Management System

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'client')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  account_number VARCHAR(20) UNIQUE NOT NULL,
  account_type VARCHAR(5) NOT NULL CHECK (account_type IN ('SB', 'BB', 'MB')),
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
  kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Loan Types table
CREATE TABLE IF NOT EXISTS loan_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  interest_rate DECIMAL(5, 2) NOT NULL,
  min_amount DECIMAL(15, 2) NOT NULL,
  max_amount DECIMAL(15, 2) NOT NULL,
  min_tenure_months INTEGER NOT NULL,
  max_tenure_months INTEGER NOT NULL,
  processing_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  late_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  loan_type_id UUID NOT NULL REFERENCES loan_types(id),
  calculation_type VARCHAR(20) NOT NULL CHECK (calculation_type IN ('flat', 'diminishing')),
  amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  emi_amount DECIMAL(15, 2) NOT NULL,
  disburse_date DATE NOT NULL,
  end_date DATE NOT NULL,
  processing_fee DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_interest DECIMAL(15, 2) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  remaining_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed', 'defaulted')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- EMI Schedule table
CREATE TABLE IF NOT EXISTS emi_schedule (
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
  payment_transaction_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Loan Transactions table
CREATE TABLE IF NOT EXISTS loan_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL,
  interest_amount DECIMAL(15, 2) NOT NULL,
  late_fee DECIMAL(15, 2) NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  is_late_payment BOOLEAN NOT NULL DEFAULT FALSE,
  remaining_principal DECIMAL(15, 2) NOT NULL,
  transaction_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'loan_disbursement', 'loan_payment', 'interest_payment', 'fee')),
  amount DECIMAL(15, 2) NOT NULL,
  transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
  reference_number VARCHAR(100),
  description TEXT,
  related_loan_id UUID REFERENCES loans(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chart of Accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_code VARCHAR(20) UNIQUE NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Journal Entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_date DATE NOT NULL,
  reference_number VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  is_posted BOOLEAN NOT NULL DEFAULT FALSE,
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Journal Entry Details table
CREATE TABLE IF NOT EXISTS journal_entry_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  debit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  credit_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SMS Templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  template_text TEXT NOT NULL,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('reminder', 'onboarding', 'notification', 'statement')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SMS Logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  template_id UUID REFERENCES sms_templates(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at TIMESTAMP,
  error_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tax Rates table
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tax_type VARCHAR(20) NOT NULL CHECK (tax_type IN ('income', 'vat', 'service')),
  rate DECIMAL(5, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_data JSONB NOT NULL,
  notes TEXT,
  generated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_loans_client_id ON loans(client_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_emi_schedule_loan_id ON emi_schedule(loan_id);
CREATE INDEX idx_emi_schedule_due_date ON emi_schedule(due_date);
CREATE INDEX idx_loan_transactions_loan_id ON loan_transactions(loan_id);
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entry_details_journal_entry_id ON journal_entry_details(journal_entry_id);
CREATE INDEX idx_sms_logs_client_id ON sms_logs(client_id);
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, phone, password_hash, role)
VALUES ('Admin User', 'admin@example.com', '1234567890', '$2b$10$3euPcmQFCiblsZeEu5s7p.9MUZWg1IkU5Bo1fdIgDzQ813UW2QjKi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample loan types
INSERT INTO loan_types (name, description, interest_rate, min_amount, max_amount, min_tenure_months, max_tenure_months, processing_fee_percent)
VALUES 
  ('Personal Loan', 'Short-term personal loan for various purposes', 12.00, 5000, 100000, 3, 36, 1.5),
  ('Business Loan', 'Loan for small business operations and expansion', 10.50, 50000, 1000000, 6, 60, 2.0),
  ('Education Loan', 'Loan for educational purposes', 8.00, 10000, 500000, 12, 84, 1.0),
  ('Home Loan', 'Loan for home purchase or renovation', 9.50, 100000, 5000000, 12, 240, 0.5)
ON CONFLICT DO NOTHING;

-- Insert sample SMS templates
INSERT INTO sms_templates (name, template_text, template_type)
VALUES 
  ('Payment Reminder', 'Dear {name}, your EMI payment of {amount} for loan {loan_id} is due on {date}. Please make the payment on time to avoid late fees.', 'reminder'),
  ('Welcome Message', 'Welcome to our Micro Finance family, {name}! Your account {account_id} has been successfully created. Contact us at {helpline} for any assistance.', 'onboarding'),
  ('Late Payment Notice', 'Dear {name}, your EMI payment of {amount} for loan {loan_id} is overdue by {days} days. Please make the payment immediately to avoid penalty charges.', 'reminder'),
  ('Loan Approval', 'Congratulations {name}! Your loan application of {amount} has been approved. Loan amount will be credited to your account {account_id} within 24 hours.', 'notification')
ON CONFLICT DO NOTHING;

-- Insert sample chart of accounts
INSERT INTO chart_of_accounts (account_code, account_name, account_type)
VALUES 
  ('1000', 'Assets', 'Asset'),
  ('2000', 'Liabilities', 'Liability'),
  ('3000', 'Equity', 'Equity'),
  ('4000', 'Income', 'Income'),
  ('5000', 'Expenses', 'Expense')
ON CONFLICT DO NOTHING;

-- Insert sample tax rates
INSERT INTO tax_rates (tax_type, rate, description, effective_from)
VALUES 
  ('income', 10.00, 'Income tax rate', '2023-01-01'),
  ('vat', 18.00, 'Value Added Tax', '2023-01-01'),
  ('service', 5.00, 'Service tax', '2023-01-01')
ON CONFLICT DO NOTHING;