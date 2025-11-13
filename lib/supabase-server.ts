// Server-side database client
// Uses direct PostgreSQL connection instead of Supabase REST API
import { Pool } from 'pg'
import { createClient } from '@supabase/supabase-js'

// PostgreSQL direct connection (fallback if Supabase REST API not working)
// Only create pool if DATABASE_URL is provided
let pool: Pool | null = null
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })
}

// Supabase client (if REST API is working)
let supabaseClient: any = null
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (process.env.SUPABASE_URL && serviceKey) {
  try {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    console.log('[SUPABASE] Client created successfully')
  } catch (e) {
    console.warn('[SUPABASE] Failed to create client, will use direct PostgreSQL')
  }
}

// Export both for flexibility
export const supabaseServer = supabaseClient
export const db = pool as Pool
