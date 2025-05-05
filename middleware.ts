import { type NextRequest, NextResponse } from "next/server"

// Define routes that require admin privileges
const PROTECTED_ADMIN_PATHS = ["/admin"]

export async function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl

        // Bypass middleware for system routes and static assets
        if (
            pathname.startsWith("/api") ||
            pathname.startsWith("/_next") ||
            pathname.includes(".")
        ) {
            return NextResponse.next()
        }

        // For admin-protected routes, verify session cookie existence
        // Note: Detailed authentication happens at the page level
        if (PROTECTED_ADMIN_PATHS.some(path => pathname.startsWith(path))) {
            const cookies = request.headers.get("cookie") || ""
            
            // Redirect to login if no session cookie found
            if (!cookies.includes("session-token=")) {
                const redirectUrl = new URL("/auth/sign-in", request.url)
                redirectUrl.searchParams.set("callbackUrl", pathname)
                return NextResponse.redirect(redirectUrl)
            }
        }

        return NextResponse.next()
    } catch (error) {
        console.error("Middleware error:", error)
        const redirectUrl = new URL("/auth/sign-in", request.url)
        return NextResponse.redirect(redirectUrl)
    }
}

export const config = {
    matcher: [
        // Middleware only processes admin routes
        "/admin/:path*"
    ],
}
