const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  duration: { type: Number, default: 30 },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  scheduledTime: Date
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);