import Task from '../models/Task.js';

export const parseAndCreateTask = async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !userId) return res.status(400).json({ message: 'Prompt and userId are required' });

    const lowerPrompt = prompt.toLowerCase();
    let priority = 'medium';
    if (lowerPrompt.includes('high') || lowerPrompt.includes('urgent') || lowerPrompt.includes('important')) {
      priority = 'high';
    } else if (lowerPrompt.includes('low')) {
      priority = 'low';
    }

    const cleanTitle = prompt
      .replace(/(with|priority|high|medium|low|urgent)/gi, '')
      .trim();

    const task = new Task({
      userId,
      title: cleanTitle || prompt,
      priority,
      completed: false,
    });

    await task.save();

    // Return schedule info for the schedule view
    const now = new Date();
    const timeSlot = `${now.getHours()}:00 - ${now.getHours() + 2}:00`;

    res.status(201).json({
      message: 'Plan generated successfully',
      task,
      scheduleItem: {
        id: task._id,
        timeSlot,
        title: task.title,
        priority: task.priority,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing AI schedule request' });
  }
};