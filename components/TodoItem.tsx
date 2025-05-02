import { Todo } from "@/database/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTodo, deleteTodo, updateTodo } from "@/actions/todos";
import { useActionState, useOptimistic } from "react";
import { startTransition, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Pencil, Trash2, X, Check } from "lucide-react";

export function TodoItem({ todo }: { todo: Todo }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(todo.title);
    const [optimisticTodo, setOptimisticTodo] = useOptimistic(
        todo,
        (state, completed: boolean) => ({ ...state, completed })
    );

    const [formState, formAction] = useActionState(toggleTodo, {});
    const [deleteState, deleteAction] = useActionState(deleteTodo, {});
    const [updateState, updateAction] = useActionState(updateTodo, {});

    function onToggle(checked: boolean) {
        startTransition(async () => {
            const formData = new FormData();
            formData.set("id", todo.id);
            setOptimisticTodo(checked);
            await formAction(formData);
        });
    }

    function onDelete() {
        startTransition(async () => {
            const formData = new FormData();
            formData.set("id", todo.id);
            await deleteAction(formData);
        });
    }

    function onUpdate() {
        startTransition(async () => {
            const formData = new FormData();
            formData.set("id", todo.id);
            formData.set("title", editValue);
            await updateAction(formData);
            setIsEditing(false);
        });
    }

    return (
        <li className="flex items-center gap-2 rounded-lg border px-4 py-2">
            <Checkbox
                checked={optimisticTodo.completed}
                onCheckedChange={onToggle}
            />
            <div className="flex-1">
                {isEditing ? (
                    <div className="flex gap-2">
                        <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1"
                        />
                        <Button size="icon" onClick={onUpdate}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className={optimisticTodo.completed ? "line-through text-muted-foreground" : ""}>
                            {optimisticTodo.title}
                        </span>
                        {optimisticTodo.dueDate && (
                            <span className="text-sm text-muted-foreground">
                                (Due: {new Date(optimisticTodo.dueDate).toLocaleDateString()})
                            </span>
                        )}
                    </div>
                )}
            </div>
            {!isEditing && (
                <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {(formState.error || deleteState.error || updateState.error) && (
                <span className="text-red-500 text-sm">
                    {formState.error || deleteState.error || updateState.error}
                </span>
            )}
        </li>
    );
}