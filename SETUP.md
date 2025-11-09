# Hospital Management System - Setup Guide

## ⚡ Quick Start

This system uses **table-based authentication** (not Supabase Auth). Users are stored in the database with hashed passwords.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git (optional)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully set up (takes 1-2 minutes)
3. Go to Project Settings > API
4. Copy your project URL and anon/public key

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 4: Set Up Database

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the **entire contents** of `supabase/schema.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the schema

This will create:
- All necessary tables
- Password hashing functions (using bcrypt)
- Indexes for performance
- **Default admin user automatically**

## Step 5: Default Admin Account

The schema automatically creates an admin account:

```
Email: admin@hospital.com
Password: admin123
```

**⚠️ IMPORTANT: Change this password after first login!**

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Login

Use the default admin credentials:
- Email: `admin@hospital.com`
- Password: `admin123`

## Step 8: Create Additional Users

Once logged in as admin:
1. Go to "Users" in the navigation
2. Click "Add User"
3. Fill in the form with user details
4. Select appropriate role
5. Click "Create User"

The password will be hashed automatically using bcrypt.

## User Roles

### Admin
- Manage all users
- Manage medicines
- View reports and analytics
- Full system access

### Receptionist
- Register new patients
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

## Troubleshooting

### Can't Login
1. Verify email and password are correct
2. Check user is active in database:
   ```sql
   SELECT email, is_active FROM users WHERE email = 'your@email.com';
   ```
3. Reset password if needed:
   ```sql
   UPDATE users 
   SET password_hash = hash_password('newpassword123')
   WHERE email = 'your@email.com';
   ```

### "Function hash_password does not exist"
The schema wasn't run completely. Re-run the entire `schema.sql` file.

### Database Connection Issues
- Verify Supabase URL is correct
- Check anon key is valid
- Ensure project is active

## Additional Resources

- **SETUP_TABLE_AUTH.md** - Detailed authentication guide
- **scripts/create-user.sql** - SQL templates for creating users
- **scripts/manage-users.sql** - User management queries
- **scripts/reset-password.sql** - Password reset queries

## Security Notes

- Passwords are hashed using bcrypt
- Change default admin password immediately
- Use strong passwords for all users
- Keep Supabase credentials secure
- Enable HTTPS in production

## Support

For issues or questions:
1. Check this guide
2. Review SETUP_TABLE_AUTH.md
3. Check browser console for errors
4. Verify database schema is complete

---

Made with ❤️ for better healthcare management
