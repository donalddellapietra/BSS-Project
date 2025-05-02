import { desc } from "drizzle-orm"

import { db } from "@/database/db"
import { todos } from "@/database/schema"

import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { adminDeleteTodo } from "@/actions/todos"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.role || session.user.role !== 'admin') {
        return null;
    }

    const allTodos = await db.query.todos.findMany({
        with: {
            user: {
                columns: {
                    name: true,
                }
            }
        },
        orderBy: [desc(todos.createdAt)]
    });

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

                <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="py-2 px-4 text-left">User</th>
                                <th className="py-2 px-4 text-left">Todo</th>
                                <th className="py-2 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTodos.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-2 px-4 text-center">No todos found</td>
                                </tr>
                            )}
                            {allTodos.map((todo) => (
                                <tr key={todo.id} className="border-t">
                                    <td className="py-2 px-4">{todo.user.name}</td>
                                    <td className="py-2 px-4">{todo.title}</td>
                                    <td className="py-2 px-4 text-center">
                                        <form action={adminDeleteTodo}>
                                            <input type="hidden" name="id" value={todo.id} />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                type="submit"
                                            >
                                                Delete
                                            </Button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
} 
