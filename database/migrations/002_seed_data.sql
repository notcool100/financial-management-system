-- Migration: 002_seed_data.sql
-- Description: Seed data for initial setup
-- Created: 2023-09-01

BEGIN;

-- Insert admin user
INSERT INTO users (id, name, email, phone, password_hash, role, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Admin User',
    'admin@example.com',
    '+9779876543210',
    crypt('admin123', gen_salt('bf')),
    'admin',
    NOW(),
    NOW()
);

-- Insert loan types
INSERT INTO loan_types (id, name, description, interest_rate, processing_fee_percent, late_fee_amount, min_amount, max_amount, min_tenure_months, max_tenure_months, is_active)
VALUES
    (
        '00000000-0000-0000-0000-000000000010',
        'Personal Loan',
        'Short-term personal loan for various purposes',
        13.5,
        1.0,
        500.00,
        10000.00,
        500000.00,
        3,
        36,
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000011',
        'Business Loan',
        'Loan for small business owners',
        15.0,
        1.5,
        1000.00,
        50000.00,
        2000000.00,
        6,
        60,
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000012',
        'Education Loan',
        'Loan for educational purposes',
        10.0,
        0.5,
        300.00,
        20000.00,
        1000000.00,
        12,
        72,
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000013',
        'Home Improvement Loan',
        'Loan for home repairs and improvements',
        12.0,
        1.0,
        800.00,
        50000.00,
        1500000.00,
        12,
        60,
        TRUE
    );

-- Insert chart of accounts
INSERT INTO chart_of_accounts (id, account_code, account_name, account_type, parent_account_id, is_active)
VALUES
    -- Assets
    ('00000000-0000-0000-0000-000000000020', '1000', 'Assets', 'group', NULL, TRUE),
    ('00000000-0000-0000-0000-000000000021', '1100', 'Current Assets', 'group', '00000000-0000-0000-0000-000000000020', TRUE),
    ('00000000-0000-0000-0000-000000000022', '1110', 'Cash in Hand', 'asset', '00000000-0000-0000-0000-000000000021', TRUE),
    ('00000000-0000-0000-0000-000000000023', '1120', 'Cash at Bank', 'asset', '00000000-0000-0000-0000-000000000021', TRUE),
    ('00000000-0000-0000-0000-000000000024', '1130', 'Accounts Receivable', 'asset', '00000000-0000-0000-0000-000000000021', TRUE),
    ('00000000-0000-0000-0000-000000000025', '1140', 'Loans Outstanding', 'asset', '00000000-0000-0000-0000-000000000021', TRUE),
    ('00000000-0000-0000-0000-000000000026', '1150', 'Interest Receivable', 'asset', '00000000-0000-0000-0000-000000000021', TRUE),
    ('00000000-0000-0000-0000-000000000027', '1200', 'Fixed Assets', 'group', '00000000-0000-0000-0000-000000000020', TRUE),
    ('00000000-0000-0000-0000-000000000028', '1210', 'Furniture and Fixtures', 'asset', '00000000-0000-0000-0000-000000000027', TRUE),
    ('00000000-0000-0000-0000-000000000029', '1220', 'Office Equipment', 'asset', '00000000-0000-0000-0000-000000000027', TRUE),
    ('00000000-0000-0000-0000-000000000030', '1230', 'Vehicles', 'asset', '00000000-0000-0000-0000-000000000027', TRUE),
    ('00000000-0000-0000-0000-000000000031', '1240', 'Accumulated Depreciation', 'contra-asset', '00000000-0000-0000-0000-000000000027', TRUE),
    
    -- Liabilities
    ('00000000-0000-0000-0000-000000000040', '2000', 'Liabilities', 'group', NULL, TRUE),
    ('00000000-0000-0000-0000-000000000041', '2100', 'Current Liabilities', 'group', '00000000-0000-0000-0000-000000000040', TRUE),
    ('00000000-0000-0000-0000-000000000042', '2110', 'Accounts Payable', 'liability', '00000000-0000-0000-0000-000000000041', TRUE),
    ('00000000-0000-0000-0000-000000000043', '2120', 'Member Savings', 'liability', '00000000-0000-0000-0000-000000000041', TRUE),
    ('00000000-0000-0000-0000-000000000044', '2130', 'Interest Payable', 'liability', '00000000-0000-0000-0000-000000000041', TRUE),
    ('00000000-0000-0000-0000-000000000045', '2200', 'Long-term Liabilities', 'group', '00000000-0000-0000-0000-000000000040', TRUE),
    ('00000000-0000-0000-0000-000000000046', '2210', 'Bank Loans', 'liability', '00000000-0000-0000-0000-000000000045', TRUE),
    
    -- Equity
    ('00000000-0000-0000-0000-000000000050', '3000', 'Equity', 'group', NULL, TRUE),
    ('00000000-0000-0000-0000-000000000051', '3100', 'Capital', 'equity', '00000000-0000-0000-0000-000000000050', TRUE),
    ('00000000-0000-0000-0000-000000000052', '3200', 'Retained Earnings', 'equity', '00000000-0000-0000-0000-000000000050', TRUE),
    
    -- Income
    ('00000000-0000-0000-0000-000000000060', '4000', 'Income', 'group', NULL, TRUE),
    ('00000000-0000-0000-0000-000000000061', '4100', 'Interest Income', 'income', '00000000-0000-0000-0000-000000000060', TRUE),
    ('00000000-0000-0000-0000-000000000062', '4200', 'Fee Income', 'income', '00000000-0000-0000-0000-000000000060', TRUE),
    ('00000000-0000-0000-0000-000000000063', '4300', 'Late Payment Fees', 'income', '00000000-0000-0000-0000-000000000060', TRUE),
    ('00000000-0000-0000-0000-000000000064', '4400', 'Processing Fees', 'income', '00000000-0000-0000-0000-000000000060', TRUE),
    
    -- Expenses
    ('00000000-0000-0000-0000-000000000070', '5000', 'Expenses', 'group', NULL, TRUE),
    ('00000000-0000-0000-0000-000000000071', '5100', 'Salary Expenses', 'expense', '00000000-0000-0000-0000-000000000070', TRUE),
    ('00000000-0000-0000-0000-000000000072', '5200', 'Rent Expenses', 'expense', '00000000-0000-0000-0000-000000000070', TRUE),
    ('00000000-0000-0000-0000-000000000073', '5300', 'Utilities', 'expense', '00000000-0000-0000-0000-000000000070', TRUE),
    ('00000000-0000-0000-0000-000000000074', '5400', 'Office Supplies', 'expense', '00000000-0000-0000-0000-000000000070', TRUE),
    ('00000000-0000-0000-0000-000000000075', '5500', 'Depreciation Expense', 'expense', '00000000-0000-0000-0000-000000000070', TRUE),
    ('00000000-0000-0000-0000-000000000076', '5600', 'Interest Expense', 'expense', '00000000-0000-0000-0000-000000000070', TRUE),
    ('00000000-0000-0000-0000-000000000077', '5700', 'Bad Debt Expense', 'expense', '00000000-0000-0000-0000-000000000070', TRUE);

