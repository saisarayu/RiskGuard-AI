import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStoreService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, count: dataStore.merchants.length, data: dataStore.merchants });
});

router.get('/:id', (req: Request, res: Response) => {
  const merch = dataStore.merchants.find((m) => m.id === req.params.id);
  if (!merch) return res.status(404).json({ success: false, error: 'Merchant not found' });
  res.json({ success: true, data: merch });
});

export default router;
