import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if user is authenticated (has session in cookie or localStorage)
  // Since we're using client-side auth, we'll let the client handle redirects
  // This middleware just ensures proper routing

  // Protect dashboard routes - client will handle auth check
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Allow access to login page
  if (pathname === '/') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
