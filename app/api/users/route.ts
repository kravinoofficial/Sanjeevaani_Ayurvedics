import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { supabaseServer } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin'])

    const { email, password, full_name, role } = await request.json()

    // Hash password using bcryptjs
    const password_hash = await bcrypt.hash(password, 10)

    // Insert user
    const { data, error } = await supabaseServer
      .from('users')
      .insert({
        email,
        password_hash,
        full_name,
        role,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin'])

    const { data, error } = await supabaseServer
      .from('users')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ users: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
