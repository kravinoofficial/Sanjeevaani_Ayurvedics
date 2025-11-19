# Deployment Guide for Coolify

## Prerequisites
- Git repository (GitHub, GitLab, or Gitea)
- Coolify instance running
- Supabase service already deployed in Coolify

## Step 1: Push Code to Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GIT_REPO_URL
git push -u origin main
```

## Step 2: Deploy to Coolify

1. **Login to Coolify** at your Coolify URL

2. **Create New Application**
   - Click "+ New Resource"
   - Select "Application"
   - Choose "Public Repository" or connect your Git account

3. **Configure Application**
   - Repository URL: Your Git repository URL
   - Branch: `main`
   - Build Pack: `nixpacks` (auto-detected for Next.js)
   - Port: `3000`

4. **Set Environment Variables**
   
   In Coolify, go to your application → Environment Variables and add:

   ```env
   # Supabase Configuration (use your actual values from .env file)
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_KEY=<your-service-key>
   
   # JWT Secret
   JWT_SECRET=<your-jwt-secret>
   
   # PostgreSQL
   DATABASE_URL=<your-database-url>
   
   # Node Environment
   NODE_ENV=production
   ```

   **Note:** Replace the placeholder values with your actual credentials from your `.env` file. For internal Docker network deployments, use service names like `http://supabase-kong:8000` for URLs and `supabase-db` for database host.

   **Important:** Replace `supabase-kong` and `supabase-db` with the actual service names from your Coolify Supabase deployment. You can find these in Coolify under your Supabase service.

5. **Deploy**
   - Click "Deploy" button
   - Wait for build to complete
   - Your app will be available at the Coolify-provided URL

## Step 3: Verify Deployment

1. Access your deployed app URL
2. Go to `/login/admin`
3. Login with:
   - Email: `admin@hospital.com`
   - Password: `admin123`

## Troubleshooting

### If login still fails:

1. **Check service names** in Coolify:
   - Go to your Supabase service
   - Note the exact service names (they might be different)
   - Update environment variables accordingly

2. **Check logs**:
   - In Coolify, go to your app → Logs
   - Look for `[AUTH]` messages
   - Check for connection errors

3. **Verify Supabase is accessible**:
   - The app and Supabase must be in the same Docker network
   - In Coolify, check if they're in the same "Network"

### Common Service Names in Coolify:
- Kong: `supabase-kong` or `{project-name}-supabase-kong`
- PostgreSQL: `supabase-db` or `{project-name}-supabase-db`
- PostgREST: `supabase-rest` or `{project-name}-supabase-rest`

## Post-Deployment

1. **Enable RLS** (if not already done):
   - Go to Supabase Studio
   - Run `scripts/enable-rls-security.sql`

2. **Change default password**:
   - Login as admin
   - Go to Settings → Change Password
   - Use a strong password

3. **Create other users**:
   - Go to Admin → Users
   - Create receptionist, doctor, pharmacist accounts

## Local Development

For local development, use the external URLs from your `.env` file. Note that REST API access may be limited from external networks.
