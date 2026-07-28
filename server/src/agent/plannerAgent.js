const { ChatOpenAI } = require('@langchain/openai');
const { createOpenAIFunctionsAgent, AgentExecutor } = require('langchain/agents');
const { ChatPromptTemplate } = require('@langchain/core/prompts');

const model = new ChatOpenAI({ modelName: 'gpt-4o-mini', temperature: 0.2 });

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are an AI Daily Planner Agent. You manage schedules, prioritize tasks based on deadlines and time slots, and execute workflow updates.'],
  ['human', '{input}']
]);

// Initialize and execute agent with custom function tools (e.g. createTask, rescheduleTasks)
async function runPlannerAgent(userInput) {
  const tools = []; // Add function tools here for DB operations
  const agent = await createOpenAIFunctionsAgent({ llm: model, tools, prompt });
  const executor = new AgentExecutor({ agent, tools });
  return await executor.invoke({ input: userInput });
}

module.exports = { runPlannerAgent };