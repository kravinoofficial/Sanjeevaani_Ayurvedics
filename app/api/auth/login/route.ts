import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, createSessionToken } from '@/lib/auth-server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    // Verify credentials
    const { user, error } = await verifyCredentials(email, password, role)

    if (error || !user) {
      return NextResponse.json({ error: error || 'Authentication failed' }, { status: 401 })
    }

    // Create session token
    const token = createSessionToken(user)

    // Set secure HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set('hospital_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return NextResponse.json({
      user,
      message: 'Login successful',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
