import { agentExecutor } from '../agent/plannerAgent.js';

export const generatePlan = async (req, res) => {
  try {
    const { prompt, userId } = req.body;

    const result = await agentExecutor.invoke({
      messages: [
        {
          role: 'system',
          content: 'You are an AI planner. Use available tools to fetch existing user tasks or create new ones before providing the final schedule.',
        },
        {
          role: 'user',
          content: `User ID: ${userId}. Prompt: ${prompt}`,
        },
      ],
    });

    const finalResponse = result.messages[result.messages.length - 1].content;
    res.status(200).json({ plan: finalResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};