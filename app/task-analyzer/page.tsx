'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTodo } from "@/actions/todos";
import { useActionState } from "react";
import { useOptimistic } from "react";
import { startTransition } from "react";
import { db } from "@/database/db";
import { todos } from "@/database/schema";

interface Subtask {
  id: string;
  name: string;
  date: string;
  parent: string;
}

export default function TaskAnalyzer() {
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Subtask | null>(null);
  const router = useRouter();
  const [formState, formAction] = useActionState(createTodo, {});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (textInput.trim()) {
        formData.append('text', textInput);
      } else {
        setError('Please enter a task or upload a file');
        return;
      }

      const response = await fetch('/api/analyze-task', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze task');
      }

      const result = await response.json();
      setSubtasks(result);
    } catch (error) {
      console.error('Error analyzing task:', error);
      setError('Failed to analyze task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditValues({ ...subtask });
  };

  const handleSave = (id: string) => {
    if (editValues) {
      setSubtasks(subtasks.map(subtask => 
        subtask.id === id ? editValues : subtask
      ));
      setEditingId(null);
      setEditValues(null);
    }
  };

  const handleDelete = (id: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
  };

  const handleDeleteAll = () => {
    setSubtasks([]);
  };

  const handleConfirmAll = async () => {
    if (subtasks.length === 0) {
      setError("No subtasks to confirm");
      return;
    }

    setIsLoading(true);
    try {
      startTransition(async () => {
        // Create all subtasks in one transition
        await Promise.all(subtasks.map(async (subtask) => {
          const formData = new FormData();
          formData.set("title", `${subtask.name} (Due: ${subtask.date})`);
          await formAction(formData);
        }));
        
        setSubtasks([]);
        router.push("/");
      });
    } catch (error) {
      console.error("Error adding tasks:", error);
      setError("Failed to add tasks to your todo list");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Task Analyzer</CardTitle>
          <CardDescription>
            Input your main task or upload a file to generate subtasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your main task here..."
              value={textInput}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTextInput(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                accept=".pdf,.txt,.md,.py,.js,.ts,.java"
                onChange={handleFileChange}
                className="w-full"
              />
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze Task'}
              </Button>
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {subtasks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generated Subtasks</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDeleteAll}>
                  Delete All
                </Button>
                <Button onClick={handleConfirmAll}>
                  Confirm All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Parent Task</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subtasks.map((subtask) => (
                  <TableRow key={subtask.id}>
                    <TableCell>
                      {editingId === subtask.id ? (
                        <Input
                          value={editValues?.name || ''}
                          onChange={(e) => setEditValues(prev => prev ? {...prev, name: e.target.value} : null)}
                        />
                      ) : (
                        subtask.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === subtask.id ? (
                        <Input
                          type="date"
                          value={editValues?.date || ''}
                          onChange={(e) => setEditValues(prev => prev ? {...prev, date: e.target.value} : null)}
                        />
                      ) : (
                        subtask.date
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === subtask.id ? (
                        <Input
                          value={editValues?.parent || ''}
                          onChange={(e) => setEditValues(prev => prev ? {...prev, parent: e.target.value} : null)}
                        />
                      ) : (
                        subtask.parent
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingId === subtask.id ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSave(subtask.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(subtask)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(subtask.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 