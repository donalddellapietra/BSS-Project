import { headers } from "next/headers"
import { TodoList } from "@/components/TodoList"
import { todos as todosTable, Todo } from "@/database/schema"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { eq } from "drizzle-orm"


export default async function TodosPage() {
    const session = await auth.api.getSession({
        headers: await headers() 
    });

    

    if (!session || !session.user) {
        return null;
    }

    const todos: Todo[] = await db
        .select()
        .from(todosTable)
        .where(eq(todosTable.userId, session.user.id));

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Todos</h1>
                <TodoList todos={todos} />
            </section>
        </main>
    )
} 