import { Router, Request, Response } from 'express';
import { dataStore } from '../services/dataStoreService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      thresholds: dataStore.thresholds,
      weights: dataStore.weights,
    },
  });
});

router.put('/', (req: Request, res: Response) => {
  const { thresholds, weights } = req.body;
  if (thresholds) dataStore.thresholds = { ...dataStore.thresholds, ...thresholds };
  if (weights) dataStore.weights = { ...dataStore.weights, ...weights };

  res.json({
    success: true,
    data: {
      thresholds: dataStore.thresholds,
      weights: dataStore.weights,
    },
  });
});

export default router;
