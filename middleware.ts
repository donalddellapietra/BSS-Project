import { type NextRequest, NextResponse } from "next/server"
import { authClient } from "@/lib/auth-client"

export async function middleware(request: NextRequest) {
    const session = await authClient.getSession({
        fetchOptions: {
            headers: request.headers
        }
    }) 

    const { pathname } = request.nextUrl


    if ((pathname.startsWith("/todos") || pathname.startsWith("/task-analyzer")) && !session?.data?.user) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url))
    }

    if (pathname.startsWith("/admin")) {
        if (!session?.data?.user || session.data.user.role !== 'admin') {
            return NextResponse.redirect(new URL("/auth/sign-in", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    runtime: "nodejs",
    matcher: ["/todos", "/admin", "/task-analyzer", "/calendar"]
}
