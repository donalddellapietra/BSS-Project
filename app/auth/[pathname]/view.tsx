"use client"

import { AuthCard } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

export function AuthView({ pathname }: { pathname: string }) {
    const router = useRouter()
    const [isSigningOut, setIsSigningOut] = useState(false)

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await authClient.signOut()
            router.replace("/auth/sign-in")
        } catch (error) {
            console.error("Failed to sign out:", error)
            setIsSigningOut(false)
        }
    }

    useEffect(() => {
        if (pathname === "sign-out" && !isSigningOut) {
            handleSignOut()
        }
    }, [pathname, isSigningOut])

    if (isSigningOut) {
        return (
            <main className="flex grow flex-col items-center justify-center gap-3 p-4">
                <p>Signing out...</p>
            </main>
        )
    }

    return (
        <main className="flex grow flex-col items-center justify-center gap-3 p-4">
            <AuthCard pathname={pathname} />
            <p className={cn(
                ["callback", "settings", "sign-out"].includes(pathname) && "hidden",
                "text-muted-foreground text-xs"
            )}>
                Powered by{" "}
                <Link className="text-warning underline" href="https://better-auth.com" target="_blank">
                    better-auth.
                </Link>
            </p>
            {pathname !== "sign-out" && (
                <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
            )}
        </main>
    )
}
