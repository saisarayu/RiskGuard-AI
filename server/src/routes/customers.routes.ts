import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStoreService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, count: dataStore.customers.length, data: dataStore.customers });
});

router.get('/:id', (req: Request, res: Response) => {
  const cust = dataStore.customers.find((c) => c.id === req.params.id);
  if (!cust) return res.status(404).json({ success: false, error: 'Customer not found' });
  res.json({ success: true, data: cust });
});

export default router;
