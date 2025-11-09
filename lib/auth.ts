import { supabase } from './supabase'
import { UserRole } from './database.types'

// Store current user in memory (in production, use secure session storage)
let currentUser: any = null

export async function signIn(email: string, password: string, requiredRole?: UserRole) {
  try {
    // Call the verify_password function
    const { data, error } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { data: null, error: { message: 'Invalid email or password' } }
    }

    // Verify password using PostgreSQL function
    const { data: verifyData, error: verifyError } = await (supabase as any)
      .rpc('verify_password', {
        password: password,
        password_hash: data.password_hash
      })

    if (verifyError || !verifyData) {
      return { data: null, error: { message: 'Invalid email or password' } }
    }

    // Check role if required
    if (requiredRole && data.role !== requiredRole) {
      return { data: null, error: { message: `Access denied. This login is for ${requiredRole} only.` } }
    }

    // Store user in session (exclude password_hash)
    const { password_hash, ...userWithoutPassword } = data
    currentUser = userWithoutPassword
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
    }

    return { data: { user: userWithoutPassword }, error: null }
  } catch (error: any) {
    return { data: null, error: { message: error.message } }
  }
}

export async function signOut() {
  currentUser = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser')
  }
  return { error: null }
}

export async function getCurrentUser() {
  // Check memory first
  if (currentUser) {
    return currentUser
  }

  // Check localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      currentUser = JSON.parse(stored)
      return currentUser
    }
  }

  return null
}

export async function checkRole(allowedRoles: UserRole[]) {
  const profile: any = await getCurrentUser()
  if (!profile) return false
  return allowedRoles.includes(profile.role)
}

export async function createUser(email: string, password: string, full_name: string, role: UserRole) {
  try {
    // Hash password using PostgreSQL function
    const { data: hashData, error: hashError } = await (supabase as any)
      .rpc('hash_password', { password })

    if (hashError || !hashData) {
      return { data: null, error: { message: 'Failed to hash password' } }
    }

    // Insert user
    const { data, error } = await (supabase as any)
      .from('users')
      .insert({
        email,
        password_hash: hashData,
        full_name,
        role,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: { message: error.message } }
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    // Hash new password
    const { data: hashData, error: hashError } = await (supabase as any)
      .rpc('hash_password', { password: newPassword })

    if (hashError || !hashData) {
      return { error: { message: 'Failed to hash password' } }
    }

    // Update user
    const { error } = await (supabase as any)
      .from('users')
      .update({ password_hash: hashData })
      .eq('id', userId)

    return { error }
  } catch (error: any) {
    return { error: { message: error.message } }
  }
}
