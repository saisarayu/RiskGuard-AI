import { Router, Request, Response } from 'express';
import { CopilotService } from '../services/copilotService';

const router = Router();

// POST /api/copilot/query
router.post('/query', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ success: false, error: 'Query is required' });

  const answer = CopilotService.processQuery(query);
  res.json({ success: true, answer, timestamp: new Date().toISOString() });
});

export default router;
