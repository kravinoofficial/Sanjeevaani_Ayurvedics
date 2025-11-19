-- Clear all table data except users
-- Run this script to reset all data while keeping user accounts

-- Clear audit logs
TRUNCATE TABLE audit_logs CASCADE;

-- Clear stock management tables
TRUNCATE TABLE stock_transactions CASCADE;
TRUNCATE TABLE stock_items CASCADE;

-- Clear charges
TRUNCATE TABLE charges CASCADE;

-- Clear prescriptions
TRUNCATE TABLE physical_treatment_prescriptions CASCADE;
TRUNCATE TABLE medicine_prescriptions CASCADE;

-- Clear treatments and medicines
TRUNCATE TABLE physical_treatments CASCADE;
TRUNCATE TABLE medicines CASCADE;

-- Clear registrations and patients
TRUNCATE TABLE op_registrations CASCADE;
TRUNCATE TABLE patients CASCADE;

-- Re-insert default consultation charge
INSERT INTO charges (charge_type, charge_name, amount, description, is_active)
VALUES ('consultation', 'Consultation Fee', 150.00, 'Standard consultation fee', true);

-- Success message
SELECT 'All data cleared successfully. Users table preserved.' AS result;
