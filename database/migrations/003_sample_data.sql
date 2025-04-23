-- Migration: 003_sample_data.sql
-- Description: Sample data for testing
-- Created: 2023-09-01

BEGIN;

-- Set the current user ID for audit logs
SET LOCAL app.current_user_id = '00000000-0000-0000-0000-000000000001';

-- Insert sample users and clients
INSERT INTO users (id, name, email, phone, password_hash, role, created_at, updated_at)
VALUES
    (
        '00000000-0000-0000-0000-000000000200',
        'Rajesh Kumar',
        'rajesh.kumar@example.com',
        '+977 9876543210',
        crypt('password123', gen_salt('bf')),
        'client',
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '60 days'
    ),
    (
        '00000000-0000-0000-0000-000000000201',
        'Priya Sharma',
        'priya.sharma@example.com',
        '+977 9865432109',
        crypt('password123', gen_salt('bf')),
        'client',
        NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '45 days'
    ),
    (
        '00000000-0000-0000-0000-000000000202',
        'Amit Singh',
        'amit.singh@example.com',
        '+977 9765432109',
        crypt('password123', gen_salt('bf')),
        'client',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '30 days'
    ),
    (
        '00000000-0000-0000-0000-000000000203',
        'Sunita Patel',
        'sunita.patel@example.com',
        '+977 9654321098',
        crypt('password123', gen_salt('bf')),
        'client',
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '25 days'
    ),
    (
        '00000000-0000-0000-0000-000000000204',
        'Rahul Verma',
        'rahul.verma@example.com',
        '+977 9543210987',
        crypt('password123', gen_salt('bf')),
        'client',
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '20 days'
    );

-- Insert clients
INSERT INTO clients (id, account_type, account_number, balance, status, kyc_verified, date_created)
VALUES
    (
        '00000000-0000-0000-0000-000000000200',
        'SB',
        'SB-2023-001',
        42500.00,
        'active',
        TRUE,
        CURRENT_DATE - INTERVAL '60 days'
    ),
    (
        '00000000-0000-0000-0000-000000000201',
        'BB',
        'BB-2023-001',
        15800.00,
        'active',
        TRUE,
        CURRENT_DATE - INTERVAL '45 days'
    ),
    (
        '00000000-0000-0000-0000-000000000202',
        'MB',
        'MB-2023-001',
        28650.00,
        'pending',
        FALSE,
        CURRENT_DATE - INTERVAL '30 days'
    ),
    (
        '00000000-0000-0000-0000-000000000203',
        'SB',
        'SB-2023-002',
        36900.00,
        'active',
        TRUE,
        CURRENT_DATE - INTERVAL '25 days'
    ),
    (
        '00000000-0000-0000-0000-000000000204',
        'BB',
        'BB-2023-002',
        8750.00,
        'inactive',
        TRUE,
        CURRENT_DATE - INTERVAL '20 days'
    );

-- Insert sample loans
INSERT INTO loans (
    id, 
    client_id, 
    loan_type_id, 
    calculation_type, 
    amount, 
    interest_rate, 
    tenure_months, 
    emi_amount, 
    disburse_date, 
    end_date, 
    processing_fee, 
    total_interest, 
    total_amount, 
    remaining_amount, 
    status, 
    created_at
)
VALUES
    (
        '00000000-0000-0000-0000-000000000300',
        '00000000-0000-0000-0000-000000000200',
        '00000000-0000-0000-0000-000000000010',
        'flat',
        100000.00,
        13.50,
        12,
        9458.33,
        CURRENT_DATE - INTERVAL '50 days',
        CURRENT_DATE - INTERVAL '50 days' + INTERVAL '12 months',
        1000.00,
        13500.00,
        113500.00,
        94583.33,
        'active',
        NOW() - INTERVAL '50 days'
    ),
    (
        '00000000-0000-0000-0000-000000000301',
        '00000000-0000-0000-0000-000000000201',
        '00000000-0000-0000-0000-000000000011',
        'diminishing',
        200000.00,
        15.00,
        24,
        9752.07,
        CURRENT_DATE - INTERVAL '40 days',
        CURRENT_DATE - INTERVAL '40 days' + INTERVAL '24 months',
        3000.00,
        34049.68,
        234049.68,
        224297.61,
        'active',
        NOW() - INTERVAL '40 days'
    ),
    (
        '00000000-0000-0000-0000-000000000302',
        '00000000-0000-0000-0000-000000000203',
        '00000000-0000-0000-0000-000000000012',
        'flat',
        50000.00,
        10.00,
        12,
        4583.33,
        CURRENT_DATE - INTERVAL '20 days',
        CURRENT_DATE - INTERVAL '20 days' + INTERVAL '12 months',
        250.00,
        5000.00,
        55000.00,
        55000.00,
        'pending',
        NOW() - INTERVAL '20 days'
    );

