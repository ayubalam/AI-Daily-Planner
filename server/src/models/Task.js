import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: Number },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;