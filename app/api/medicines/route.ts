import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/medicines - Get all medicines
export async function GET(request: NextRequest) {
  try {
    await requireRole(['admin', 'doctor', 'pharmacist', 'receptionist', 'staff'])

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabaseServer
      .from('medicines')
      .select('*')
      .order('name')

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch medicines' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden: Insufficient permissions' ? 403 : 500 }
    )
  }
}

// POST /api/medicines - Create new medicine
export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin', 'pharmacist'])

    const body = await request.json()
    const { name, description, unit, price } = body

    // Validation
    if (!name || !unit || price === undefined) {
      return NextResponse.json(
        { error: 'Name, unit, and price are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('medicines')
      .insert({
        name,
        description,
        unit,
        price: Number(price),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create medicine' },
      { status: 500 }
    )
  }
}
