import express from 'express';
import { generatePlan } from '../controllers/agentController.js';

const router = express.Router();

router.post('/plan', generatePlan);

export default router;