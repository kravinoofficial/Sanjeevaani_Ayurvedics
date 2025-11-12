import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/charges/[id] - Get single charge
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin'])

    const { data, error } = await supabaseServer
      .from('charges')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch charge' },
      { status: 500 }
    )
  }
}

// PUT /api/charges/[id] - Update charge
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin'])

    const body = await request.json()
    const { amount, description, is_active } = body

    const updateData: any = {}
    if (amount !== undefined) updateData.amount = Number(amount)
    if (description !== undefined) updateData.description = description
    if (is_active !== undefined) updateData.is_active = is_active
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseServer
      .from('charges')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update charge' },
      { status: 500 }
    )
  }
}

// DELETE /api/charges/[id] - Delete charge
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin'])

    const { error } = await supabaseServer
      .from('charges')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ message: 'Charge deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete charge' },
      { status: 500 }
    )
  }
}
