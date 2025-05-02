'use server';

import { db } from "@/database/db";
import { todos } from "@/database/schema";

export async function createTasks(tasks: Array<{ name: string, date: string, parent: string }>, userId: string) {
  // First create the parent task
  const [parentTask] = await db.insert(todos).values({
    title: tasks[0].parent,
    userId: userId,
    completed: false,
    dueDate: new Date(tasks[0].date)
  }).returning();

  // Then create all child tasks
  await db.insert(todos).values(
    tasks.map(task => ({
      title: task.name,
      userId: userId,
      completed: false,
      parentId: parentTask.id,
      dueDate: new Date(task.date)
    }))
  );
} 