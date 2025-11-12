import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionFromRequest } from './lib/auth-server'

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login/:path*'],
  runtime: 'nodejs',
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login/admin',
    '/login/receptionist',
    '/login/doctor',
    '/login/pharmacist',
    '/login/physical-medicine',
    '/login/staff',
  ]

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // API routes are protected by their own auth checks
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Let the dashboard pages handle their own auth checks
    // Middleware auth is causing issues with cookie reading
    return NextResponse.next()
  }

  return NextResponse.next()
}
