"use server"

import { eq, and, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos } from "@/database/schema"

export type TodoFormState = {
    error?: string;
}

export async function createTodo(prevState: TodoFormState, formData: FormData): Promise<TodoFormState> {
    // Check authentication
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return { error: "Not authenticated" };
    }

    const title = formData.get('title') as string;
    
    // Validate title
    if (!title || title.trim() === '') {
        return { error: "Title cannot be empty" };
    }

    // Simulate delay for development
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        await db.insert(todos).values({
            title: title.trim(),
            completed: false,
            userId: session.user.id,
        });
        
        revalidatePath('/todos');
        return {};
    } catch (e) {
        return { error: "Failed to create todo" };
    }
}

export async function toggleTodo(prevState: any, formData: FormData) {
    // Check authentication
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return { error: "Not authenticated" };
    }

    const id = formData.get("id") as string;

    try {
        // Smart query: Update only if todo belongs to current user
        const result = await db.update(todos)
            .set({ completed: sql`NOT ${todos.completed}` })
            .where(
                and(
                    eq(todos.id, id),
                    eq(todos.userId, session.user.id)
                )
            )
            .returning();

        // If no rows were updated, the todo didn't belong to the user
        if (result.length === 0) {
            return { error: "Not authorized to toggle this todo" };
        }

        revalidatePath('/todos');
        return {};
    } catch (e) {
        return { error: "Failed to toggle todo" };
    }
}

export async function deleteTodo(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.role || session.user.role !== 'admin') {
        throw new Error("Not authorized");
    }

    const id = formData.get("id") as string;
    await db.delete(todos)
        .where(eq(todos.id, id));

    revalidatePath("/admin");
}
