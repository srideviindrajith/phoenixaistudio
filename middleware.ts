import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from './lib/auth-cookie'
import { verifyTokenEdge } from './lib/edge-auth'

const protectedPrefixes = ['/admin', '/dashboard']
const hiddenModuleRoutes = ['/career-builder']

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
  const isHiddenModuleRoute = hiddenModuleRoutes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
  const isLoginRoute = pathname === '/login'
  const isAdminLoginRoute = pathname === '/admin/login'

  if (isLoginRoute || isAdminLoginRoute) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (token) {
      try {
        const payload = await verifyTokenEdge(token)
        if (payload) {
          return NextResponse.next()
        }
      } catch (e) {
        // verification error treated as invalid token
      }
      const response = NextResponse.next()
      response.cookies.delete(AUTH_COOKIE_NAME)
      return response
    }

    return NextResponse.next()
  }

  if (isProtectedRoute) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname + search)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const payload = await verifyTokenEdge(token)
      if (!payload) {
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('redirect', pathname + search)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete(AUTH_COOKIE_NAME)
        return response
      }

      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-admin-id', payload.adminId)
      requestHeaders.set('x-admin-email', payload.email)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (e) {
      // verification error -> treat as invalid token
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname + search)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(AUTH_COOKIE_NAME)
      return response
    }
  }

  // Block access to hidden module routes for public users
  if (isHiddenModuleRoute) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    
    // Only allow access if user is authenticated admin
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      const payload = await verifyTokenEdge(token)
      if (!payload) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      // Allow admin access to hidden module routes
      return NextResponse.next()
    } catch (e) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/dashboard', '/dashboard/:path*', '/login', '/career-builder', '/career-builder/:path*'],
}
