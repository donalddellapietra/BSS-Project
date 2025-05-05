import { type NextRequest, NextResponse } from "next/server"
import { authClient } from "@/lib/auth-client"

export async function middleware(request: NextRequest) {
    try {
        const session = await authClient.getSession({
            fetchOptions: {
                headers: request.headers
            }
        }) 

        const { pathname } = request.nextUrl

        // Check if user is authenticated
        const isAuthenticated = !!session?.data?.user

        // // Handle protected routes
        // if ((pathname.startsWith("/todos") || 
        //      pathname.startsWith("/task-analyzer") || 
        //      pathname.startsWith("/calendar")) && 
        //     !isAuthenticated) {
        //     console.log("Redirecting to sign-in: User not authenticated")
        //     return NextResponse.redirect(new URL("/auth/sign-in", request.url))
        // }
        // Skip over API routes and static files
        if (pathname.startsWith("/api") || pathname.startsWith("/static") || pathname.startsWith("/public")) {
            return NextResponse.next();
        }

        

        const sessionToken = request.cookies.get('session-token');
        if (!sessionToken) {
            console.log("Redirecting to sign-in: Session token not found")
            return NextResponse.redirect(new URL("/auth/sign-in", request.url));
        }

        // if ((pathname.startsWith("/auth/sign-in") || pathname.startsWith("/auth/sign-up")) && isAuthenticated) {
        //     console.log("Redirecting to todos: User already authenticated")
        //     return NextResponse.redirect(new URL("/todos", request.url))
        // }



        if (pathname.startsWith("/admin")) {
            if (!isAuthenticated || session?.data?.user?.role !== 'admin') {
                console.log("Redirecting to sign-in: User not admin")
                return NextResponse.redirect(new URL("/auth/sign-in", request.url))
            }
        }

        return NextResponse.next()
    } catch (error) {
        console.error("Middleware error:", error)
        // If there's an error checking the session, allow the request to proceed
        // The page-level auth check will handle it
        return NextResponse.next()
    }
}

export const config = {
    runtime: "nodejs",
    matcher: [
        "/todos/:path*", 
        "/admin/:path*", 
        "/task-analyzer/:path*", 
        "/calendar/:path*"
    ]
}
