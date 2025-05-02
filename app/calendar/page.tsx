import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"
import { eq } from "drizzle-orm"
import { CalendarView } from "@/components/CalendarView"

export default async function CalendarPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return null;
    }

    const userTodos = await db
        .select()
        .from(todos)
        .where(eq(todos.userId, session.user.id));

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Calendar View</h1>
                <CalendarView todos={userTodos} />
            </section>
        </main>
    );
} 