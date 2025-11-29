import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { supabaseServer } from '@/lib/supabase-server'

// PUT /api/medicine-categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin', 'staff'])

    const body = await request.json()
    const { name, description, is_active } = body

    const { data, error } = await (supabaseServer as any)
      .from('medicine_categories')
      .update({
        name,
        description,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, category: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/medicine-categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin', 'staff'])

    // Check if category is in use
    const { count } = await (supabaseServer as any)
      .from('stock_items')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', params.id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It is used by ${count} stock item(s)` },
        { status: 400 }
      )
    }

    const { error } = await (supabaseServer as any)
      .from('medicine_categories')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
