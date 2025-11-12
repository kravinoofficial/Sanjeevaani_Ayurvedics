import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/medicines/[id] - Get single medicine
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin', 'doctor', 'pharmacist', 'receptionist', 'staff'])

    const { data, error } = await supabaseServer
      .from('medicines')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch medicine' },
      { status: 500 }
    )
  }
}

// PUT /api/medicines/[id] - Update medicine
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin', 'pharmacist'])

    const body = await request.json()
    const { name, description, unit, price } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (unit !== undefined) updateData.unit = unit
    if (price !== undefined) updateData.price = Number(price)
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseServer
      .from('medicines')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update medicine' },
      { status: 500 }
    )
  }
}

// DELETE /api/medicines/[id] - Delete medicine
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin'])

    const { error } = await supabaseServer
      .from('medicines')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ message: 'Medicine deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete medicine' },
      { status: 500 }
    )
  }
}
