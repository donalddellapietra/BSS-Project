"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"
import { organizeTodos } from "./TodoList" // Import the helper function

export function CalendarView({ todos }: { todos: Todo[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date())

    // Group todos by date
    const todosByDate = todos.reduce((acc, todo) => {
        if (!todo.dueDate) return acc;
        const dateStr = new Date(todo.dueDate).toDateString();
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(todo);
        return acc;
    }, {} as Record<string, Todo[]>);

    // Get todos for selected date
    const selectedTodos = date ? todosByDate[date.toDateString()] || [] : [];

    // Get dates with todos for highlighting
    const datesWithTodos = Object.keys(todosByDate).map(dateStr => new Date(dateStr));

    // Organize todos in hierarchy
    const organizedTodos = organizeTodos(selectedTodos);

    return (
        <div className="space-y-6">
            <div className="flex justify-center">
                <Card className="p-6 w-fit">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        modifiers={{ hasTodo: datesWithTodos }}
                        modifiersClassNames={{
                            hasTodo:
                              "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-purple-500 after:rounded-full"
                        }}
                    />
                </Card>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    {date ? date.toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }) : "Select a date"}
                </h2>
                <div className="space-y-2">
                    {organizedTodos.length === 0 ? (
                        <p className="text-muted-foreground">No todos for this date</p>
                    ) : (
                        organizedTodos.map((todo) => (
                            <div key={todo.id} className={todo.parentId ? "ml-8" : ""}>
                                <TodoItem todo={todo} />
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
} 