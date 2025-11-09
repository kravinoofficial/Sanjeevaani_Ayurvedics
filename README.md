# 🏥 Hospital Management System

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A complete, production-ready hospital management system with **table-based authentication**, role-based access control, and comprehensive features for managing hospital operations.

## ✨ Features

### 🔐 Authentication
- **Table-based authentication** (not Supabase Auth)
- Bcrypt password hashing via PostgreSQL
- Session management with localStorage
- Role-based access control
- Secure login/logout

### 👥 5 User Roles
1. **Admin** - Full system access, user & medicine management, reports
2. **Receptionist** - Patient registration, OP registration
3. **Doctor** - OP list, patient consultation, prescriptions
4. **Pharmacist** - Medicine prescription management
5. **Physical Medicine** - Physical treatment management

### 📋 Core Modules
- **User Management** - Create, edit, activate/deactivate users
- **Patient Management** - Register patients with full demographics
- **OP Registration** - Outpatient registration system
- **Medicine Inventory** - Stock management with low stock alerts
- **Prescription System** - Medicine & treatment prescriptions
- **Reports & Analytics** - Real-time statistics and insights

### 🎨 UI/UX
- Modern gradient design
- Fully responsive (mobile, tablet, desktop)
- Color-coded status badges
- Search & filter functionality
- Loading & empty states
- Auto-refresh for OP list
- Smooth transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)

### Installation

1. **Clone & Install**
   ```bash
   git clone <your-repo>
   cd hospital-management-system
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Setup Database**
   - Open Supabase SQL Editor
   - Copy entire `supabase/schema.sql`
   - Run it (creates tables + default admin user)

4. **Start Application**
   ```bash
   npm run dev
   ```

5. **Login**
   ```
   Email: admin@hospital.com
   Password: admin123
   ```
   **⚠️ Change this password immediately!**

## 📚 Documentation

- **[START_HERE.md](START_HERE.md)** ⭐ - Quick start guide
- **[COMPLETE_SYSTEM_GUIDE.md](COMPLETE_SYSTEM_GUIDE.md)** - Complete documentation
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[SETUP_TABLE_AUTH.md](SETUP_TABLE_AUTH.md)** - Authentication details
- **[FEATURES.md](FEATURES.md)** - Complete feature list (150+)
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Daily usage guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js 14)           │
│  - React Server Components              │
│  - TypeScript                           │
│  - Tailwind CSS                         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Authentication (Table-based)         │
│  - Bcrypt password hashing              │
│  - Session management                   │
│  - Role-based access control            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Supabase (PostgreSQL)              │
│  - users (with hashed passwords)        │
│  - patients                             │
│  - op_registrations                     │
│  - medicines                            │
│  - medicine_prescriptions               │
│  - physical_treatment_prescriptions     │
└─────────────────────────────────────────┘
```

## 🔄 Workflows

