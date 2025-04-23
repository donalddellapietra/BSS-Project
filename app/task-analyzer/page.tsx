'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
            <CardTitle>Generated Subtasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Parent Task</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subtasks.map((subtask) => (
                  <TableRow key={subtask.id}>
                    <TableCell>{subtask.name}</TableCell>
                    <TableCell>{subtask.date}</TableCell>
                    <TableCell>{subtask.parent}</TableCell>
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