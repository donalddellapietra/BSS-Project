"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { authClient } from "@/lib/auth-client"

export function AdminNavEntry() {
    const { 
        data: session, 
        isPending,
        error,
        refetch
    } = authClient.useSession()

    const isAdmin = session?.user?.role === 'admin';

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading session</div>;
    }

    return (
        isAdmin ? (
            <Link href="/admin">
                <Button variant="ghost">Admin</Button>
            </Link>
        ) : null
    )
}