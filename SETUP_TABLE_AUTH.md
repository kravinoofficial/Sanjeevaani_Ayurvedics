# Table-Based Authentication Setup Guide

This system uses **table-based authentication** instead of Supabase Auth. Users are stored directly in the database with hashed passwords.

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (1-2 minutes)
3. Go to Project Settings > API
4. Copy your:
   - Project URL
   - Anon/Public Key

### 3. Configure Environment Variables

Create `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Set Up Database

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the **entire contents** of `supabase/schema.sql`
5. Paste into the SQL editor
6. Click **Run** to execute

This will:
- Create all necessary tables
- Set up password hashing functions
- Create a default admin user

### 5. Default Admin Account

The schema automatically creates an admin account:

```
Email: admin@hospital.com
Password: admin123
```

**⚠️ IMPORTANT: Change this password immediately after first login!**

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How Authentication Works

### Password Security
- Passwords are hashed using **bcrypt** (via PostgreSQL's `pgcrypto` extension)
- Password hashes are stored in the `users` table
- Plain text passwords are never stored

### Login Process
1. User enters email and password
2. System queries `users` table for matching email
3. Password is verified using PostgreSQL's `verify_password()` function
4. If valid, user data (without password) is stored in localStorage
5. User is redirected to dashboard

### Session Management
- User session is stored in browser's localStorage
- Session persists across page refreshes
- Logout clears the session

## Creating New Users

### As Admin (Recommended)
1. Login as admin
2. Go to **Users** page
3. Click **Add User**
4. Fill in details:
   - Email
   - Password
   - Full Name
   - Role (receptionist, doctor, pharmacist, physical_medicine, admin)
5. Click **Create User**

### Manually via SQL
```sql
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'user@hospital.com',
  hash_password('password123'),
  'User Name',
  'doctor',
  true
);
```

## User Roles

### Admin
- Full system access
- Manage users
- Manage medicines
- View all reports

### Receptionist
- Register patients
- Create OP registrations
- View patient list

### Doctor
- View OP waiting list
- Serve patients
- Prescribe medicines
- Prescribe physical treatments

### Pharmacist
- View medicine prescriptions
- Mark prescriptions as served/cancelled

### Physical Medicine
- View physical treatment prescriptions
- Mark treatments as served/cancelled

## Security Features

### Password Hashing
- Uses bcrypt algorithm
- Salt rounds: 10 (default)
- Implemented via PostgreSQL functions

### SQL Functions

#### hash_password(password TEXT)
Hashes a plain text password using bcrypt.

```sql
SELECT hash_password('mypassword');
```

#### verify_password(password TEXT, password_hash TEXT)
Verifies a password against its hash.

```sql
SELECT verify_password('mypassword', '$2a$10$...');
```

## Troubleshooting

### Can't Login
1. **Check credentials**: Verify email and password
2. **Check user status**: Ensure `is_active = true`
   ```sql
   SELECT email, is_active FROM users WHERE email = 'your@email.com';
   ```
3. **Reset password**:
   ```sql
   UPDATE users 
   SET password_hash = hash_password('newpassword123')
   WHERE email = 'your@email.com';
   ```

### "Function hash_password does not exist"
The schema wasn't run completely. Re-run the entire `schema.sql` file.

### "Extension pgcrypto does not exist"
Enable the extension:
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### User Can't Access Features
Check user role and active status:
```sql
SELECT email, role, is_active FROM users WHERE email = 'user@email.com';
```

## Changing Passwords

### Via Admin Interface (Coming Soon)
Will be added in future update.

### Via SQL
```sql
UPDATE users 
SET password_hash = hash_password('new_password_here')
WHERE email = 'user@email.com';
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Roles Enum
```sql
CREATE TYPE user_role AS ENUM (
  'admin',
  'receptionist', 
  'doctor',
  'pharmacist',
  'physical_medicine'
);
```

## Production Deployment

### Security Checklist
- [ ] Change default admin password
- [ ] Use strong passwords for all users
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Restrict database access
- [ ] Monitor login attempts
- [ ] Implement rate limiting (future)

### Environment Variables
Ensure these are set in production:
```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

## API Endpoints

### POST /api/auth/login
Login endpoint for authentication.

**Request:**
```json
{
  "email": "user@hospital.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@hospital.com",
    "full_name": "User Name",
    "role": "doctor",
    "is_active": true
  },
  "message": "Login successful"
}
```

**Response (Error):**
```json
{
  "error": "Invalid email or password"
}
```

## Differences from Supabase Auth

| Feature | Supabase Auth | Table Auth |
|---------|---------------|------------|
| User Storage | auth.users | public.users |
| Password Hashing | Automatic | PostgreSQL functions |
| Session Management | JWT tokens | localStorage |
| Email Verification | Built-in | Not implemented |
| Password Reset | Built-in | Manual via SQL |
| OAuth | Supported | Not supported |
| MFA | Supported | Not supported |

## Future Enhancements

Planned features:
- [ ] Password reset via email
- [ ] Password change in UI
- [ ] Session timeout
- [ ] Login attempt tracking
- [ ] Account lockout after failed attempts
- [ ] Password strength requirements
- [ ] Two-factor authentication
- [ ] Audit log for user actions

## Support

For issues:
1. Check this guide
2. Verify database schema is complete
3. Check browser console for errors
4. Verify Supabase connection

---

**Note**: This is a simplified authentication system suitable for internal hospital use. For public-facing applications, consider using Supabase Auth or other enterprise authentication solutions.
