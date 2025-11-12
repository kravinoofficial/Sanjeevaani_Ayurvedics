# Migration Guide: Secure API Architecture

## Overview

This guide explains how to migrate from direct Supabase client access to a secure server-side API architecture.

## What Changed?

### Before (Insecure):
```typescript
// Client directly accesses database
const { data } = await supabase.from('patients').select('*')
```

### After (Secure):
```typescript
// Client calls API, server accesses database
const { data } = await api.getPatients()
```

## Benefits

✅ **Database credentials hidden** - Never exposed to client  
✅ **Role-based access control** - Enforced on server  
✅ **Audit logging** - Track all data access  
✅ **Input validation** - Sanitize all inputs  
✅ **Rate limiting** - Prevent abuse  
✅ **Session management** - Secure HTTP-only cookies  

---

## Step-by-Step Migration

### Step 1: Install Dependencies

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### Step 2: Update Environment Variables

Add to `.env`:
```env
JWT_SECRET=your-super-secret-key-min-32-characters-long
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase
```

**Get Service Role Key:**
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy `service_role` key (NOT anon key)

### Step 3: Update Imports

**Old:**
```typescript
import { supabase } from '@/lib/supabase'
```

**New:**
```typescript
import { api } from '@/lib/api-client'
```

### Step 4: Update Data Fetching

**Old:**
```typescript
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .order('full_name')
```

**New:**
```typescript
const { data, error } = await api.getPatients()
```

### Step 5: Update Authentication

**Old:**
```typescript
import { signIn, getCurrentUser } from '@/lib/auth'

const { data, error } = await signIn(email, password, role)
const user = await getCurrentUser()
```

**New:**
```typescript
import { api } from '@/lib/api-client'

const { data, error } = await api.login(email, password, role)
const { data: userData } = await api.getCurrentUser()
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/[id]` - Get single patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient (admin only)

### OP Registrations
- `GET /api/op-registrations` - List registrations
- `GET /api/op-registrations/[id]` - Get single registration
- `POST /api/op-registrations` - Create registration
- `PUT /api/op-registrations/[id]` - Update registration

### Medicines
- `GET /api/medicines` - List medicines
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/[id]` - Update medicine
- `DELETE /api/medicines/[id]` - Delete medicine

### Prescriptions
- `GET /api/prescriptions?opId=[id]` - Get prescriptions for OP
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/[id]/status` - Update status

### And more... (see lib/api-client.ts for full list)

---

## Migration Checklist

### Phase 1: Setup (1-2 hours)
- [ ] Install dependencies
- [ ] Add JWT_SECRET to .env
- [ ] Add SUPABASE_SERVICE_ROLE_KEY to .env
- [ ] Test login with new API

### Phase 2: Create API Routes (1-2 days)
- [ ] Patients API ✅ (Already created)
- [ ] OP Registrations API
- [ ] Medicines API
- [ ] Prescriptions API
- [ ] Treatments API
- [ ] Billing API
- [ ] Stock API
- [ ] Users API
- [ ] Reports API

### Phase 3: Update Client Code (2-3 days)
- [ ] Update all login pages
- [ ] Update patient pages
- [ ] Update OP registration
- [ ] Update doctor serve page
- [ ] Update pharmacist pages
- [ ] Update physical medicine pages
- [ ] Update admin pages
- [ ] Update reports

### Phase 4: Testing (1-2 days)
- [ ] Test all user roles
- [ ] Test all CRUD operations
- [ ] Test authentication flow
- [ ] Test authorization (role access)
- [ ] Test error handling
- [ ] Test session timeout

### Phase 5: Security Hardening (1 day)
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Add audit logging
- [ ] Add CSRF protection
- [ ] Review all API endpoints
- [ ] Security audit

---

## Example: Migrating a Component

### Before:
```typescript
'use client'
import { supabase } from '@/lib/supabase'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .order('full_name')
    setPatients(data || [])
  }

  return <div>...</div>
}
```

### After:
```typescript
'use client'
import { api } from '@/lib/api-client'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    const { data, error } = await api.getPatients()
    if (error) {
      alert('Error: ' + error)
      return
    }
    setPatients(data || [])
  }

  return <div>...</div>
}
```

---

## Common Issues & Solutions

### Issue: "Unauthorized" error
**Solution:** Make sure you're logged in and session cookie is set

### Issue: "Forbidden" error
**Solution:** Check if your user role has permission for this action

### Issue: Session expires
**Solution:** Sessions expire after 8 hours. User needs to login again.

### Issue: CORS errors
**Solution:** API routes are on same domain, no CORS needed

---

## Testing the Migration

### Test Authentication:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'

# Get current user
curl http://localhost:3000/api/auth/me \
  -H "Cookie: hospital_session=YOUR_SESSION_TOKEN"
```

### Test API Endpoints:
```bash
# Get patients
curl http://localhost:3000/api/patients \
  -H "Cookie: hospital_session=YOUR_SESSION_TOKEN"

# Create patient
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -H "Cookie: hospital_session=YOUR_SESSION_TOKEN" \
  -d '{"full_name":"Test Patient","age":30,"gender":"male"}'
```

---

## Performance Considerations

- API calls add ~50-100ms latency vs direct database access
- Use React Query or SWR for caching
- Implement pagination for large datasets
- Add database indexes for frequently queried fields

---

## Next Steps

1. Complete all API routes (use patients API as template)
2. Update all client components to use api-client
3. Remove old `lib/supabase.ts` and `lib/auth.ts`
4. Test thoroughly
5. Deploy to production

---

## Need Help?

- Check `lib/api-client.ts` for available methods
- Check `app/api/patients/route.ts` for API route example
- Check `lib/auth-server.ts` for auth utilities
- Review error messages in browser console

---

**Estimated Total Migration Time:** 5-7 days  
**Priority:** HIGH - Required for production deployment  
**Status:** In Progress - Patients API completed ✅
