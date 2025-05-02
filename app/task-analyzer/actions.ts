'use server';

import { db } from "@/database/db";
import { todos } from "@/database/schema";

export async function createTasks(tasks: Array<{ name: string, date: string, parent: string }>, userId: string) {
  // Find the latest date among all subtasks
  const latestDate = tasks.reduce((latest, task) => {
    const taskDate = new Date(task.date);
    return taskDate > latest ? taskDate : latest;
  }, new Date(tasks[0].date));

  // First create the parent task with the latest date
  const [parentTask] = await db.insert(todos).values({
    title: tasks[0].parent,
    userId: userId,
    completed: false,
    dueDate: latestDate  // Use the latest date for parent task
  }).returning();

  // Then create all child tasks with their individual dates
  await db.insert(todos).values(
    tasks.map(task => ({
      title: task.name,
      userId: userId,
      completed: false,
      parentId: parentTask.id,
      dueDate: new Date(task.date)  // Keep individual dates for subtasks
    }))
  );
} 