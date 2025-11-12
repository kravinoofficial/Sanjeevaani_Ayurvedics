# Security Fix Guide - Supabase Credentials

## Understanding the Issue

The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is **supposed to be public** - that's how Supabase works. The real problem is:

1. ❌ No Row-Level Security (RLS) enabled
2. ❌ Anon key has unrestricted database access
3. ❌ Anyone can query your database directly

## ⚠️ IMPORTANT: You Have 2 Options

### Option 1: Quick Fix - Enable RLS (Recommended for Now)

**Pros:**
- Minimal code changes
- Keeps current architecture
- Makes anon key safe

**Cons:**
- Still uses client-side database access
- Requires proper authentication setup

**Steps:**

1. **Get your Service Role Key from Supabase:**
   - Go to Supabase Dashboard
   - Project Settings → API
   - Copy the `service_role` key (NOT the anon key)

2. **Update `.env` file:**
   ```env
   # Add this line (keep NEXT_PUBLIC_ ones too):
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Run the RLS script:**
   - Open Supabase SQL Editor
   - Copy contents of `scripts/enable-rls-security.sql`
   - Run it
   - Verify with the verification queries at the bottom

4. **Test everything:**
   - Try logging in as different roles
   - Verify users can only access appropriate data
   - Check that unauthorized access is blocked

**⚠️ WARNING:** After enabling RLS, your current localStorage-based auth won't work properly. You'll need to implement proper Supabase Auth or JWT tokens.

---

### Option 2: Full Server-Side Architecture (Most Secure)

**Pros:**
- Most secure approach
- No database access from client
- Full control over data access

**Cons:**
- Requires rewriting most of the app
- More complex architecture
- Takes significant development time

**What needs to change:**
- All Supabase queries must go through API routes
- Client components call API endpoints instead of database
- Implement proper session management
- Add API authentication middleware

**Estimated effort:** 2-3 weeks of development

---

## 🎯 My Recommendation

**For immediate deployment:**
1. Enable RLS using Option 1
2. This makes your anon key safe
3. Continue using current architecture

**For long-term:**
1. Plan migration to proper Supabase Auth
2. Consider server-side API layer
3. Implement comprehensive security audit

---

## What About the Exposed Keys?

### The Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- ✅ **This is MEANT to be public**
- ✅ It's safe when RLS is enabled
- ✅ Supabase designed it this way
- ❌ Only unsafe without RLS (your current state)

### The Service Role Key
- ❌ **NEVER expose this to client**
- ❌ Has full database access
- ❌ Bypasses all RLS policies
- ✅ Only use in server-side code

---

## Quick Security Checklist

After implementing Option 1:

- [ ] RLS enabled on all tables
- [ ] Service role key added to `.env` (not NEXT_PUBLIC_)
- [ ] `.env` added to `.gitignore`
- [ ] Tested login with different roles
- [ ] Verified unauthorized access is blocked
- [ ] Changed default admin password
- [ ] Documented security policies

---

## Testing RLS

After enabling RLS, test with these queries in Supabase SQL Editor:

```sql
-- This should work (viewing active users)
SELECT * FROM users WHERE is_active = true;

-- This should fail (no auth context)
INSERT INTO patients (patient_id, full_name) 
VALUES ('TEST', 'Test Patient');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## Need Help?

If you encounter issues:
1. Check Supabase logs for RLS policy violations
2. Verify your JWT token is being sent correctly
3. Test policies one table at a time
4. Use Supabase Dashboard → Authentication to debug

---

## Next Steps

1. ✅ Run `scripts/enable-rls-security.sql`
2. ✅ Add service role key to `.env`
3. ✅ Test thoroughly
4. ⏳ Plan migration to proper auth (future)
5. ⏳ Implement audit logging (future)
6. ⏳ Add encryption for sensitive data (future)