-- Insert SMS templates
INSERT INTO sms_templates (id, name, template_text, template_type, is_active)
VALUES
    (
        '00000000-0000-0000-0000-000000000080',
        'Payment Reminder',
        'Dear {name}, your EMI payment of {amount} for loan {loan_id} is due on {date}. Please make the payment on time to avoid late fees.',
        'reminder',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000081',
        'Welcome Message',
        'Welcome to our Micro Finance family, {name}! Your account {account_id} has been successfully created. Contact us at {helpline} for any assistance.',
        'onboarding',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000082',
        'Late Payment Notice',
        'Dear {name}, your EMI payment of {amount} for loan {loan_id} is overdue by {days} days. Please make the payment immediately to avoid penalty charges.',
        'reminder',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000083',
        'Loan Approval',
        'Congratulations {name}! Your loan application of {amount} has been approved. Loan amount will be credited to your account {account_id} within 24 hours.',
        'notification',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000084',
        'Account Statement',
        'Dear {name}, your monthly account statement for {month} is ready. Current balance: {balance}. For details, please visit our office or check the app.',
        'statement',
        TRUE
    );

-- Insert tax rates
INSERT INTO tax_rates (id, name, rate, description, is_active, effective_from)
VALUES
    (
        '00000000-0000-0000-0000-000000000090',
        'Standard Income Tax',
        13.00,
        'Standard income tax rate for financial institutions',
        TRUE,
        '2023-01-01'
    ),
    (
        '00000000-0000-0000-0000-000000000091',
        'Interest Income Tax',
        5.00,
        'Tax on interest income',
        TRUE,
        '2023-01-01'
    );

-- Insert system settings
INSERT INTO system_settings (id, setting_key, setting_value, description, is_editable)
VALUES
    (
        '00000000-0000-0000-0000-000000000100',
        'company_name',
        'Micro Finance Organization',
        'Name of the organization',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000101',
        'company_address',
        'Kathmandu, Nepal',
        'Address of the organization',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000102',
        'company_phone',
        '+977-1-4123456',
        'Contact phone number',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000103',
        'company_email',
        'info@microfinance.com',
        'Contact email address',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000104',
        'sms_api_key',
        'sample-api-key-12345',
        'API key for SMS service',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000105',
        'sms_sender_id',
        'MFORG',
        'Sender ID for SMS',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000106',
        'fiscal_year_start',
        '04-01',
        'Start date of fiscal year (MM-DD)',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000107',
        'default_late_fee',
        '500',
        'Default late fee amount',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000108',
        'currency_symbol',
        'रू',
        'Currency symbol',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000109',
        'currency_code',
        'NPR',
        'Currency code',
        TRUE
    );

COMMIT;