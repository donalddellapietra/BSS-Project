"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { Shield } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export function AdminNavEntry() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending || !session?.user?.role || session.user.role !== 'admin') {
        return null;
    }

    return (
        <Link href="/admin">
            <Button variant="ghost" className="hover:text-purple-600 hover:bg-purple-100/50">
                <Shield className="h-4 w-4 mr-2" />
                Admin
            </Button>
        </Link>
    );
}