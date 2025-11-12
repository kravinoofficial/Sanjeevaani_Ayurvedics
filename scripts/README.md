# Database Scripts

This folder contains SQL scripts for setting up and securing your hospital management system database.

## 📁 Available Scripts

### 1. `sample-data.sql` (Development/Testing)
**Purpose:** Populate database with sample data and test users

**What it includes:**
- Test users for all roles (admin, receptionist, doctor, pharmacist, physio)
- Sample medicines (10 common medications)
- Sample physical treatments (10 treatment types)
- Sample patients (5 test patients)
- Sample stock items (10 items)
- Sample charges (consultation fees)

**Test Login Credentials:**
```
Staff (Unified): staff@hospital.com / staff123
Admin:          admin@hospital.com / admin123
Receptionist:   receptionist@hospital.com / receptionist123
Doctor:         doctor@hospital.com / doctor123
Pharmacist:     pharmacist@hospital.com / pharmacist123
Physical Med:   physio@hospital.com / physio123
```

**When to run:** After initial database setup, for development/testing only

**How to run:**
1. Open Supabase SQL Editor
2. Copy contents of `sample-data.sql`
3. Execute the script
4. Verify with the queries at the bottom

⚠️ **WARNING:** Do NOT use in production with these default passwords!

---

### 2. `add-staff-role.sql` (Staff Role Migration)
**Purpose:** Add 'staff' role to existing databases

**What it does:**
- Adds 'staff' to the user_role enum
- Creates staff@hospital.com demo account
- Enables unified staff login functionality

**When to run:** If you have an existing database without the 'staff' role

**How to run:**
1. Open Supabase SQL Editor
2. Copy contents of `add-staff-role.sql`
3. Execute the script
4. Verify with the queries at the bottom

---

### 3. `enable-rls-security.sql` (Production Security)
**Purpose:** Enable Row-Level Security to protect your database

**What it does:**
- Enables RLS on all tables
- Creates security policies for role-based access
- Restricts data access based on user authentication
- Prevents unauthorized database queries

**When to run:** Before deploying to production

**How to run:**
1. Open Supabase SQL Editor
2. Copy contents of `enable-rls-security.sql`
3. Execute the script
4. Verify RLS is enabled with verification queries

⚠️ **IMPORTANT:** This is REQUIRED for production deployment!

---

## 🚀 Quick Start Guide

### For Development/Testing:

1. **Setup Database:**
   - Main schema is already in `supabase/schema.sql`
   - It's automatically applied when you create the project

2. **Add Sample Data:**
   ```sql
   -- Run scripts/sample-data.sql in Supabase SQL Editor
   ```

3. **Test Login:**
   - Use any of the test credentials above
   - Login at http://localhost:3000

### For Production:

1. **Setup Database:**
   - Main schema is in `supabase/schema.sql`
   - Applied automatically

2. **Enable Security:**
   ```sql
   -- Run scripts/enable-rls-security.sql in Supabase SQL Editor
   ```

3. **Create Real Users:**
   - Don't use sample data script
   - Create users through admin panel
   - Use strong passwords

4. **Change Admin Password:**
   ```sql
   UPDATE users 
   SET password_hash = hash_password('your-strong-password')
   WHERE email = 'admin@hospital.com';
   ```

---

## 📋 Script Execution Order

1. ✅ Main schema (`supabase/schema.sql`) - Auto-applied
2. 🧪 Sample data (`sample-data.sql`) - Optional, dev only
3. 🔒 RLS Security (`enable-rls-security.sql`) - Required for production

---

## 🔍 Verification

After running scripts, verify everything is set up correctly:

```sql
-- Check users
SELECT email, full_name, role FROM users;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check sample data (if loaded)
SELECT 
  (SELECT COUNT(*) FROM medicines) as medicines,
  (SELECT COUNT(*) FROM physical_treatments) as treatments,
  (SELECT COUNT(*) FROM patients) as patients,
  (SELECT COUNT(*) FROM stock_items) as stock_items;
```

---

## ⚠️ Important Notes

1. **Sample Data:**
   - Only for development/testing
   - Contains weak passwords
   - Should NOT be used in production

2. **RLS Security:**
   - MUST be enabled before production
   - Protects against unauthorized access
   - Required for HIPAA/GDPR compliance

3. **Passwords:**
   - Change all default passwords
   - Use strong passwords (12+ characters)
   - Enable 2FA for admin accounts

4. **Backup:**
   - Always backup before running scripts
   - Test in development first
   - Keep scripts version controlled

---

## 🆘 Troubleshooting

### "Function hash_password does not exist"
**Solution:** Main schema not applied. Check `supabase/schema.sql` is loaded.

### "Relation does not exist"
**Solution:** Tables not created. Ensure main schema is applied first.

### "RLS policies not working"
**Solution:** Check if RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables;`

### "Cannot login with test credentials"
**Solution:** Ensure `sample-data.sql` was executed successfully.

---

## 📚 Additional Resources

- **Security Guide:** `../SECURITY_FIX_GUIDE.md`
- **API Migration:** `../MIGRATION_TO_SECURE_API.md`
- **Quick Start:** `../SECURE_API_QUICKSTART.md`
- **Full Audit:** `../SECURITY_AUDIT_REPORT.md`

---

**Last Updated:** November 12, 2025  
**Version:** 2.0 - Simplified & Secured
