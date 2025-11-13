// Server-side authentication utilities
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { supabaseServer } from './supabase-server'
import { sign, verify } from 'jsonwebtoken'

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters long')
}

const JWT_SECRET = process.env.JWT_SECRET
const SESSION_COOKIE_NAME = 'hospital_session'

export type SessionUser = {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}

// Create session token
export function createSessionToken(user: SessionUser): string {
  return sign(user, JWT_SECRET, {
    expiresIn: '8h', // Session expires after 8 hours
  })
}

// Verify session token
export function verifySessionToken(token: string): SessionUser | null {
  try {
    return verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

// Get session from cookies
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie) {
      return null
    }

    return verifySessionToken(sessionCookie.value)
  } catch {
    return null
  }
}

// Get session from request
export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)

    if (!sessionCookie) {
      return null
    }

    return verifySessionToken(sessionCookie.value)
  } catch {
    return null
  }
}

// Verify user credentials
export async function verifyCredentials(
  email: string,
  password: string,
  requiredRole?: string
): Promise<{ user: SessionUser | null; error: string | null }> {
  try {
    let user: any = null
    
    // Try Supabase first
    if (supabaseServer) {
      const { data, error: userError } = await supabaseServer
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()
      
      if (!userError && data) {
        user = data
      }
    }
    
    // Fallback to direct PostgreSQL if Supabase failed
    if (!user) {
      try {
        const { db: pgPool } = await import('./supabase-server')
        const result = await pgPool.query(
          'SELECT * FROM users WHERE email = $1 AND is_active = true LIMIT 1',
          [email]
        )
        if (result.rows.length > 0) {
          user = result.rows[0]
        }
      } catch (dbError: any) {
        console.error('[AUTH] Database connection error:', dbError.message)
      }
    }

    if (!user) {
      return { user: null, error: 'Invalid email or password' }
    }

    // Verify password using bcrypt
    const bcrypt = require('bcryptjs')
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return { user: null, error: 'Invalid email or password' }
    }

    // Check role if required
    if (requiredRole && requiredRole !== 'staff') {
      // For non-staff logins, require exact role match
      if (user.role !== requiredRole) {
        return {
          user: null,
          error: `Access denied. This login is for ${requiredRole} only.`,
        }
      }
    }

    // For staff role login, allow if user has staff role OR any medical role
    if (requiredRole === 'staff') {
      const allowedRoles = ['staff', 'receptionist', 'doctor', 'pharmacist', 'physical_medicine']
      if (!allowedRoles.includes(user.role)) {
        return {
          user: null,
          error: 'Access denied. This login is for staff only.',
        }
      }
    }

    // Return user without password
    const { password_hash, ...sessionUser } = user
    return { user: sessionUser as SessionUser, error: null }
  } catch (error: any) {
    return { user: null, error: error.message || 'Authentication failed' }
  }
}

// Check if user has required role
export function hasRole(user: SessionUser | null, allowedRoles: string[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

// Require authentication middleware
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}

// Require specific role middleware
export async function requireRole(allowedRoles: string[]): Promise<SessionUser> {
  const session = await requireAuth()

  if (!hasRole(session, allowedRoles)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return session
}
