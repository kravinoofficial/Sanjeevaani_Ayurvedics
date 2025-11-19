import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    console.log('[TEST] Testing Supabase connection...')
    console.log('[TEST] URL:', process.env.SUPABASE_URL)
    
    // Try to query users table
    const { data, error } = await supabaseServer
      .from('users')
      .select('email, role')
      .limit(1)
    
    if (error) {
      console.log('[TEST] Error:', error)
      return NextResponse.json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        url: process.env.SUPABASE_URL
      })
    }
    
    return NextResponse.json({
      success: true,
      data,
      url: process.env.SUPABASE_URL
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      url: process.env.SUPABASE_URL
    })
  }
}
