import { Todo } from "@/database/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTodo, deleteTodo, updateTodo } from "@/actions/todos";
import { useActionState, useOptimistic } from "react";
import { startTransition, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Pencil, Trash2, X, Check, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function isOverdue(todo: Todo) {
    if (!todo.dueDate || todo.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);  
    return new Date(todo.dueDate) < today;
}
  
export function TodoItem({ todo }: { todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [editDate, setEditDate] = useState<Date | undefined>(
    todo.dueDate ? new Date(todo.dueDate) : undefined
  );
  const [optimisticTodo, setOptimisticTodo] = useOptimistic(
    todo,
    (state, completed: boolean) => ({ ...state, completed })
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      if (editDate) {
        formData.set("dueDate", editDate.toISOString());
      }
      await updateAction(formData);
      setIsEditing(false);
    });
  }

  function onDateChange(newDate: Date | undefined) {
    if (!newDate) return;
    const date = new Date(newDate);
    const offset = date.getTimezoneOffset();
    date.setUTCHours(+offset / 60, 0, 0, 0);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", todo.id);
      formData.set("title", todo.title);
      formData.set("dueDate", date.toISOString());
      await updateAction(formData);
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1"
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {editDate
                    ? editDate.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Set deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={editDate}
                  onSelect={setEditDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button size="icon" onClick={onUpdate}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={
                optimisticTodo.completed
                  ? "line-through text-muted-foreground"
                  : ""
              }
            >
              {optimisticTodo.title}
            </span>
            <div className="flex items-center gap-1">
              {optimisticTodo.dueDate && (
                <span className={cn(
                    "text-sm",
                    isOverdue(optimisticTodo) ? "text-red-500 font-semibold" : "text-muted-foreground"
                  )}>
                    {new Date(optimisticTodo.dueDate).toLocaleDateString()}
                  </span>                  
              )}
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      optimisticTodo.dueDate
                        ? new Date(optimisticTodo.dueDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      onDateChange(date);
                      setShowDatePicker(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>
      {!isEditing && (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
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
