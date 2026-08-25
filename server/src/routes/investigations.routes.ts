import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStoreService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, count: dataStore.investigations.length, data: dataStore.investigations });
});

router.patch('/:id', (req: Request, res: Response) => {
  const { status, note } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'Status is required' });

  const updated = dataStore.updateInvestigation(req.params.id, status, note);
  if (!updated) return res.status(404).json({ success: false, error: 'Case not found' });
  res.json({ success: true, data: updated });
});

export default router;
