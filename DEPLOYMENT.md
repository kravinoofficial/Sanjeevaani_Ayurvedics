# Deployment Guide

## 🚀 Deploying to Production

This guide covers deploying your Hospital Management System to various platforms.

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Supabase project set up
- Environment variables ready

## Option 1: Vercel (Recommended)

Vercel is the easiest and recommended platform for Next.js applications.

### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: .next

3. **Add Environment Variables**
   In Vercel dashboard, go to Settings > Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

### Custom Domain (Optional)
- Go to Settings > Domains
- Add your custom domain
- Follow DNS configuration instructions

## Option 2: Netlify

### Steps:

1. **Push to Git** (same as Vercel)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect to your Git provider
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **Add Environment Variables**
   - Go to Site settings > Environment variables
   - Add your Supabase credentials

4. **Deploy**

## Option 3: AWS Amplify

### Steps:

1. **Push to Git** (same as above)

2. **Deploy to AWS Amplify**
   - Go to AWS Amplify Console
   - Click "New app" > "Host web app"
   - Connect your repository
   - Configure build settings:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - npm install
         build:
           commands:
             - npm run build
       artifacts:
         baseDirectory: .next
         files:
           - '**/*'
       cache:
         paths:
           - node_modules/**/*
     ```

3. **Add Environment Variables**
   - In app settings, add environment variables

4. **Deploy**

## Option 4: Railway

### Steps:

1. **Push to Git**

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Railway auto-detects Next.js
   - Add environment variables in Variables tab

4. **Deploy**

## Option 5: DigitalOcean App Platform

### Steps:

1. **Push to Git**

2. **Deploy to DigitalOcean**
   - Go to DigitalOcean App Platform
   - Create new app
   - Connect repository
   - Configure:
     - Build Command: `npm run build`
     - Run Command: `npm start`

3. **Add Environment Variables**

4. **Deploy**

## Option 6: Self-Hosted (VPS)

For complete control, deploy to your own server.

### Requirements:
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx
- PM2 (process manager)

### Steps:

1. **Set up server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone and build**
   ```bash
   cd /var/www
   git clone your-repo-url hospital-ms
   cd hospital-ms
   npm install
   npm run build
   ```

3. **Configure environment**
   ```bash
   nano .env.local
   # Add your environment variables
   ```

4. **Start with PM2**
   ```bash
   pm2 start npm --name "hospital-ms" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/hospital-ms
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/hospital-ms /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Post-Deployment Checklist

### Security
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure CORS if needed
- [ ] Enable Supabase RLS policies
- [ ] Change default admin password
- [ ] Set up 2FA in Supabase

### Performance
- [ ] Enable caching
- [ ] Configure CDN (if using)
- [ ] Optimize images
- [ ] Enable compression
- [ ] Monitor performance

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up analytics
- [ ] Enable logging
- [ ] Configure alerts

### Backup
- [ ] Set up database backups
- [ ] Configure automated backups
- [ ] Test restore process
- [ ] Document backup procedures

## Environment Variables

Required environment variables for production:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Optional
NODE_ENV=production
```

## Database Migration

If moving from development to production:

1. **Export development data** (if needed)
   ```sql
   -- In Supabase SQL Editor
   COPY patients TO '/tmp/patients.csv' CSV HEADER;
   ```

2. **Run schema in production**
   - Copy `supabase/schema.sql`
   - Run in production Supabase project

3. **Import data** (if needed)
   ```sql
   COPY patients FROM '/tmp/patients.csv' CSV HEADER;
   ```

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors
- Review build logs

### Environment Variables Not Working
- Ensure variables start with `NEXT_PUBLIC_`
- Restart build after adding variables
- Check variable names match exactly

### Database Connection Issues
- Verify Supabase URL is correct
- Check anon key is valid
- Ensure RLS policies are set up
- Test connection from production

### Performance Issues
- Enable caching
- Optimize database queries
- Add database indexes
- Use CDN for static assets

## Scaling

### Horizontal Scaling
- Use load balancer
- Deploy multiple instances
- Configure session management
- Use Redis for caching

### Database Scaling
- Enable connection pooling
- Add read replicas
- Optimize queries
- Add indexes

### CDN
- Use Vercel Edge Network (automatic)
- Or configure Cloudflare
- Cache static assets
- Optimize images

## Maintenance

### Regular Tasks
- Monitor error logs
- Check database performance
- Review user feedback
- Update dependencies
- Backup database
- Test disaster recovery

### Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart (PM2)
pm2 restart hospital-ms

# Or restart (Vercel)
# Automatic on git push
```

## Support

For deployment issues:
1. Check platform documentation
2. Review error logs
3. Test locally first
4. Check environment variables
5. Verify database connection

## Cost Estimates

### Vercel (Recommended)
- Hobby: Free (personal projects)
- Pro: $20/month (production)

### Netlify
- Starter: Free
- Pro: $19/month

### Railway
- Hobby: $5/month
- Developer: $20/month

### DigitalOcean
- Basic Droplet: $6/month
- App Platform: $12/month

### AWS Amplify
- Pay as you go
- ~$15-30/month typical

### Supabase
- Free tier: 500MB database
- Pro: $25/month (recommended for production)

## Recommended Setup

For production hospital use:

**Platform**: Vercel Pro ($20/month)
**Database**: Supabase Pro ($25/month)
**Domain**: Custom domain ($10-15/year)
**SSL**: Included with Vercel
**Monitoring**: Vercel Analytics (included)

**Total**: ~$45/month + domain

---

Need help? Check the troubleshooting section or review platform documentation.
