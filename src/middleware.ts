import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/events",
    "/auth/signin",
    "/auth/signup",
    "/api/auth",
    "/api/trpc",
    "/_next",
    "/favicon.ico",
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, we'll let the page components handle authentication
  // since NextAuth middleware has changed in newer versions
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
