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

// Export the helper function
export function organizeTodos(todos: Todo[]): Todo[] {
    const parentTodos = todos.filter(todo => !todo.parentId);
    const childTodos = todos.filter(todo => todo.parentId);

    const sortByCompletionAndDate = (a: Todo, b: Todo) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const aDate = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000);
        const bDate = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000);
        const dateCompare = aDate.getTime() - bDate.getTime();
        if (dateCompare !== 0) return dateCompare;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    };

    const sortedParents = parentTodos.sort(sortByCompletionAndDate);

    // Track added child ids
    const addedChildIds = new Set<string>();

    const organized = sortedParents.reduce((acc, parent) => {
        acc.push(parent);
        const children = childTodos
            .filter(child => child.parentId === parent.id)
            .sort(sortByCompletionAndDate);
        children.forEach(child => addedChildIds.add(child.id));
        acc.push(...children);
        return acc;
    }, [] as Todo[]);

    // Add orphaned children (whose parent is not in selectedTodos)
    const orphanChildren = childTodos
        .filter(child => !addedChildIds.has(child.id))
        .sort(sortByCompletionAndDate);

    organized.push(...orphanChildren);

    return organized;
}

export function TodoList({ todos }: { todos: Todo[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const initialTodos = organizeTodos(todos);
    
    const [optimisticTodos, addOptimisticTodo] = useOptimistic<
        Todo[],
        { id: string, completed: boolean }
    >(
        initialTodos,
        (state, update) => {
            // First update the completion status
            const newTodos = state.map(todo => {
                if (todo.id === update.id) {
                    return { ...todo, completed: update.completed };
                }
                // Also update children if parent is marked complete
                if (todo.parentId === update.id) {
                    return { ...todo, completed: update.completed };
                }
                return todo;
            });
            
            // Then sort the updated todos
            return organizeTodos(newTodos);
        }
    );

    const [formState, formAction] = useActionState(createTodo, {});

    async function clientAction(formData: FormData) {
        const title = formData.get('title') as string;
        if (title) {
            addOptimisticTodo({ id: Math.random().toString(), completed: false });
            formRef.current?.reset();
        }
        await formAction(formData);
    }

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
                {optimisticTodos.map((todo) => (
                    <div key={todo.id} className={todo.parentId ? "ml-8" : ""}>
                        <TodoItem todo={todo} />
                    </div>
                ))}
            </ul>
        </div>
    )
} 