-- Generate EMI schedule for the first loan
DO $$
DECLARE
    loan_id UUID := '00000000-0000-0000-0000-000000000300';
    loan_amount DECIMAL := 100000.00;
    interest_rate DECIMAL := 13.50;
    tenure_months INTEGER := 12;
    emi_amount DECIMAL := 9458.33;
    loan_disburse_date DATE := CURRENT_DATE - INTERVAL '50 days';
    monthly_interest DECIMAL := (interest_rate / 100) / 12;
    principal_per_month DECIMAL := loan_amount / tenure_months;
    interest_per_month DECIMAL := loan_amount * (interest_rate / 100) / 12;
    remaining DECIMAL := loan_amount;
    i INTEGER;
BEGIN
    FOR i IN 1..tenure_months LOOP
        INSERT INTO emi_schedule (
            loan_id,
            installment_number,
            due_date,
            emi_amount,
            principal_amount,
            interest_amount,
            remaining_principal,
            is_paid
        ) VALUES (
            loan_id,
            i,
            loan_disburse_date + (i * INTERVAL '1 month'),
            emi_amount,
            principal_per_month,
            interest_per_month,
            CASE WHEN i = tenure_months THEN 0 ELSE remaining - principal_per_month END,
            CASE WHEN i <= 2 THEN TRUE ELSE FALSE END
        );
        
        remaining := remaining - principal_per_month;
    END LOOP;
END $$;

-- Generate EMI schedule for the second loan (diminishing)
DO $$
DECLARE
    loan_id UUID := '00000000-0000-0000-0000-000000000301';
    loan_amount DECIMAL := 200000.00;
    interest_rate DECIMAL := 15.00;
    tenure_months INTEGER := 24;
    emi_amount DECIMAL := 9752.07;
    loan_disburse_date DATE := CURRENT_DATE - INTERVAL '40 days';
    monthly_interest DECIMAL := (interest_rate / 100) / 12;
    remaining DECIMAL := loan_amount;
    principal DECIMAL;
    interest DECIMAL;
    i INTEGER;
BEGIN
    FOR i IN 1..tenure_months LOOP
        interest := remaining * monthly_interest;
        principal := emi_amount - interest;
        
        INSERT INTO emi_schedule (
            loan_id,
            installment_number,
            due_date,
            emi_amount,
            principal_amount,
            interest_amount,
            remaining_principal,
            is_paid
        ) VALUES (
            loan_id,
            i,
            loan_disburse_date + (i * INTERVAL '1 month'),
            emi_amount,
            principal,
            interest,
            CASE WHEN i = tenure_months THEN 0 ELSE remaining - principal END,
            CASE WHEN i = 1 THEN TRUE ELSE FALSE END
        );
        
        remaining := remaining - principal;
    END LOOP;
END $$;

-- Insert loan transactions for paid EMIs
INSERT INTO loan_transactions (
    id,
    loan_id,
    amount,
    principal_amount,
    interest_amount,
    payment_date,
    due_date,
    is_late_payment,
    remaining_principal,
    transaction_reference,
    notes
)
VALUES
    (
        '00000000-0000-0000-0000-000000000400',
        '00000000-0000-0000-0000-000000000300',
        9458.33,
        8333.33,
        1125.00,
        CURRENT_DATE - INTERVAL '50 days' + INTERVAL '1 month',
        CURRENT_DATE - INTERVAL '50 days' + INTERVAL '1 month',
        FALSE,
        91666.67,
        'TXN-2023-001',
        'First EMI payment'
    ),
    (
        '00000000-0000-0000-0000-000000000401',
        '00000000-0000-0000-0000-000000000300',
        9458.33,
        8333.33,
        1125.00,
        CURRENT_DATE - INTERVAL '50 days' + INTERVAL '2 months',
        CURRENT_DATE - INTERVAL '50 days' + INTERVAL '2 months',
        FALSE,
        83333.34,
        'TXN-2023-002',
        'Second EMI payment'
    ),
    (
        '00000000-0000-0000-0000-000000000402',
        '00000000-0000-0000-0000-000000000301',
        9752.07,
        7252.07,
        2500.00,
        CURRENT_DATE - INTERVAL '40 days' + INTERVAL '1 month',
        CURRENT_DATE - INTERVAL '40 days' + INTERVAL '1 month',
        FALSE,
        192747.93,
        'TXN-2023-003',
        'First EMI payment'
    );

-- Update EMI schedule with payment transaction IDs
UPDATE emi_schedule
SET payment_transaction_id = '00000000-0000-0000-0000-000000000400'
WHERE loan_id = '00000000-0000-0000-0000-000000000300' AND installment_number = 1;

UPDATE emi_schedule
SET payment_transaction_id = '00000000-0000-0000-0000-000000000401'
WHERE loan_id = '00000000-0000-0000-0000-000000000300' AND installment_number = 2;

