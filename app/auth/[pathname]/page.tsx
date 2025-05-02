import { authViewPaths } from "@daveyplate/better-auth-ui/server"
import { AuthView } from "./view"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export function generateStaticParams() {
    return Object.values(authViewPaths).map((pathname) => ({ pathname }))
}

export default async function AuthPage({ params }: { params: Promise<{ pathname: string }> }) {
    const { pathname } = await params

    // Check session
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // If signed in, redirect to todos
    if (session?.user && pathname === "sign-in") {
        redirect("/todos");
    }

    return <AuthView pathname={pathname} />
}
