import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/suppliers - Get all suppliers
export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'pharmacist', 'staff'])

    const { data, error } = await (supabaseServer as any)
      .from('suppliers')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json({ suppliers: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin', 'pharmacist', 'staff'])

    const { name, contact_person, phone, email, address } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 })
    }

    const { data, error } = await (supabaseServer as any)
      .from('suppliers')
      .insert({
        name,
        contact_person,
        phone,
        email,
        address,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, supplier: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
