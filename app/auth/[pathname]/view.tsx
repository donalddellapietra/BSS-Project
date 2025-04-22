"use client"

import { AuthCard } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

export function AuthView({ pathname }: { pathname: string }) {
    const router = useRouter()

    const handleSignOut = async () => {
        await authClient.signOut()
        router.refresh()
    }

    useEffect(() => {
        router.refresh()
    }, [router])

    return (
        <main className="flex grow flex-col items-center justify-center gap-3 p-4">
            <AuthCard pathname={pathname} />

            <p
                className={cn(
                    ["callback", "settings", "sign-out"].includes(pathname) && "hidden",
                    "text-muted-foreground text-xs"
                )}
            >
                Powered by{" "}
                <Link
                    className="text-warning underline"
                    href="https://better-auth.com"
                    target="_blank"
                >
                    better-auth.
                </Link>
            </p>

            <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
        </main>
    )
}
