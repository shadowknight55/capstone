import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    // Log the request (excluding sensitive data)
    console.log('Received chat request');

    const { messages } = await req.json();
    console.log('Parsed messages:', messages?.length ? `${messages.length} messages` : 'no messages');

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    // Validate that the API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    console.log('Making OpenAI API request...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant for students learning mathematics using Polypad. You can help explain mathematical concepts, guide students through problems, and provide interactive learning support. Always be encouraging and explain concepts clearly."
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('Received response from OpenAI');
    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    // Enhanced error logging
    console.error('Chat API error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack
    });

    // Return more specific error messages based on the error type
    if (error.name === 'OpenAIError') {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    if (error.name === 'SyntaxError') {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Error processing chat request: ${error.message}` },
      { status: 500 }
    );
  }
} 