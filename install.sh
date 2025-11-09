#!/bin/bash

echo "========================================"
echo "Hospital Management System - Setup"
echo "========================================"
echo ""

echo "[1/4] Installing dependencies..."
npm install

echo ""
echo "[2/4] Creating environment file..."
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo ".env.local created! Please edit it with your Supabase credentials."
else
    echo ".env.local already exists."
fi

echo ""
echo "[3/4] Setup Instructions:"
echo ""
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Go to your Supabase project"
echo "3. Run the SQL schema from supabase/schema.sql"
echo "4. Create your first admin user (see SETUP.md)"
echo "5. Run: npm run dev"
echo ""

echo "[4/4] Making scripts executable..."
chmod +x install.sh

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Configure .env.local"
echo "2. Set up Supabase database"
echo "3. Run: npm run dev"
echo ""
