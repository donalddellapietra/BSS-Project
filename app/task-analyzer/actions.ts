'use server';

import { db } from "@/database/db";
import { todos } from "@/database/schema";

export async function createTasks(tasks: Array<{ name: string, date: string }>, userId: string) {
  await db.insert(todos).values(
    tasks.map(task => ({
      title: `${task.name} (Due: ${task.date})`,
      userId: userId,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );
} 