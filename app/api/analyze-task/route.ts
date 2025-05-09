import { NextRequest, NextResponse } from 'next/server';
import { analyzeTask, analyzeFile } from '@/lib/llm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const text = formData.get('text') as string;
    const file = formData.get('file') as File;

    let result;
    if (file) {
      result = await analyzeFile(file);
    } else if (text) {
      result = await analyzeTask(text);
    } else {
      return NextResponse.json(
        { error: 'Please provide either text or a file' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in analyze-task route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze task' },
      { status: 500 }
    );
  }
} 