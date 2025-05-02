'use client';

import { useState, startTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTasks } from "./actions";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface Subtask {
  id: string;
  name: string;
  date: string;
  parent: string;
}

interface Props {
  userId: string;
}

export const TaskAnalyzer = function TaskAnalyzer({ userId }: Props) {
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Subtask | null>(null);
  const router = useRouter();

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
        const latestDate = subtasks.reduce((latest, task) => {
          const taskDate = new Date(task.date);
          return taskDate > latest ? taskDate : latest;
        }, new Date(subtasks[0].date));

        const tasksWithDate = subtasks.map(task => ({
          ...task,
          date: task.date
        }));

        await createTasks(tasksWithDate, userId);
        setSubtasks([]);
        router.push("/todos");
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
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Textarea
                  placeholder="Enter your main task here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze Task'}
              </Button>
            </div>
            <Input
              type="file"
              accept=".pdf,.txt,.md,.py,.js,.ts,.java"
              onChange={handleFileChange}
              className="w-full"
            />
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
                          onChange={(e) => setEditValues(prev => ({ ...prev!, name: e.target.value }))}
                        />
                      ) : subtask.name}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {subtask.date}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={new Date(subtask.date)}
                            onSelect={(date) => {
                              if (date) {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                setSubtasks(subtasks.map(st => 
                                  st.id === subtask.id 
                                    ? { ...st, date: dateStr }
                                    : st
                                ));
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>{subtask.parent}</TableCell>
                    <TableCell>
                      {editingId === subtask.id ? (
                        <Button size="icon" onClick={() => handleSave(subtask.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" onClick={() => handleEdit(subtask)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => handleDelete(subtask.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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