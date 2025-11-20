import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const uid = request.cookies.get('uid')?.value
  const pathname = request.nextUrl.pathname

  // Protect admin routes
  if (pathname.startsWith('/nadzorna-plosca') || pathname.startsWith('/api/admin')) {
    if (!uid) {
      return NextResponse.redirect(new URL('/prijava', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/nadzorna-plosca/:path*', '/api/admin/:path*']
}
