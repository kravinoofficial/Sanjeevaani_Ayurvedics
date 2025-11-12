# Sanjeevani Ayurvedics Website Setup Guide

## Project Created
Location: `C:\Users\ajmal\Desktop\kravino Innovations\sanjeevani-website`

## Step 1: Install Dependencies

```bash
cd ../sanjeevani-website
npm install @supabase/supabase-js
```

## Step 2: Create .env.local

Create `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://weowrsvvsqragqzvqzmn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlb3dyc3Z2c3FyYWdxenZxem1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1Mjg2MTcsImV4cCI6MjA3ODEwNDYxN30.guOvdFsX7lAxv4u1q9fNtOA0nTD7n4hAJL6WeB6y2Sk

SUPABASE_URL=https://weowrsvvsqragqzvqzmn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlb3dyc3Z2c3FyYWdxenZxem1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUyODYxNywiZXhwIjoyMDc4MTA0NjE3fQ.C_MwTqivzPQckfJwjrDSqroTcBZEAjEiPPb7TB0x_Fs

JWT_SECRET=f213e827093bc61d01a3856bf3a820f36def8ec4d35b33084f26602cca87f368
```

## Step 3: Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Website content table
CREATE TABLE IF NOT EXISTS website_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section TEXT NOT NULL, -- 'hero', 'about', 'contact'
  title TEXT,
  content TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatments/Services table
CREATE TABLE IF NOT EXISTS website_treatments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  benefits TEXT[],
  duration TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data
INSERT INTO website_content (section, title, content) VALUES
('hero', 'Sanjeevani Ayurvedics', 'Ancient Wisdom. Modern Care. Experience authentic Ayurvedic healing.'),
('about', 'About Us', 'We provide traditional Ayurvedic treatments with a modern approach to healthcare.'),
('contact', 'Contact Information', 'Chanthavila, Thiruvananthapuram 695584 | Phone: 8589007205');

INSERT INTO website_treatments (name, description, benefits, duration, price, is_featured) VALUES
('Panchakarma Therapy', 'Complete detoxification and rejuvenation through five purification procedures', ARRAY['Deep cleansing', 'Toxin removal', 'Rejuvenation'], '7-14 days', 15000.00, true),
('Abhyanga Massage', 'Therapeutic oil massage to balance doshas and improve circulation', ARRAY['Stress relief', 'Better circulation', 'Muscle relaxation'], '60 minutes', 1500.00, true),
('Shirodhara', 'Continuous stream of warm oil on forehead for mental clarity', ARRAY['Mental peace', 'Better sleep', 'Stress reduction'], '45 minutes', 2000.00, true);
```

## Step 4: File Structure

Create these files in the sanjeevani-website folder:

### lib/supabase.ts
### app/page.tsx (Homepage)
### app/portal/page.tsx (Admin login)
### app/portal/dashboard/page.tsx (Content management)
### app/api/treatments/route.ts
### app/api/content/route.ts

## Step 5: Run the Website

```bash
npm run dev
```

Website will be at: http://localhost:3000
Portal will be at: http://localhost:3000/portal

## Features

1. **Public Website** - Single page showing all treatments
2. **Admin Portal** - Manage treatments and content
3. **Same Database** - Uses your existing Supabase database
4. **Green Theme** - Matches your hospital management system

## Next Steps

1. Copy logo2.png to public folder
2. Customize content through portal
3. Deploy to Vercel

