import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth-server'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/patients - Get all patients
export async function GET() {
  try {
    // Require authentication
    await requireAuth()

    const { data, error } = await supabaseServer
      .from('patients')
      .select('*')
      .order('full_name')

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/patients - Create new patient
export async function POST(request: NextRequest) {
  try {
    // Only receptionist, admin, and staff can create patients
    const user = await requireRole(['receptionist', 'admin', 'staff'])

    const body = await request.json()
    const { full_name, age, gender, phone, address } = body

    // Validate required fields
    if (!full_name) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    // Generate patient ID
    const { count } = await supabaseServer
      .from('patients')
      .select('*', { count: 'exact', head: true })

    const patientId = `P${String((count || 0) + 1).padStart(3, '0')}`

    // Insert patient
    const { data, error } = await supabaseServer
      .from('patients')
      .insert({
        patient_id: patientId,
        full_name,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        phone: phone || null,
        address: address || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
