    import express from 'express';
    import { parseAndCreateTask } from '../controllers/agentController.js';
    import { getAnalyticsData } from '../controllers/agentController.js';

    const router = express.Router();

    router.post('/parse', parseAndCreateTask);
    router.get('/analytics', getAnalyticsData);

    export default router;