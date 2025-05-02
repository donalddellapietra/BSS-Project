"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"
import { createTodo } from "@/actions/todos"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { useOptimistic, useRef } from "react"

function AddButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Adding..." : "Add"}
        </Button>
    );
}

// Helper function to organize todos into a tree structure
function organizeTodos(todos: Todo[]): Todo[] {
    const parentTodos = todos.filter(todo => !todo.parentId);
    const childTodos = todos.filter(todo => todo.parentId);
    
    return parentTodos.reduce((acc, parent) => {
        // Add parent
        acc.push(parent);
        // Add children right after their parent
        const children = childTodos.filter(child => child.parentId === parent.id);
        acc.push(...children);
        return acc;
    }, [] as Todo[]);
}

export function TodoList({ todos }: { todos: Todo[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [optimisticTodos, addOptimisticTodo] = useOptimistic<
        Todo[],
        string
    >(
        todos,
        (state, newTitle) => [
            ...state,
            {
                id: Math.random().toString(),
                title: newTitle,
                completed: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: 'optimistic',
            } as Todo,
        ]
    );

    const [formState, formAction] = useActionState(createTodo, {});

    async function clientAction(formData: FormData) {
        const title = formData.get('title') as string;
        if (title) {
            addOptimisticTodo(title);
            formRef.current?.reset();
        }
        await formAction(formData);
    }

    const organizedTodos = organizeTodos(optimisticTodos);

    return (
        <div className="space-y-4">
            <form ref={formRef} action={clientAction} className="flex gap-2 items-stretch">
                <div className="flex-1">
                    <Input
                        name="title"
                        placeholder="Add a new todo..."
                    />
                    {formState.error && (
                        <p className="text-red-500 text-sm mt-1">{formState.error}</p>
                    )}
                </div>
                <AddButton />
            </form>

            <ul className="space-y-2">
                {organizedTodos.map((todo) => (
                    <div key={todo.id} className={todo.parentId ? "ml-8" : ""}>
                        <TodoItem todo={todo} />
                    </div>
                ))}
            </ul>
        </div>
    )
} 