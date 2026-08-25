import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStoreService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: dataStore.getMetrics() });
});

export default router;
