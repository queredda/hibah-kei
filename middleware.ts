import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Always allow the login route
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }
  
  // Other middleware logic can go here
  
  return NextResponse.next()
}

// Configure which routes should use this middleware
export const config = {
  // Exclude static files, API routes and login path from middleware processing
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}
