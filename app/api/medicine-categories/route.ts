import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-server'
import { supabaseServer } from '@/lib/supabase-server'

// GET /api/medicine-categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await (supabaseServer as any)
      .from('medicine_categories')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json({ categories: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/medicine-categories - Create new category
export async function POST(request: NextRequest) {
  try {
    await requireRole(['admin', 'staff'])

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const { data, error } = await (supabaseServer as any)
      .from('medicine_categories')
      .insert({
        name,
        description,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, category: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