### Patient Journey
```
Receptionist → Register Patient
     ↓
Receptionist → Create OP Registration
     ↓
Doctor → View in OP List
     ↓
Doctor → Serve & Prescribe
     ↓
Pharmacist/Physical Medicine → Dispense/Treat
     ↓
Status → Completed
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Table-based with bcrypt
- **Deployment**: Vercel-ready

## 📊 Database Schema

### Main Tables
- `users` - User accounts with hashed passwords
- `patients` - Patient records
- `op_registrations` - Outpatient registrations
- `medicines` - Medicine inventory
- `medicine_prescriptions` - Medicine prescriptions
- `physical_treatment_prescriptions` - Treatment prescriptions

### Security Functions
- `hash_password(password)` - Hash passwords with bcrypt
- `verify_password(password, hash)` - Verify passwords

## 🔐 Security

- ✅ Bcrypt password hashing (via PostgreSQL)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Role-based access control
- ✅ Session management
- ✅ Input validation
- ✅ Secure password storage

## 🎯 User Roles & Permissions

| Feature | Admin | Receptionist | Doctor | Pharmacist | Physical Medicine |
|---------|-------|--------------|--------|------------|-------------------|
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Medicines | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ❌ | ❌ | ❌ | ❌ |
| Register Patients | ✅ | ✅ | ❌ | ❌ | ❌ |
| OP Registration | ✅ | ✅ | ❌ | ❌ | ❌ |
| View OP List | ✅ | ❌ | ✅ | ❌ | ❌ |
| Prescribe | ✅ | ❌ | ✅ | ❌ | ❌ |
| Dispense Medicines | ✅ | ❌ | ❌ | ✅ | ❌ |
| Provide Treatments | ✅ | ❌ | ❌ | ❌ | ✅ |

## 📱 Screenshots

### Login Page
Modern gradient design with secure authentication

### Admin Dashboard
Comprehensive analytics and system overview

### Doctor OP List
Real-time patient queue with wait times

### Prescription Interface
Easy-to-use prescription system

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Build
npm run build

# Deploy
vercel deploy
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

## 🧪 Testing

### Build Test
```bash
npm run build
```

### Manual Testing Checklist
- [ ] Login/Logout
- [ ] Create users (all roles)
- [ ] Register patients
- [ ] Create OP registrations
- [ ] Prescribe medicines
- [ ] Dispense medicines
- [ ] Provide treatments

## 📈 Performance

- ✅ Server-side rendering
- ✅ Optimized database queries
- ✅ Indexed database tables
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Caching strategies

## 🔧 Development

### Project Structure
```
hospital-management-system/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── page.tsx           # Login page
├── components/            # Reusable components
├── lib/                   # Utilities & helpers
│   ├── auth.ts           # Authentication logic
│   ├── supabase.ts       # Supabase client
│   └── database.types.ts # TypeScript types
├── scripts/              # SQL utility scripts
├── supabase/             # Database schema
└── public/               # Static assets
```

### Key Files
- `supabase/schema.sql` - Complete database schema
- `lib/auth.ts` - Authentication functions
- `app/api/auth/login/route.ts` - Login API endpoint
- `middleware.ts` - Route protection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- Complete guides in `/docs` folder
- SQL scripts in `/scripts` folder
- Inline code comments

### Common Issues
See [SETUP_TABLE_AUTH.md](SETUP_TABLE_AUTH.md) for troubleshooting.

## 🎓 Training

### For Administrators
1. Create users for staff
2. Add medicines to inventory
3. Monitor reports daily

### For Staff
1. Login with credentials
2. Navigate to your module
3. Follow workflows
4. Check QUICK_REFERENCE.md

## 🌟 Features Highlights

- 🔐 Secure table-based authentication
- 👥 5 user roles with granular permissions
- 💊 Complete medicine inventory system
- 🏥 Patient & OP management
- 📋 Prescription workflows
- 📊 Real-time analytics
- 🎨 Modern responsive UI
- 🔍 Search & filter
- ⚡ Auto-refresh
- 🔔 Low stock alerts
- 📱 Mobile-friendly

## 📊 Statistics

- **150+ Features** implemented
- **15 Pages** across 5 modules
- **6 Database Tables** with relationships
- **100% TypeScript** for type safety
- **Production Ready** and tested

## 🎉 Status

✅ **Complete & Production Ready**

All features implemented, tested, and documented.

## 🔮 Future Enhancements

- [ ] Appointment scheduling
- [ ] Billing system
- [ ] Lab test management
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app

## 👏 Acknowledgments

Built with modern web technologies for efficient hospital operations.

- Next.js - React framework
- Supabase - Backend platform
- Tailwind CSS - Styling
- TypeScript - Type safety

---

**Made with ❤️ for better healthcare management**

For detailed setup instructions, see [START_HERE.md](START_HERE.md)
#   S a n j e e v a a n i _ A y u r v e d i c s  
 