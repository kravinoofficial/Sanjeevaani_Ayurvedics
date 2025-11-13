# Deploy to Coolify Without GitHub

## Option 1: Using Docker Registry

### Step 1: Build Docker Image Locally

```powershell
# Build the image
docker build -t hospital-management:latest .

# Tag for your registry (if using Docker Hub)
docker tag hospital-management:latest yourusername/hospital-management:latest

# Push to registry
docker push yourusername/hospital-management:latest
```

### Step 2: Deploy in Coolify

1. In Coolify, click "+ New Resource"
2. Select "Docker Image"
3. Enter your image: `yourusername/hospital-management:latest`
4. Set Port: `3000`
5. Add environment variables (see below)
6. Deploy!

---

## Option 2: Direct Dockerfile Deployment (Easiest!)

### Step 1: Compress Your Project

```powershell
# Create a zip file of your project (exclude node_modules)
Compress-Archive -Path * -DestinationPath hospital-app.zip -Force
```

### Step 2: Upload to Server

```powershell
# Upload via SCP
scp hospital-app.zip user@82.112.227.34:/tmp/

# Or use WinSCP, FileZilla, or any FTP client
```

### Step 3: Deploy in Coolify

1. SSH into your server:
   ```powershell
   ssh user@82.112.227.34
   ```

2. Extract and prepare:
   ```bash
   cd /tmp
   unzip hospital-app.zip -d hospital-app
   cd hospital-app
   ```

3. In Coolify:
   - Create "Simple Dockerfile" application
   - Point to the directory: `/tmp/hospital-app`
   - Coolify will use your Dockerfile
   - Set environment variables
   - Deploy!

---

## Option 3: Use Coolify's Built-in Git (Simplest!)

Coolify has a built-in Git server!

### Step 1: Initialize Git Locally

```powershell
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to Coolify's Git

1. In Coolify, create a new "Git Repository" resource
2. Coolify will give you a Git URL like: `http://82.112.227.34:3000/git/your-repo.git`
3. Add remote and push:
   ```powershell
   git remote add coolify http://82.112.227.34:3000/git/your-repo.git
   git push coolify main
   ```

4. Deploy from that repository in Coolify

---

## Environment Variables (For All Options)

When deploying, add these environment variables in Coolify:

```env
# Supabase (use internal Docker network names)
NEXT_PUBLIC_SUPABASE_URL=http://supabase-kong:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2Mjk2Njg2MCwiZXhwIjo0OTE4NjQwNDYwLCJyb2xlIjoiYW5vbiJ9.obNvHeTjpCNnKVutRoWh3EeHVBGhpGWzBGaHLkfqj5A

SUPABASE_URL=http://supabase-kong:8000
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2Mjk2Njg2MCwiZXhwIjo0OTE4NjQwNDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.-zf-aLLkxwl1Sx-j3dfz5l7Ytts4W_V4segKiGNqdqE

JWT_SECRET=f213e827093bc61d01a3856bf3a820f36def8ec4d35b33084f26602cca87f368

DATABASE_URL=postgresql://postgres:JMHF7Ay8Ds8z5zU07hPkFKH4YPry50@supabase-db:5432/postgres

NODE_ENV=production
```

**Important:** Find the exact service names in Coolify:
- Go to your Supabase service
- Check the "Services" tab
- Note the exact names (might be prefixed with project name)

---

## Recommended: Option 3 (Coolify's Git)

This is the easiest because:
- No external Git hosting needed
- Automatic deployments
- Version control built-in
- Easy rollbacks

Just initialize git locally, push to Coolify's Git, and deploy!
