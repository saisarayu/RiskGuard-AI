import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStoreService';

const router = Router();

// GET /api/transactions
router.get('/', (req: Request, res: Response) => {
  const { decision, riskLevel, search } = req.query;
  const list = dataStore.getTransactions({ decision, riskLevel, search });
  res.json({ success: true, count: list.length, data: list });
});

// GET /api/transactions/:id
router.get('/:id', (req: Request, res: Response) => {
  const txn = dataStore.getTransactionById(req.params.id);
  if (!txn) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }
  res.json({ success: true, data: txn });
});

// POST /api/transactions/:id/override
router.post('/:id/override', (req: Request, res: Response) => {
  const { analystDecision, analystName, reason, notes } = req.body;
  if (!analystDecision || !reason) {
    return res.status(400).json({ success: false, error: 'analystDecision and reason are required' });
  }
  const updated = dataStore.overrideTransaction(req.params.id, analystDecision, analystName, reason, notes);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }
  res.json({ success: true, data: updated });
});

// POST /api/transactions/inject
router.post('/inject', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const newTxn = dataStore.injectTransaction(payload);
    res.status(201).json({ success: true, data: newTxn });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
