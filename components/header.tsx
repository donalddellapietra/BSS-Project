import Link from "next/link"
import { UserButton } from "@daveyplate/better-auth-ui"
import { Button } from "./ui/button"
import { AdminNavEntry } from "./AdminNavEntry"
import { ListTodo, Sparkles } from "lucide-react"

export async function Header() {
    return (
        <header className="sticky top-0 z-50 px-4 py-3 border-b bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/50 dark:to-pink-950/50 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover:text-purple-600 transition-colors">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Subtasks AI
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Link href="/todos">
                            <Button variant="ghost" className="hover:text-purple-600 hover:bg-purple-100/50">
                                <ListTodo className="h-4 w-4 mr-2" />
                                Todos
                            </Button>
                        </Link>
                        <Link href="/task-analyzer">
                            <Button variant="ghost" className="hover:text-purple-600 hover:bg-purple-100/50">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Analyze
                            </Button>
                        </Link>
                        <AdminNavEntry />
                    </nav>
                </div>

                <UserButton />
            </div>
        </header>
    )
}
