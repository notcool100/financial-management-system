-- Add a sample client
INSERT INTO users (
    id,
    name,
    email,
    phone,
    password_hash,
    role,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000100',
    'John Doe',
    'john.doe@example.com',
    '+9779876543211',
    crypt('password123', gen_salt('bf', 6)),
    'client',
    NOW(),
    NOW()
);

-- Add client details
INSERT INTO clients (
    id,
    account_type,
    account_number,
    balance,
    status,
    kyc_verified,
    date_created,
    last_transaction_date
) VALUES (
    '00000000-0000-0000-0000-000000000100',
    'SB',
    'SB-2023-001',
    5000.00,
    'active',
    TRUE,
    CURRENT_DATE,
    NOW()
);

-- Add a sample loan
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
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000500',
    '00000000-0000-0000-0000-000000000100',
    '00000000-0000-0000-0000-000000000010',
    'flat',
    50000.00,
    13.50,
    12,
    4729.17,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '12 months',
    500.00,
    6750.00,
    56750.00,
    50000.00,
    'pending',
    NOW(),
    NOW()
);

-- Generate EMI schedule for the loan
DO $$
DECLARE
    loan_id UUID := '00000000-0000-0000-0000-000000000500';
    loan_amount DECIMAL := 50000.00;
    interest_rate DECIMAL := 13.50;
    tenure_months INTEGER := 12;
    emi_amount DECIMAL := 4729.17;
    loan_disburse_date DATE := CURRENT_DATE;
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
            FALSE
        );
        
        remaining := remaining - principal_per_month;
    END LOOP;
END $$;