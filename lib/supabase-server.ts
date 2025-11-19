// Server-side Supabase client
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!serviceKey) {
  throw new Error('Missing SUPABASE_SERVICE_KEY environment variable')
}

// Create Supabase client with service role key
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

console.log('[SUPABASE] Server client initialized with URL:', supabaseUrl)
