// Server-side authentication utilities
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { supabaseServer } from './supabase-server'
import { sign, verify } from 'jsonwebtoken'

// Lazy validation - only check JWT_SECRET when actually used
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  
  // Allow build to proceed without JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production')
    }
    // Return a placeholder for build time
    return 'build-time-placeholder-jwt-secret-minimum-32-characters-long'
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  
  return secret
}

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
  return sign(user, getJwtSecret(), {
    expiresIn: '8h', // Session expires after 8 hours
  })
}

// Verify session token
export function verifySessionToken(token: string): SessionUser | null {
  try {
    return verify(token, getJwtSecret()) as SessionUser
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
    console.log('[AUTH] Attempting login for:', email)
    console.log('[AUTH] Querying Supabase...')
    
    const { data: user, error: queryError } = await (supabaseServer as any)
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (queryError || !user) {
      console.log('[AUTH] Query error:', queryError)
      console.log('[AUTH] No user found with email:', email)
      return { user: null, error: 'Invalid email or password' }
    }
    
    console.log('[AUTH] User found:', { email: user.email, role: user.role })

    console.log('[AUTH] Verifying password...')

    // Verify password using bcrypt
    const bcrypt = require('bcryptjs')
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      console.log('[AUTH] Password verification failed')
      return { user: null, error: 'Invalid email or password' }
    }

    console.log('[AUTH] Password verified successfully')

    // Check role if required
    if (requiredRole && requiredRole !== 'staff') {
      // For non-staff logins, require exact role match
      if (user.role !== requiredRole) {
        console.log('[AUTH] Role mismatch. Required:', requiredRole, 'Got:', user.role)
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
    console.log('[AUTH] Login successful for:', sessionUser.email)
    return { user: sessionUser as SessionUser, error: null }
  } catch (error: any) {
    console.error('[AUTH] Authentication error:', error.message)
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
