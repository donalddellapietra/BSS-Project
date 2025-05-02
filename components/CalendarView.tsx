"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"

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

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    modifiers={{ hasTodo: datesWithTodos }}
                    modifiersStyles={{
                        hasTodo: { backgroundColor: "hsl(var(--primary) / 0.1)" }
                    }}
                    className="rounded-md border"
                />
            </Card>
            <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">
                    {date ? date.toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }) : "Select a date"}
                </h2>
                <div className="space-y-2">
                    {selectedTodos.length === 0 ? (
                        <p className="text-muted-foreground">No todos for this date</p>
                    ) : (
                        selectedTodos.map(todo => (
                            <TodoItem key={todo.id} todo={todo} />
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
} 