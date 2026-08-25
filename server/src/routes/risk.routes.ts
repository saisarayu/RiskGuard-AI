import { Router, Request, Response } from 'express';
import { evaluateTransactionRisk, evaluateSimulation } from '../services/riskEngineService';
import { dataStore } from '../services/dataStoreService';

const router = Router();

// POST /api/risk/evaluate
router.post('/evaluate', (req: Request, res: Response) => {
  try {
    const input = req.body;
    const result = evaluateTransactionRisk(input, dataStore.weights, dataStore.thresholds);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/risk/simulate
router.post('/simulate', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = evaluateSimulation(payload, dataStore.weights, dataStore.thresholds);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
