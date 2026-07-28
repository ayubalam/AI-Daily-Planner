const { ChatOpenAI } = require('@langchain/openai');
const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod'); 
const Task = require('../models/Task');

const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.3,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Tool for the Agent to fetch user tasks
const getTasksTool = new DynamicStructuredTool({
  name: 'getTasks',
  description: 'Fetches all tasks for a given user',
  schema: z.object({
    userId: z.string().describe('The ID of the user'),
  }),
  func: async ({ userId }) => {
    const tasks = await Task.find({ userId });
    return JSON.stringify(tasks);
  },
});

// Tool for the Agent to auto-create a task
const createTaskTool = new DynamicStructuredTool({
  name: 'createTask',
  description: 'Creates a new task in the planner',
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

module.exports = { model, getTasksTool, createTaskTool };