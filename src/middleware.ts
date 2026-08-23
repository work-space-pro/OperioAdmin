import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const adminSessionId = request.cookies.get('operio_admin_session')?.value
  const portalSessionId = request.cookies.get('operio_portal_session')?.value

  // Check if route is in the Client Portal namespace
  const isPortalRoute = pathname.startsWith('/portal')

  if (isPortalRoute) {
    const isPortalAuthPage = 
      pathname === '/portal/login' || 
      pathname === '/portal/forgot-password' || 
      pathname === '/portal/reset-password'

    // If client is already logged in and visits portal auth page -> redirect to /portal
    if (portalSessionId && isPortalAuthPage) {
      return NextResponse.redirect(new URL('/portal', request.url))
    }

    // If client is unauthenticated and visits protected portal page -> redirect to /portal/login
    if (!portalSessionId && !isPortalAuthPage) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }

    return NextResponse.next()
  }

  // Admin CRM Namespace
  const isAdminLoginPage = pathname.startsWith('/login')
  const isApiRoute = pathname.startsWith('/api')

  if (!adminSessionId && !isAdminLoginPage && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (adminSessionId && isAdminLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Static asset extensions (.jpg, .jpeg, .png, .svg, .webp, .ico, etc.)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|webp|gif|woff|woff2|ttf|eot)|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
