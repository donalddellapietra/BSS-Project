import { Todo } from "@/database/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTodo } from "@/actions/todos";
import { useActionState, useOptimistic } from "react";
import { startTransition } from "react";

export function TodoItem({ todo }: { todo: Todo }) {
    const [optimisticTodo, setOptimisticTodo] = useOptimistic(
        todo,
        (state, completed: boolean) => ({ ...state, completed })
    );

    const [formState, formAction] = useActionState(toggleTodo, {});

    function onToggle(checked: boolean) {
        startTransition(async () => {
            const formData = new FormData();
            formData.set("id", todo.id);
            setOptimisticTodo(checked);
            await formAction(formData);
        });
    }

    return (
        <li
            key={todo.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2`}
        >
            <Checkbox
                checked={optimisticTodo.completed}
                onCheckedChange={onToggle}
            />
            <div className="flex-1">
                <span className={`${optimisticTodo.completed ? "line-through text-muted-foreground" : ""}`}>
                    {optimisticTodo.title}
                </span>
                {optimisticTodo.dueDate && (
                    <span className="text-sm text-muted-foreground ml-2">
                        (Due: {new Date(optimisticTodo.dueDate).toLocaleDateString()})
                    </span>
                )}
            </div>
            {formState.error && (
                <span className="text-red-500 text-sm">{formState.error}</span>
            )}
        </li>
    );
}