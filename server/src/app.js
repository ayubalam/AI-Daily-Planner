import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes.js';
import agentRoutes from './routes/agentRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/agent', agentRoutes);

app.get('/', (req, res) => {
  res.send('AI Daily Planner API Running...');
});

export default app;