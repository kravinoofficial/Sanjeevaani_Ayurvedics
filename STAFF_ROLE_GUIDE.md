# Staff Role - Unified Access Guide

## Overview
The **Staff** role provides unified access to Receptionist, Doctor, and Pharmacist functions in a single login.

## Setup Instructions

### 1. Add Staff Role to Database
Run this SQL script in your Supabase SQL Editor:

```sql
-- Add 'staff' role to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';

-- Create a sample staff user (password: staff123)
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'staff@hospital.com',
  crypt('staff123', gen_salt('bf')),
  'Staff User',
  'staff',
  true
)
ON CONFLICT (email) DO UPDATE
SET role = 'staff';
```

Or run the script file:
```bash
# In Supabase SQL Editor, run:
scripts/add-staff-role.sql
```

### 2. Login Credentials
- **URL**: `/login/staff`
- **Email**: `staff@hospital.com`
- **Password**: `staff123`

## Features

### Staff Dashboard Access
When logged in as staff, you have access to:

#### Receptionist Functions
- OP Registration
- Daily OPs
- Patients Management

#### Doctor Functions
- OP List (patients waiting)
- Served Patients

#### Pharmacist Functions
- Prescriptions
- Billing
- Medicines Management
- Physical Treatments
- Stock Management

## Navigation
The staff role has a combined sidebar with all 11 menu items from the three roles:
1. Dashboard
2. OP Registration
3. Daily OPs
4. Patients
5. OP List
6. Served Patients
7. Prescriptions
8. Billing
9. Medicines
10. Physical Treatments
11. Stock Management

## Creating Additional Staff Users

### Via SQL
```sql
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'newstaff@hospital.com',
  crypt('password123', gen_salt('bf')),
  'New Staff Member',
  'staff',
  true
);
```

### Via Admin Dashboard
1. Login as admin
2. Go to Users page
3. Create new user with role "staff"

## Benefits
- **Single Login**: One account for all staff functions
- **Flexibility**: Switch between receptionist, doctor, and pharmacist tasks seamlessly
- **Efficiency**: No need to logout/login when changing tasks
- **Perfect for**: Small clinics, multi-role staff, training purposes

## Home Page
The home page now features a prominent "Staff Login" button marked as "UNIFIED" that combines all three staff roles.
