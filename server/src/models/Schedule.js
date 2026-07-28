
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  blocks: [{
    taskTitle: String,
    startTime: String,
    endTime: String,
    status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'missed'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);