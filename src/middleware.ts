import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/menu",
    "/about",
    "/contact",
    "/auth/signin",
    "/auth/signup",
    "/api/auth",
    "/api/trpc",
    "/api/upload",
    "/_next",
    "/favicon.ico",
    "/uploads",
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  )

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Admin routes require ADMIN role
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req: request })
    
    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL("/auth/signin", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Redirect to home if not admin
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

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