UPDATE emi_schedule
SET payment_transaction_id = '00000000-0000-0000-0000-000000000402'
WHERE loan_id = '00000000-0000-0000-0000-000000000301' AND installment_number = 1;

-- Insert journal entries for loan disbursements
INSERT INTO journal_entries (
    id,
    entry_date,
    reference_number,
    description,
    is_posted,
    posted_by,
    posted_at,
    created_by
)
VALUES
    (
        '00000000-0000-0000-0000-000000000500',
        CURRENT_DATE - INTERVAL '50 days',
        'JE-2023-001',
        'Loan disbursement to Rajesh Kumar',
        TRUE,
        '00000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '50 days',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000501',
        CURRENT_DATE - INTERVAL '40 days',
        'JE-2023-002',
        'Loan disbursement to Priya Sharma',
        TRUE,
        '00000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '40 days',
        '00000000-0000-0000-0000-000000000001'
    );

-- Insert journal entry details for loan disbursements
INSERT INTO journal_entry_details (
    journal_entry_id,
    account_id,
    debit_amount,
    credit_amount,
    description
)
VALUES
    -- First loan disbursement
    (
        '00000000-0000-0000-0000-000000000500',
        '00000000-0000-0000-0000-000000000025', -- Loans Outstanding
        100000.00,
        0.00,
        'Loan principal'
    ),
    (
        '00000000-0000-0000-0000-000000000500',
        '00000000-0000-0000-0000-000000000023', -- Cash at Bank
        0.00,
        100000.00,
        'Loan disbursement'
    ),
    (
        '00000000-0000-0000-0000-000000000500',
        '00000000-0000-0000-0000-000000000064', -- Processing Fees
        0.00,
        1000.00,
        'Loan processing fee'
    ),
    
    -- Second loan disbursement
    (
        '00000000-0000-0000-0000-000000000501',
        '00000000-0000-0000-0000-000000000025', -- Loans Outstanding
        200000.00,
        0.00,
        'Loan principal'
    ),
    (
        '00000000-0000-0000-0000-000000000501',
        '00000000-0000-0000-0000-000000000023', -- Cash at Bank
        0.00,
        200000.00,
        'Loan disbursement'
    ),
    (
        '00000000-0000-0000-0000-000000000501',
        '00000000-0000-0000-0000-000000000064', -- Processing Fees
        0.00,
        3000.00,
        'Loan processing fee'
    );

-- Insert transactions for loan disbursements
INSERT INTO transactions (
    id,
    client_id,
    transaction_type,
    amount,
    transaction_date,
    reference_number,
    description,
    related_loan_id,
    journal_entry_id,
    created_by
)
VALUES
    (
        '00000000-0000-0000-0000-000000000600',
        '00000000-0000-0000-0000-000000000200',
        'loan_disbursement',
        100000.00,
        CURRENT_DATE - INTERVAL '50 days',
        'TXN-2023-001',
        'Loan disbursement',
        '00000000-0000-0000-0000-000000000300',
        '00000000-0000-0000-0000-000000000500',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000601',
        '00000000-0000-0000-0000-000000000201',
        'loan_disbursement',
        200000.00,
        CURRENT_DATE - INTERVAL '40 days',
        'TXN-2023-002',
        'Loan disbursement',
        '00000000-0000-0000-0000-000000000301',
        '00000000-0000-0000-0000-000000000501',
        '00000000-0000-0000-0000-000000000001'
    );

-- Insert SMS logs
INSERT INTO sms_logs (
    id,
    client_id,
    phone_number,
    message,
    template_id,
    status,
    sent_at,
    created_by
)
VALUES
    (
        '00000000-0000-0000-0000-000000000700',
        '00000000-0000-0000-0000-000000000200',
        '+977 9876543210',
        'Congratulations Rajesh Kumar! Your loan application of रू 100,000.00 has been approved. Loan amount will be credited to your account SB-2023-001 within 24 hours.',
        '00000000-0000-0000-0000-000000000083',
        'sent',
        NOW() - INTERVAL '50 days',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000701',
        '00000000-0000-0000-0000-000000000201',
        '+977 9865432109',
        'Congratulations Priya Sharma! Your loan application of रू 200,000.00 has been approved. Loan amount will be credited to your account BB-2023-001 within 24 hours.',
        '00000000-0000-0000-0000-000000000083',
        'sent',
        NOW() - INTERVAL '40 days',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000702',
        '00000000-0000-0000-0000-000000000200',
        '+977 9876543210',
        'Dear Rajesh Kumar, your EMI payment of रू 9,458.33 for loan 00000000-0000-0000-0000-000000000300 is due on 2023-10-20. Please make the payment on time to avoid late fees.',
        '00000000-0000-0000-0000-000000000080',
        'sent',
        NOW() - INTERVAL '20 days',
        '00000000-0000-0000-0000-000000000001'
    );

COMMIT;