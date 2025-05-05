import { type NextRequest, NextResponse } from "next/server"
import { authClient } from "@/lib/auth-client"

export async function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl

        // Skip over API routes and static files
        if (pathname.startsWith("/api") || pathname.startsWith("/static") || pathname.startsWith("/public")) {
            return NextResponse.next();
        }

        const session = await authClient.getSession({
            fetchOptions: {
                headers: request.headers
            }
        }) 

        const isAuthenticated = !!session?.data?.user

        // Handle auth routes (sign-in, sign-up)
        if ((pathname.startsWith("/auth/sign-in") || pathname.startsWith("/auth/sign-up"))) {
            if (isAuthenticated) {
                return NextResponse.redirect(new URL("/todos", request.url))
            }
            return NextResponse.next()
        }

        // Handle protected routes
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL("/auth/sign-in", request.url))
        }

        // Handle admin routes
        if (pathname.startsWith("/admin")) {
            if (session?.data?.user?.role !== 'admin') {
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
        "/auth/:path*"  // Add auth routes to matcher
    ]
}
