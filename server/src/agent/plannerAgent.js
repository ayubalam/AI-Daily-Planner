import dotenv from 'dotenv';
dotenv.config();

import { ChatGroq } from '@langchain/groq';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { z } from 'zod';
import Task from '../models/Task.js';

export const model = new ChatGroq({
  model: 'llama-3.3-70b-versatile',
  modelName: 'llama-3.3-70b-versatile',
  temperature: 0.3,
  apiKey: process.env.GROQ_API_KEY,
});

export const getTasksTool = new DynamicStructuredTool({
  name: 'getTasks',
  description: 'Fetches all tasks for a specific user ID from the database',
  schema: z.object({
    userId: z.string().describe('The ID of the user'),
  }),
  func: async ({ userId }) => {
    const tasks = await Task.find({ userId });
    return JSON.stringify(tasks);
  },
});

export const createTaskTool = new DynamicStructuredTool({
  name: 'createTask',
  description: 'Creates a new task in the database for the user',
  schema: z.object({
    userId: z.string(),
    title: z.string(),
    duration: z.number().optional(),
    priority: z.enum(['high', 'medium', 'low']).optional(),
  }),
  func: async (taskData) => {
    const newTask = await Task.create(taskData);
    return JSON.stringify(newTask);
  },
});

const tools = [getTasksTool, createTaskTool];

const systemPrompt = `You are an AI Daily Planner.
Always respond ONLY in valid JSON with no extra conversational text or markdown code blocks.
Expected output format:
{
  "summary": "Brief summary of the plan",
  "schedule": [
    { "time": "09:00 AM - 09:30 AM", "task": "Task Name", "priority": "high|medium|low" }
  ]
}`;

export const agentExecutor = createReactAgent({
  llm: model,
  tools,
  stateModifier: systemPrompt,
});