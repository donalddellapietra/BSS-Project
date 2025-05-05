import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl

        // Skip over API routes and static files
        if (pathname.startsWith("/api") || pathname.startsWith("/static") || pathname.startsWith("/public")) {
            return NextResponse.next();
        }

        // Check auth cookie
        const authCookie = request.cookies.get('auth_session')
        const isAuthenticated = !!authCookie?.value

        // Get user role from a separate cookie if needed
        const roleCookie = request.cookies.get('user_role')
        const isAdmin = roleCookie?.value === 'admin'

        // Handle auth routes (sign-in, sign-up)
        if (pathname.startsWith("/auth/")) {
            if (isAuthenticated) {
                return NextResponse.redirect(new URL("/", request.url))
            }
            return NextResponse.next()
        }

        // Only check authentication for protected routes
        if (pathname.startsWith("/todos") || 
            pathname.startsWith("/admin") || 
            pathname.startsWith("/task-analyzer") || 
            pathname.startsWith("/calendar")) {
            
            if (!isAuthenticated) {
                return NextResponse.redirect(new URL("/auth/sign-in", request.url))
            }

            // Handle admin routes separately
            if (pathname.startsWith("/admin") && !isAdmin) {
                return NextResponse.redirect(new URL("/", request.url))
            }
        }

        return NextResponse.next()
    } catch (error) {
        console.error("Middleware error:", error)
        return NextResponse.redirect(new URL("/auth/sign-in", request.url))
    }
}

export const config = {
    runtime: "nodejs",
    matcher: [
        "/todos/:path*", 
        "/admin/:path*", 
        "/task-analyzer/:path*", 
        "/calendar/:path*",
        "/auth/:path*"
    ]
}
