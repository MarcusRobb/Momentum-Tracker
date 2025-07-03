import { GoogleGenAI } from "@google/genai";
import type { Task } from '../types';

// This is a Vercel Serverless Function.
// It runs on the server, not in the browser.
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Get the task and prompt from the request body
  const { task, prompt }: { task: Task, prompt: string } = req.body;

  if (!task || !prompt) {
    return res.status(400).json({ error: 'Missing task or prompt in request body' });
  }

  // Securely get the API key from environment variables on the server
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error('API_KEY environment variable not found on the server.');
    // Don't expose the exact error to the client
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Create a detailed prompt for the AI for better context
    const fullPrompt = `Here is a task I am working on:
- Task: ${task.text}
- Notes: ${task.notes || 'N/A'}

Based on this context, please help me with the following request:
"${prompt}"`;
    
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: fullPrompt,
    });

    const text = result.text;
    
    // Send the AI's response back to the frontend
    res.status(200).json({ response: text });

  } catch (error) {
    console.error("Gemini API error in serverless function:", error);
    res.status(500).json({ error: 'An error occurred while communicating with the AI service.' });
  }
}
