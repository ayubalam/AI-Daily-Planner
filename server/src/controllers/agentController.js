import Task from '../models/Task.js';

export const parseAndCreateTask = async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !userId) {
      return res.status(400).json({ message: 'Prompt and userId are required' });
    }

    const lowerPrompt = prompt.toLowerCase();
    
    // 1. Priority Detection
    let priority = 'low';
    if (lowerPrompt.includes('high') || lowerPrompt.includes('urgent') || lowerPrompt.includes('important')) {
      priority = 'high';
    } else if (lowerPrompt.includes('medium') || lowerPrompt.includes('normal')) {
      priority = 'medium';
    }

    // 2. Duration Detection (in minutes)
    let durationMinutes = 30; // Low priority default
    if (priority === 'high') durationMinutes = 90;
    else if (priority === 'medium') durationMinutes = 60;

    const hourMatch = lowerPrompt.match(/(\d+)\s*(hour|hr|hours)/);
    const minMatch = lowerPrompt.match(/(\d+)\s*(min|mins|minutes)/);

    if (hourMatch) {
      durationMinutes = parseInt(hourMatch[1], 10) * 60;
    } else if (minMatch) {
      durationMinutes = parseInt(minMatch[1], 10);
    }

    // 3. Clean Title
    const cleanTitle = prompt
      .replace(/(with|priority|high|medium|low|urgent|important|normal|\d+\s*(hour|hr|hours|min|mins|minutes))/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 4. Calculate Sequential Start Time (Find last task for today)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get the most recent task created today
    const lastTask = await Task.findOne({
      userId,
      createdAt: { $gte: startOfToday }
    }).sort({ createdAt: -1 });

    let startTime = new Date();

    if (lastTask && lastTask.endTime) {
      const lastEndTime = new Date(lastTask.endTime);
      // If the last task ends in the future, start this task right after it
      if (lastEndTime > startTime) {
        startTime = lastEndTime;
      }
    }

    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    // 5. Save Task to MongoDB with start and end times
    const task = new Task({
      userId,
      title: cleanTitle || prompt,
      priority,
      duration: durationMinutes,
      startTime,
      endTime,
      completed: false,
    });

    await task.save();

    // Helper function for 12-hour AM/PM formatting
    const formatTime = (date) => {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      minutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${hours}:${minutes} ${ampm}`;
    };

    const timeSlot = `${formatTime(startTime)} - ${formatTime(endTime)}`;

    res.status(201).json({
      message: 'Plan generated successfully',
      task,
      scheduleItem: {
        id: task._id,
        timeSlot,
        title: task.title,
        priority: task.priority,
        durationMinutes
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error processing AI schedule request' });
  }
};