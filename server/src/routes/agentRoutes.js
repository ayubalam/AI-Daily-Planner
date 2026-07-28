import express from 'express';
import { parseAndCreateTask } from '../controllers/agentController.js';

const router = express.Router();

router.post('/parse', parseAndCreateTask);

export default router;