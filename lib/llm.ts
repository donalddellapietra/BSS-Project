import OpenAI from 'openai';

// Get the API key
const apiKey = process.env.OPENAI_API_KEY;

// Create the OpenAI instance with optional API key
const openai = new OpenAI({
  apiKey: apiKey || '',
});

function parseSubtasks(text: string): Array<{id: string, name: string, date: string, parent: string}> {
  try {
    // First, try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        return parsed.map((task: { name?: string; task?: string; date?: string; parent?: string }, index: number) => {
          // Parse the date from the task
          const taskDate = new Date(task.date || new Date());
          taskDate.setHours(0, 0, 0, 0);
          
          // If the task date is before today, set it to today
          const finalDate = taskDate < today ? today : taskDate;
          
          return {
            id: (index + 1).toString(),
            name: task.name || task.task || 'Unknown task',
            date: finalDate.toISOString().split('T')[0],
            parent: task.parent || 'Main Task'
          };
        });
      }
    }
  } catch (error) {
    console.log('Failed to parse as JSON, trying to extract tasks from text...');
  }

  // If JSON parsing fails, try to extract tasks from the text
  const lines = text.split('\n');
  const subtasks: Array<{id: string, name: string, date: string, parent: string}> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('[') && !line.startsWith('{') && !line.startsWith('```')) {
      // Try to extract date from the line
      const dateMatch = line.match(/\d{4}-\d{2}-\d{2}/);
      const taskDate = dateMatch ? new Date(dateMatch[0]) : new Date();
      taskDate.setHours(0, 0, 0, 0);
      
      // If the task date is before today, set it to today
      const finalDate = taskDate < today ? today : taskDate;
      
      // Try to extract parent from the line
      const parentMatch = line.match(/parent:\s*([^,]+)/i);
      const parent = parentMatch ? parentMatch[1].trim() : 'Main Task';
      
      // Remove date and parent from the task text
      const taskText = line
        .replace(/\d{4}-\d{2}-\d{2}/, '')
        .replace(/parent:\s*[^,]+/i, '')
        .replace(/```json|```/g, '')
        .trim();
      
      if (taskText) {
        subtasks.push({
          id: (subtasks.length + 1).toString(),
          name: taskText,
          date: finalDate.toISOString().split('T')[0],
          parent: parent
        });
      }
    }
  }

  return subtasks;
}

export async function analyzeTask(text: string): Promise<Array<{id: string, name: string, date: string, parent: string}>> {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  
  try {
    const prompt = `Break down the following task into subtasks with specific dates. You must respond with ONLY a valid JSON array, nothing else. No explanations, no markdown, just the JSON.

    Task: ${text}

    Required JSON format:
    [
      {
        "name": "Write the introduction section",
        "date": "2025-04-20",
        "parent": "Final Project Report"
      },
      {
        "name": "Document the implementation details",
        "date": "2025-04-22",
        "parent": "Final Project Report"
      }
    ]

    Remember:
    1. Respond with ONLY the JSON array
    2. Use double quotes for all strings
    3. Follow the exact format shown above
    4. Include at least 3 subtasks
    5. Dates must be in YYYY-MM-DD format
    6. Keep all subtasks under the same parent task
    7. When setting dates, consider:
       - Task complexity (how difficult the task is)
       - Time requirements (how long the task will take)
       - Dependencies (tasks that need to be completed before others)
       - Realistic workload (don't schedule too many tasks on the same day)
    8. Make dates realistic and sequential
    9. Ensure each task has enough time allocated based on its complexity
    10. Start with the most complex or time-consuming tasks first`;

    console.log('Sending request to OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('Received response from OpenAI API:', response.choices[0].message.content);
    
    // Parse the response
    const subtasks = parseSubtasks(response.choices[0].message.content || '');
    
    if (subtasks.length === 0) {
      throw new Error('No subtasks could be extracted from the response');
    }

    return subtasks;
  } catch (error) {
    console.error('Error analyzing task:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export async function analyzeFile(file: File): Promise<Array<{id: string, name: string, date: string, parent: string}>> {
  try {
    // For now, we'll just read the file as text
    const text = await file.text();
    return analyzeTask(text);
  } catch (error) {
    console.error('Error analyzing file:', error);
    throw error;
  }
} 