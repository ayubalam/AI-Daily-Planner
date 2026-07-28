import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-daily-planner';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });