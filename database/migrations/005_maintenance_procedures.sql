-- Migration: 005_maintenance_procedures.sql
-- Description: Database maintenance procedures and functions
-- Created: 2023-09-01

BEGIN;

-- Function to generate account numbers
CREATE OR REPLACE FUNCTION generate_account_number(account_type account_type)
RETURNS VARCHAR AS $$
DECLARE
    year VARCHAR := to_char(CURRENT_DATE, 'YYYY');
    count_num INTEGER;
    prefix VARCHAR;
BEGIN
    -- Set prefix based on account type
    IF account_type = 'SB' THEN
        prefix := 'SB';
    ELSIF account_type = 'BB' THEN
        prefix := 'BB';
    ELSIF account_type = 'MB' THEN
        prefix := 'MB';
    END IF;
    
    -- Get current count for this account type and year
    SELECT COUNT(*) + 1 INTO count_num
    FROM clients
    WHERE account_number LIKE prefix || '-' || year || '-%';
    
    -- Return formatted account number
    RETURN prefix || '-' || year || '-' || LPAD(count_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate EMI for a loan
CREATE OR REPLACE FUNCTION calculate_emi(
    p_amount DECIMAL,
    p_interest_rate DECIMAL,
    p_tenure_months INTEGER,
    p_calculation_type loan_type
)
RETURNS DECIMAL AS $$
DECLARE
    monthly_rate DECIMAL;
    emi DECIMAL;
    total_interest DECIMAL;
BEGIN
    -- Convert annual interest rate to monthly rate
    monthly_rate := (p_interest_rate / 100) / 12;
    
    IF p_calculation_type = 'flat' THEN
        -- For flat rate: EMI = (P + (P * r * t)) / n
        -- Where P = principal, r = annual interest rate, t = time in years, n = number of installments
        total_interest := p_amount * (p_interest_rate / 100) * (p_tenure_months / 12.0);
        emi := (p_amount + total_interest) / p_tenure_months;
    ELSE
        -- For diminishing rate: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        IF monthly_rate > 0 THEN
            emi := (p_amount * monthly_rate * POWER(1 + monthly_rate, p_tenure_months)) / 
                   (POWER(1 + monthly_rate, p_tenure_months) - 1);
        ELSE
            emi := p_amount / p_tenure_months;
        END IF;
    END IF;
    
    -- Round to 2 decimal places
    RETURN ROUND(emi, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to generate EMI schedule for a loan
CREATE OR REPLACE FUNCTION generate_emi_schedule(
    p_loan_id UUID,
    p_amount DECIMAL,
    p_interest_rate DECIMAL,
    p_tenure_months INTEGER,
    p_disburse_date DATE,
    p_calculation_type loan_type
)
RETURNS VOID AS $$
DECLARE
    emi_amount DECIMAL;
    monthly_rate DECIMAL;
    remaining DECIMAL := p_amount;
    principal DECIMAL;
    interest DECIMAL;
    i INTEGER;
BEGIN
    -- Calculate EMI amount
    emi_amount := calculate_emi(p_amount, p_interest_rate, p_tenure_months, p_calculation_type);
    
    -- Convert annual interest rate to monthly rate
    monthly_rate := (p_interest_rate / 100) / 12;
    
    -- Generate schedule based on calculation type
    IF p_calculation_type = 'flat' THEN
        -- For flat rate, principal is evenly distributed
        principal := p_amount / p_tenure_months;
        interest := p_amount * monthly_rate;
        
        FOR i IN 1..p_tenure_months LOOP
            INSERT INTO emi_schedule (
                loan_id,
                installment_number,
                due_date,
                emi_amount,
                principal_amount,
                interest_amount,
                remaining_principal
            ) VALUES (
                p_loan_id,
                i,
                p_disburse_date + (i * INTERVAL '1 month'),
                emi_amount,
                principal,
                interest,
                CASE WHEN i = p_tenure_months THEN 0 ELSE remaining - principal END
            );
            
            remaining := remaining - principal;
        END LOOP;
    ELSE
        -- For diminishing rate, interest is calculated on remaining principal
        FOR i IN 1..p_tenure_months LOOP
            interest := remaining * monthly_rate;
            principal := emi_amount - interest;
            
            -- Adjust the last installment to ensure the loan is fully paid
            IF i = p_tenure_months THEN
                principal := remaining;
                emi_amount := principal + interest;
            END IF;
            
            INSERT INTO emi_schedule (
                loan_id,
                installment_number,
                due_date,
                emi_amount,
                principal_amount,
                interest_amount,
                remaining_principal
            ) VALUES (
                p_loan_id,
                i,
                p_disburse_date + (i * INTERVAL '1 month'),
                emi_amount,
                principal,
                interest,
                CASE WHEN i = p_tenure_months THEN 0 ELSE remaining - principal END
            );
            
            remaining := remaining - principal;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create a loan with EMI schedule
CREATE OR REPLACE FUNCTION create_loan(
    p_client_id UUID,
    p_loan_type_id UUID,
    p_calculation_type loan_type,
    p_amount DECIMAL,
    p_interest_rate DECIMAL,
    p_tenure_months INTEGER,
    p_disburse_date DATE,
    p_processing_fee DECIMAL
)
RETURNS UUID AS $$
DECLARE
    new_loan_id UUID;
    emi_amount DECIMAL;
    total_interest DECIMAL;
    total_amount DECIMAL;
BEGIN
    -- Calculate EMI amount
    emi_amount := calculate_emi(p_amount, p_interest_rate, p_tenure_months, p_calculation_type);
    
    -- Calculate total interest and total amount
    IF p_calculation_type = 'flat' THEN
        total_interest := p_amount * (p_interest_rate / 100) * (p_tenure_months / 12.0);
    ELSE
        total_interest := (emi_amount * p_tenure_months) - p_amount;
    END IF;
    
    total_amount := p_amount + total_interest;
    
    -- Insert the loan record
    INSERT INTO loans (
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
        status
    ) VALUES (
        p_client_id,
        p_loan_type_id,
        p_calculation_type,
        p_amount,
        p_interest_rate,
        p_tenure_months,
        emi_amount,
        p_disburse_date,
        p_disburse_date + (p_tenure_months * INTERVAL '1 month'),
        p_processing_fee,
        total_interest,
        total_amount,
        p_amount,
        'pending'
    ) RETURNING id INTO new_loan_id;
    
    -- Generate EMI schedule
    PERFORM generate_emi_schedule(
        new_loan_id,
        p_amount,
        p_interest_rate,
        p_tenure_months,
        p_disburse_date,
        p_calculation_type
    );
    
    RETURN new_loan_id;
END;
$$ LANGUAGE plpgsql;

-- Function to disburse a loan
CREATE OR REPLACE FUNCTION disburse_loan(
    p_loan_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_client_id UUID;
    v_amount DECIMAL;
    v_processing_fee DECIMAL;
    v_journal_entry_id UUID;
    v_reference_number VARCHAR;
    v_description TEXT;
BEGIN
    -- Get loan details
    SELECT 
        client_id, 
        amount, 
        processing_fee
    INTO 
        v_client_id, 
        v_amount, 
        v_processing_fee
    FROM loans
    WHERE id = p_loan_id AND status = 'pending';
    
    -- If loan not found or not in pending status, return false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Generate reference number
    v_reference_number := 'JE-LOAN-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                          substring(p_loan_id::text, 1, 8);
    
    -- Create description
    SELECT 'Loan disbursement to ' || name INTO v_description
    FROM users
    WHERE id = v_client_id;
    
    -- Create journal entry
    INSERT INTO journal_entries (
        entry_date,
        reference_number,
        description,
        is_posted,
        posted_by,
        posted_at,
        created_by
    ) VALUES (
        CURRENT_DATE,
        v_reference_number,
        v_description,
        TRUE,
        p_user_id,
        NOW(),
        p_user_id
    ) RETURNING id INTO v_journal_entry_id;
    
    -- Add journal entry details
    INSERT INTO journal_entry_details (
        journal_entry_id,
        account_id,
        debit_amount,
        credit_amount,
        description
    ) VALUES
        -- Debit Loans Outstanding
        (
            v_journal_entry_id,
            (SELECT id FROM chart_of_accounts WHERE account_code = '1140'), -- Loans Outstanding
            v_amount,
            0.00,
            'Loan principal'
        ),
        -- Credit Cash at Bank
        (
            v_journal_entry_id,
            (SELECT id FROM chart_of_accounts WHERE account_code = '1120'), -- Cash at Bank
            0.00,
            v_amount,
            'Loan disbursement'
        );
    
    -- If processing fee exists, add it to journal entry
    IF v_processing_fee > 0 THEN
        INSERT INTO journal_entry_details (
            journal_entry_id,
            account_id,
            debit_amount,
            credit_amount,
            description
        ) VALUES
            (
                v_journal_entry_id,
                (SELECT id FROM chart_of_accounts WHERE account_code = '4400'), -- Processing Fees
                0.00,
                v_processing_fee,
                'Loan processing fee'
            );
    END IF;
    
    -- Create transaction record
    INSERT INTO transactions (
        client_id,
        transaction_type,
        amount,
        transaction_date,
        reference_number,
        description,
        related_loan_id,
        journal_entry_id,
        created_by
    ) VALUES (
        v_client_id,
        'loan_disbursement',
        v_amount,
        NOW(),
        'TXN-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || 
        substring(p_loan_id::text, 1, 8),
        'Loan disbursement',
        p_loan_id,
        v_journal_entry_id,
        p_user_id
    );
    
    -- Update loan status to active
    UPDATE loans
    SET 
        status = 'active',
        updated_at = NOW()
    WHERE id = p_loan_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to record a loan payment
CREATE OR REPLACE FUNCTION record_loan_payment(
    p_loan_id UUID,
    p_amount DECIMAL,
    p_payment_date DATE,
    p_user_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_due_emi RECORD;
    v_principal_amount DECIMAL;
    v_interest_amount DECIMAL;
    v_late_fee DECIMAL := 0.00;
    v_is_late_payment BOOLEAN := FALSE;
    v_remaining_principal DECIMAL;
    v_reference_number VARCHAR;
    v_journal_entry_id UUID;
    v_client_id UUID;
    v_client_name VARCHAR;
BEGIN
    -- Get the next due EMI
    SELECT 
        e.*,
        l.client_id,
        l.remaining_amount
    INTO v_due_emi
    FROM emi_schedule e
    JOIN loans l ON e.loan_id = l.id
    WHERE e.loan_id = p_loan_id AND e.is_paid = FALSE
    ORDER BY e.installment_number
    LIMIT 1;
    
    -- If no due EMI found, return null
    IF v_due_emi IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Check if payment is late
    IF p_payment_date > v_due_emi.due_date THEN
        v_is_late_payment := TRUE;
        -- Get late fee from system settings
        SELECT COALESCE(setting_value::DECIMAL, 0) INTO v_late_fee
        FROM system_settings
        WHERE setting_key = 'default_late_fee';
    END IF;
    
    -- Set principal and interest amounts
    v_principal_amount := v_due_emi.principal_amount;
    v_interest_amount := v_due_emi.interest_amount;
    v_remaining_principal := v_due_emi.remaining_principal;
    v_client_id := v_due_emi.client_id;
    
    -- Get client name
    SELECT name INTO v_client_name
    FROM users
    WHERE id = v_client_id;
    
    -- Generate reference number
    v_reference_number := 'JE-PAYMENT-' || to_char(p_payment_date, 'YYYYMMDD') || '-' || 
                          substring(p_loan_id::text, 1, 8);
    
    -- Create journal entry
    INSERT INTO journal_entries (
        entry_date,
        reference_number,
        description,
        is_posted,
        posted_by,
        posted_at,
        created_by
    ) VALUES (
        p_payment_date,
        v_reference_number,
        'Loan payment from ' || v_client_name,
        TRUE,
        p_user_id,
        NOW(),
        p_user_id
    ) RETURNING id INTO v_journal_entry_id;
    
    -- Add journal entry details
    INSERT INTO journal_entry_details (
        journal_entry_id,
        account_id,
        debit_amount,
        credit_amount,
        description
    ) VALUES
        -- Debit Cash at Bank
        (
            v_journal_entry_id,
            (SELECT id FROM chart_of_accounts WHERE account_code = '1120'), -- Cash at Bank
            p_amount,
            0.00,
            'Loan payment received'
        ),
        -- Credit Loans Outstanding
        (
            v_journal_entry_id,
            (SELECT id FROM chart_of_accounts WHERE account_code = '1140'), -- Loans Outstanding
            0.00,
            v_principal_amount,
            'Principal payment'
        ),
        -- Credit Interest Income
        (
            v_journal_entry_id,
            (SELECT id FROM chart_of_accounts WHERE account_code = '4100'), -- Interest Income
            0.00,
            v_interest_amount,
            'Interest payment'
        );
    
    -- If late fee exists, add it to journal entry
    IF v_late_fee > 0 THEN
        INSERT INTO journal_entry_details (
            journal_entry_id,
            account_id,
            debit_amount,
            credit_amount,
            description
        ) VALUES
            (
                v_journal_entry_id,
                (SELECT id FROM chart_of_accounts WHERE account_code = '4300'), -- Late Payment Fees
                0.00,
                v_late_fee,
                'Late payment fee'
            );
    END IF;
    
    -- Create loan transaction record
    INSERT INTO loan_transactions (
        loan_id,
        amount,
        principal_amount,
        interest_amount,
        late_fee,
        payment_date,
        due_date,
        is_late_payment,
        remaining_principal,
        transaction_reference,
        notes
    ) VALUES (
        p_loan_id,
        p_amount,
        v_principal_amount,
        v_interest_amount,
        v_late_fee,
        p_payment_date,
        v_due_emi.due_date,
        v_is_late_payment,
        v_remaining_principal,
        'TXN-' || to_char(p_payment_date, 'YYYYMMDD') || '-' || 
        substring(p_loan_id::text, 1, 8),
        p_notes
    ) RETURNING id INTO v_transaction_id;
    
    -- Create transaction record
    INSERT INTO transactions (
        client_id,
        transaction_type,
        amount,
        transaction_date,
        reference_number,
        description,
        related_loan_id,
        journal_entry_id,
        created_by
    ) VALUES (
        v_client_id,
        'loan_payment',
        p_amount,
        p_payment_date,
        'TXN-' || to_char(p_payment_date, 'YYYYMMDD') || '-' || 
        substring(p_loan_id::text, 1, 8),
        'Loan payment - EMI #' || v_due_emi.installment_number,
        p_loan_id,
        v_journal_entry_id,
        p_user_id
    );
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send SMS
CREATE OR REPLACE FUNCTION send_sms(
    p_client_id UUID,
    p_template_id UUID,
    p_params JSONB,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_template_text TEXT;
    v_phone_number VARCHAR;
    v_message TEXT;
    v_sms_id UUID;
    v_param_key TEXT;
    v_param_value TEXT;
BEGIN
    -- Get template text
    SELECT template_text INTO v_template_text
    FROM sms_templates
    WHERE id = p_template_id;
    
    -- Get client phone number
    SELECT phone INTO v_phone_number
    FROM users
    WHERE id = p_client_id;
    
    -- If template or phone not found, return null
    IF v_template_text IS NULL OR v_phone_number IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Replace placeholders with actual values
    v_message := v_template_text;
    
    FOR v_param_key, v_param_value IN SELECT * FROM jsonb_each_text(p_params)
    LOOP
        v_message := replace(v_message, '{' || v_param_key || '}', v_param_value);
    END LOOP;
    
    -- Insert SMS log
    INSERT INTO sms_logs (
        client_id,
        phone_number,
        message,
        template_id,
        status,
        created_by
    ) VALUES (
        p_client_id,
        v_phone_number,
        v_message,
        p_template_id,
        'pending',
        p_user_id
    ) RETURNING id INTO v_sms_id;
    
    -- Update template last used timestamp
    UPDATE sms_templates
    SET 
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE id = p_template_id;
    
    RETURN v_sms_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate trial balance
CREATE OR REPLACE FUNCTION generate_trial_balance(p_date DATE)
RETURNS TABLE (
    account_code VARCHAR,
    account_name VARCHAR,
    account_type VARCHAR,
    debit_amount DECIMAL,
    credit_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH account_balances AS (
        SELECT
            coa.id,
            coa.account_code,
            coa.account_name,
            coa.account_type,
            SUM(COALESCE(jed.debit_amount, 0)) AS total_debits,
            SUM(COALESCE(jed.credit_amount, 0)) AS total_credits
        FROM
            chart_of_accounts coa
        LEFT JOIN
            journal_entry_details jed ON coa.id = jed.account_id
        LEFT JOIN
            journal_entries je ON jed.journal_entry_id = je.id
        WHERE
            je.entry_date <= p_date
            AND je.is_posted = TRUE
            AND coa.is_active = TRUE
        GROUP BY
            coa.id, coa.account_code, coa.account_name, coa.account_type
    )
    SELECT
        ab.account_code,
        ab.account_name,
        ab.account_type,
        CASE
            WHEN ab.account_type IN ('asset', 'expense') AND (ab.total_debits - ab.total_credits) > 0 THEN
                ab.total_debits - ab.total_credits
            WHEN ab.account_type IN ('liability', 'equity', 'income') AND (ab.total_credits - ab.total_debits) < 0 THEN
                ABS(ab.total_credits - ab.total_debits)
            ELSE 0
        END AS debit_amount,
        CASE
            WHEN ab.account_type IN ('liability', 'equity', 'income') AND (ab.total_credits - ab.total_debits) > 0 THEN
                ab.total_credits - ab.total_debits
            WHEN ab.account_type IN ('asset', 'expense') AND (ab.total_debits - ab.total_credits) < 0 THEN
                ABS(ab.total_debits - ab.total_credits)
            ELSE 0
        END AS credit_amount
    FROM
        account_balances ab
    WHERE
        (ab.total_debits <> 0 OR ab.total_credits <> 0)
    ORDER BY
        ab.account_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate balance sheet
CREATE OR REPLACE FUNCTION generate_balance_sheet(p_date DATE)
RETURNS TABLE (
    account_code VARCHAR,
    account_name VARCHAR,
    account_type VARCHAR,
    parent_account VARCHAR,
    amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH account_balances AS (
        SELECT
            coa.id,
            coa.account_code,
            coa.account_name,
            coa.account_type,
            parent.account_name AS parent_account,
            SUM(COALESCE(jed.debit_amount, 0)) AS total_debits,
            SUM(COALESCE(jed.credit_amount, 0)) AS total_credits
        FROM
            chart_of_accounts coa
        LEFT JOIN
            chart_of_accounts parent ON coa.parent_account_id = parent.id
        LEFT JOIN
            journal_entry_details jed ON coa.id = jed.account_id
        LEFT JOIN
            journal_entries je ON jed.journal_entry_id = je.id
        WHERE
            je.entry_date <= p_date
            AND je.is_posted = TRUE
            AND coa.is_active = TRUE
            AND coa.account_type IN ('asset', 'liability', 'equity', 'contra-asset')
        GROUP BY
            coa.id, coa.account_code, coa.account_name, coa.account_type, parent.account_name
    )
    SELECT
        ab.account_code,
        ab.account_name,
        ab.account_type,
        ab.parent_account,
        CASE
            WHEN ab.account_type IN ('asset', 'contra-asset') THEN
                ab.total_debits - ab.total_credits
            WHEN ab.account_type IN ('liability', 'equity') THEN
                ab.total_credits - ab.total_debits
            ELSE 0
        END AS amount
    FROM
        account_balances ab
    WHERE
        (ab.total_debits <> 0 OR ab.total_credits <> 0)
    ORDER BY
        ab.account_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate income statement
CREATE OR REPLACE FUNCTION generate_income_statement(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    account_code VARCHAR,
    account_name VARCHAR,
    account_type VARCHAR,
    amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH account_balances AS (
        SELECT
            coa.id,
            coa.account_code,
            coa.account_name,
            coa.account_type,
            SUM(COALESCE(jed.debit_amount, 0)) AS total_debits,
            SUM(COALESCE(jed.credit_amount, 0)) AS total_credits
        FROM
            chart_of_accounts coa
        LEFT JOIN
            journal_entry_details jed ON coa.id = jed.account_id
        LEFT JOIN
            journal_entries je ON jed.journal_entry_id = je.id
        WHERE
            je.entry_date BETWEEN p_start_date AND p_end_date
            AND je.is_posted = TRUE
            AND coa.is_active = TRUE
            AND coa.account_type IN ('income', 'expense')
        GROUP BY
            coa.id, coa.account_code, coa.account_name, coa.account_type
    )
    SELECT
        ab.account_code,
        ab.account_name,
        ab.account_type,
        CASE
            WHEN ab.account_type = 'income' THEN
                ab.total_credits - ab.total_debits
            WHEN ab.account_type = 'expense' THEN
                ab.total_debits - ab.total_credits
            ELSE 0
        END AS amount
    FROM
        account_balances ab
    WHERE
        (ab.total_debits <> 0 OR ab.total_credits <> 0)
    ORDER BY
        ab.account_type DESC, ab.account_code;
END;
$$ LANGUAGE plpgsql;

-- Function to find overdue loans
CREATE OR REPLACE FUNCTION find_overdue_loans(p_days_overdue INTEGER DEFAULT 1)
RETURNS TABLE (
    loan_id UUID,
    client_id UUID,
    client_name VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    installment_number INTEGER,
    due_date DATE,
    days_overdue INTEGER,
    emi_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.loan_id,
        c.id AS client_id,
        u.name AS client_name,
        u.phone,
        u.email,
        e.installment_number,
        e.due_date,
        (CURRENT_DATE - e.due_date) AS days_overdue,
        e.emi_amount
    FROM
        emi_schedule e
    JOIN
        loans l ON e.loan_id = l.id
    JOIN
        clients c ON l.client_id = c.id
    JOIN
        users u ON c.id = u.id
    WHERE
        e.is_paid = FALSE
        AND e.due_date < CURRENT_DATE
        AND (CURRENT_DATE - e.due_date) >= p_days_overdue
        AND l.status = 'active'
    ORDER BY
        e.due_date, e.loan_id;
END;
$$ LANGUAGE plpgsql;

-- Function to vacuum and analyze tables
CREATE OR REPLACE FUNCTION maintenance_vacuum_analyze()
RETURNS VOID AS $$
BEGIN
    VACUUM ANALYZE users;
    VACUUM ANALYZE clients;
    VACUUM ANALYZE loans;
    VACUUM ANALYZE loan_transactions;
    VACUUM ANALYZE emi_schedule;
    VACUUM ANALYZE chart_of_accounts;
    VACUUM ANALYZE journal_entries;
    VACUUM ANALYZE journal_entry_details;
    VACUUM ANALYZE transactions;
    VACUUM ANALYZE sms_logs;
    VACUUM ANALYZE sms_templates;
    VACUUM ANALYZE tax_rates;
    VACUUM ANALYZE tax_reports;
    VACUUM ANALYZE financial_reports;
    VACUUM ANALYZE audit_logs;
    VACUUM ANALYZE system_settings;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < (CURRENT_DATE - p_days * INTERVAL '1 day')
    RETURNING COUNT(*) INTO v_count;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;