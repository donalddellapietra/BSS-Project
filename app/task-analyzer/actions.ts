'use server';

import { db } from "@/database/db";
import { todos } from "@/database/schema";

export async function createTasks(tasks: Array<{ name: string, date: string, parent: string }>, userId: string) {
  // Helper to set date to local midnight in UTC
  const setDateForLocalMidnight = (dateStr: string) => {
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    date.setUTCHours(+offset/60, 0, 0, 0);  // Convert minutes to hours
    return date;
  };

  // First create the parent task
  const [parentTask] = await db.insert(todos).values({
    title: tasks[0].parent,
    userId: userId,
    completed: false,
    dueDate: setDateForLocalMidnight(tasks[0].date)
  }).returning();

  // Then create all child tasks
  await db.insert(todos).values(
    tasks.map(task => ({
      title: task.name,
      userId: userId,
      completed: false,
      parentId: parentTask.id,
      dueDate: setDateForLocalMidnight(task.date)
    }))
  );
} 