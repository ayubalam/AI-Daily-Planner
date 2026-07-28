const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  estimatedDuration: Number, // in minutes
  dueDate: Date,
  isCompleted: { type: Boolean, default: false },
  timeSlot: { start: Date, end: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);