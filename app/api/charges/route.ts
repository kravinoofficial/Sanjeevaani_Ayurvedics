import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/charges - Get all charges
export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'receptionist', 'doctor', 'pharmacist', 'staff'])

    const { data, error } = await supabaseServer
      .from('charges')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch charges' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden: Insufficient permissions' ? 403 : 500 }
    )
  }
}

// POST /api/charges - Create new charge
export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin'])

    const body = await request.json()
    const { charge_type, charge_name, amount, description, is_active } = body

    // Validation
    if (!charge_type || !amount) {
      return NextResponse.json(
        { error: 'Charge type and amount are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('charges')
      .insert({
        charge_type,
        charge_name: charge_name || charge_type,
        amount: Number(amount),
        description,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create charge' },
      { status: 500 }
    )
  }
}
