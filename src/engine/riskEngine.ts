import {
  DecisionType,
  RiskLevel,
  RiskFactor,
  RiskScoreResult,
  EngineThresholds,
  EngineWeights,
  SimulationPayload,
  Customer,
  Merchant
} from '../types';

export const DEFAULT_THRESHOLDS: EngineThresholds = {
  approveMax: 30,
  verifyMax: 60,
  holdMax: 80,
  blockMin: 81,
};

export const DEFAULT_WEIGHTS: EngineWeights = {
  amountDeviationWeight: 22,
  newDeviceWeight: 18,
  locationMismatchWeight: 15,
  velocityWeight: 20,
  failedAttemptsWeight: 16,
  newMerchantWeight: 10,
  highRiskCategoryWeight: 12,
  timeAnomalyWeight: 8,
};

export interface RiskEvaluationInput {
  amount: number;
  customerId: string;
  merchantId: string;
  merchantCategory?: string;
  location: string;
  previousLocation?: string;
  isNewDevice: boolean;
  isNewMerchant: boolean;
  velocityLast10m: number;
  failedAttemptsLast24h: number;
  customerBaseline?: Partial<Customer>;
  merchantBaseline?: Partial<Merchant>;
  accountAgeDays?: number;
  timeOfDayHour?: number;
}

/**
 * AI Prototype Risk Engine (v1.4)
 * 
 * Computes dynamic transaction risk score [0..100], decomposes individual risk factor
 * contributions (interpretable feature weights), and generates human-readable reasoning.
 * Designed with pluggable interfaces for seamless transition to gradient-boosted or neural ML models.
 */
export function evaluateTransactionRisk(
  input: RiskEvaluationInput,
  weights: EngineWeights = DEFAULT_WEIGHTS,
  thresholds: EngineThresholds = DEFAULT_THRESHOLDS
): RiskScoreResult {
  const riskFactors: RiskFactor[] = [];
  let rawScore = 5; // Low baseline inherent network risk

  const avgAmount = input.customerBaseline?.averageAmount || 2500;
  const typicalRange: [number, number] = input.customerBaseline?.typicalAmountRange || [500, 5000];
  const usualLocation = input.customerBaseline?.usualLocations?.[0] || 'Hyderabad';
  const usualDevice = input.customerBaseline?.knownDevices?.[0] || 'Android Device';
  const typicalDailyTxn = input.customerBaseline?.typicalTxnPerDay || 3;

  // 1. Amount Deviation Factor
  const amountRatio = input.amount / Math.max(avgAmount, 100);
  if (amountRatio >= 20) {
    const contribution = Math.min(30, Math.round(weights.amountDeviationWeight * 1.3));
    rawScore += contribution;
    riskFactors.push({
      code: 'AMOUNT_MASSIVE_SPIKE',
      name: `Amount ${amountRatio.toFixed(0)}× customer average`,
      contribution,
      description: `Current payment (₹${input.amount.toLocaleString('en-IN')}) is ${amountRatio.toFixed(0)}x higher than customer typical average of ₹${avgAmount.toLocaleString('en-IN')}.`,
      category: 'AMOUNT',
      severity: 'CRITICAL',
    });
  } else if (amountRatio >= 5) {
    const contribution = Math.min(22, Math.round(weights.amountDeviationWeight * 0.9));
    rawScore += contribution;
    riskFactors.push({
      code: 'AMOUNT_HIGH_SPIKE',
      name: `Amount ${amountRatio.toFixed(1)}× customer average`,
      contribution,
      description: `Payment (₹${input.amount.toLocaleString('en-IN')}) significantly exceeds usual spending range (₹${typicalRange[0].toLocaleString('en-IN')}–₹${typicalRange[1].toLocaleString('en-IN')}).`,
      category: 'AMOUNT',
      severity: 'HIGH',
    });
  } else if (amountRatio >= 2.5) {
    const contribution = Math.round(weights.amountDeviationWeight * 0.45);
    rawScore += contribution;
    riskFactors.push({
      code: 'AMOUNT_MODERATE_SPIKE',
      name: 'Higher than usual amount',
      contribution,
      description: `Payment amount is moderately higher than usual baseline.`,
      category: 'AMOUNT',
      severity: 'MEDIUM',
    });
  }

  // 2. Device Novelty Factor
  if (input.isNewDevice) {
    const contribution = weights.newDeviceWeight;
    rawScore += contribution;
    riskFactors.push({
      code: 'DEVICE_UNRECOGNIZED',
      name: 'New / Unrecognized device fingerprint',
      contribution,
      description: 'Transaction originated from a previously unseen hardware/browser signature.',
      category: 'DEVICE',
      severity: 'HIGH',
    });
  }

  // 3. Location Anomaly / Impossible Travel
  const isLocationMismatch =
    Boolean(input.previousLocation && input.location !== input.previousLocation) ||
    (input.customerBaseline?.usualLocations &&
      !input.customerBaseline.usualLocations.includes(input.location));

  if (isLocationMismatch) {
    const contribution = weights.locationMismatchWeight;
    rawScore += contribution;
    riskFactors.push({
      code: 'LOCATION_ANOMALY',
      name: 'Unusual / Mismatched location',
      contribution,
      description: `Originating city (${input.location}) deviates from customer established activity center (${usualLocation}).`,
      category: 'LOCATION',
      severity: 'HIGH',
    });
  }

  // 4. Velocity Factor (Transactions in last 10 minutes)
  if (input.velocityLast10m >= 10) {
    const contribution = Math.min(30, Math.round(weights.velocityWeight * 1.4));
    rawScore += contribution;
    riskFactors.push({
      code: 'VELOCITY_EXTREME',
      name: 'Critical transaction velocity burst',
      contribution,
      description: `${input.velocityLast10m} payment attempts recorded within the last 10 minutes (Card testing or bot script signature).`,
      category: 'VELOCITY',
      severity: 'CRITICAL',
    });
  } else if (input.velocityLast10m >= 4) {
    const contribution = weights.velocityWeight;
    rawScore += contribution;
    riskFactors.push({
      code: 'VELOCITY_HIGH',
      name: 'High transaction velocity',
      contribution,
      description: `${input.velocityLast10m} transactions initiated in a short 10-minute window.`,
      category: 'VELOCITY',
      severity: 'HIGH',
    });
  } else if (input.velocityLast10m >= 2) {
    const contribution = Math.round(weights.velocityWeight * 0.4);
    rawScore += contribution;
    riskFactors.push({
      code: 'VELOCITY_MODERATE',
      name: 'Moderate transaction velocity',
      contribution,
      description: `Multiple transactions observed within recent minutes.`,
      category: 'VELOCITY',
      severity: 'MEDIUM',
    });
  }

  // 5. Failed Attempts in last 24h
  if (input.failedAttemptsLast24h >= 4) {
    const contribution = Math.min(25, Math.round(weights.failedAttemptsWeight * 1.3));
    rawScore += contribution;
    riskFactors.push({
      code: 'FAILED_ATTEMPTS_SPIKE',
      name: `${input.failedAttemptsLast24h} recent failed payment attempts`,
      contribution,
      description: `Repeated authorization declines or OTP timeouts prior to this successful transaction.`,
      category: 'BEHAVIOR',
      severity: 'HIGH',
    });
  } else if (input.failedAttemptsLast24h >= 2) {
    const contribution = Math.round(weights.failedAttemptsWeight * 0.6);
    rawScore += contribution;
    riskFactors.push({
      code: 'FAILED_ATTEMPTS_MODERATE',
      name: `${input.failedAttemptsLast24h} recent failed attempts`,
      contribution,
      description: `Prior transaction declines noted in the last 24 hours.`,
      category: 'BEHAVIOR',
      severity: 'MEDIUM',
    });
  }

  // 6. New Merchant Factor
  if (input.isNewMerchant) {
    const contribution = weights.newMerchantWeight;
    rawScore += contribution;
    riskFactors.push({
      code: 'MERCHANT_FIRST_TIME',
      name: 'First-time merchant interaction',
      contribution,
      description: `Customer has no prior payment history with this merchant.`,
      category: 'MERCHANT',
      severity: 'LOW',
    });
  }

  // 7. Merchant Category / Risk Rate
  if (input.merchantBaseline?.fraudRate && input.merchantBaseline.fraudRate > 3.0) {
    const contribution = weights.highRiskCategoryWeight;
    rawScore += contribution;
    riskFactors.push({
      code: 'MERCHANT_HIGH_RISK_PROFILE',
      name: 'High-risk merchant profile',
      contribution,
      description: `Merchant has an elevated fraud incidence rate (${input.merchantBaseline.fraudRate.toFixed(1)}%).`,
      category: 'MERCHANT',
      severity: 'HIGH',
    });
  }

  // 8. Account Age Factor
  const age = input.accountAgeDays ?? input.customerBaseline?.accountAgeDays ?? 365;
  if (age <= 7) {
    const contribution = 8;
    rawScore += contribution;
    riskFactors.push({
      code: 'ACCOUNT_NEWBORN',
      name: 'Newly created customer account (< 7 days)',
      contribution,
      description: 'Account was registered very recently, presenting limited historical baseline.',
      category: 'BEHAVIOR',
      severity: 'MEDIUM',
    });
  }

  // 9. Time of day anomaly (e.g. 1 AM to 4 AM)
  const hour = input.timeOfDayHour !== undefined ? input.timeOfDayHour : 14;
  if (hour >= 1 && hour <= 4 && (input.amount > 20000 || input.isNewDevice)) {
    const contribution = weights.timeAnomalyWeight;
    rawScore += contribution;
    riskFactors.push({
      code: 'TIME_ANOMALY',
      name: 'Odd-hour high-value transaction',
      contribution,
      description: `Transaction initiated during low-activity nighttime window (${hour}:00 hrs).`,
      category: 'BEHAVIOR',
      severity: 'LOW',
    });
  }

  // Clamp final score strictly between 0 and 100
  const finalScore = Math.min(100, Math.max(1, rawScore));

  // Determine Risk Level & Decision
  let riskLevel: RiskLevel = 'LOW';
  let decision: DecisionType = 'APPROVE';

  if (finalScore <= thresholds.approveMax) {
    riskLevel = 'LOW';
    decision = 'APPROVE';
  } else if (finalScore <= thresholds.verifyMax) {
    riskLevel = 'MEDIUM';
    decision = 'VERIFY';
  } else if (finalScore <= thresholds.holdMax) {
    riskLevel = 'HIGH';
    decision = 'HOLD';
  } else {
    riskLevel = 'CRITICAL';
    decision = 'BLOCK';
  }

  // Generate Explainable AI narrative
  const explanation = generateExplanation({
    riskScore: finalScore,
    decision,
    amountRatio,
    amount: input.amount,
    avgAmount,
    isNewDevice: input.isNewDevice,
    isLocationMismatch: Boolean(isLocationMismatch),
    location: input.location,
    usualLocation,
    velocityLast10m: input.velocityLast10m,
    failedAttempts: input.failedAttemptsLast24h,
    isNewMerchant: input.isNewMerchant,
    riskFactors,
  });

  return {
    riskScore: finalScore,
    riskLevel,
    decision,
    riskFactors: riskFactors.sort((a, b) => b.contribution - a.contribution),
    explanation,
    customerBaseline: {
      averageAmount: avgAmount,
      typicalRange,
      usualLocation,
      usualDevice,
      typicalDailyTxn,
    },
    metrics: {
      amountRatio,
      velocityLast10m: input.velocityLast10m,
      isNewDevice: input.isNewDevice,
      isLocationAnomaly: Boolean(isLocationMismatch),
      failedAttempts: input.failedAttemptsLast24h,
      isNewMerchant: input.isNewMerchant,
    },
  };
}

/**
 * Formulate clear, human-readable Explainable AI narrative.
 */
function generateExplanation(params: {
  riskScore: number;
  decision: DecisionType;
  amountRatio: number;
  amount: number;
  avgAmount: number;
  isNewDevice: boolean;
  isLocationMismatch: boolean;
  location: string;
  usualLocation: string;
  velocityLast10m: number;
  failedAttempts: number;
  isNewMerchant: boolean;
  riskFactors: RiskFactor[];
}): string {
  if (params.riskScore <= 30) {
    return `This transaction aligns closely with the customer's typical behavioral baseline. The transaction amount (₹${params.amount.toLocaleString('en-IN')}) is within expected limits, initiated from a recognized device in ${params.location} with normal velocity. Risk level is low and safe to auto-approve.`;
  }

  const reasons: string[] = [];

  if (params.amountRatio >= 5) {
    reasons.push(`the payment amount (₹${params.amount.toLocaleString('en-IN')}) is significantly higher (${params.amountRatio.toFixed(1)}×) than the customer's historical average of ₹${params.avgAmount.toLocaleString('en-IN')}`);
  } else if (params.amountRatio >= 2) {
    reasons.push(`the payment amount is moderately elevated compared to past transactions`);
  }

  if (params.isNewDevice) {
    reasons.push(`the transaction originated from a new, unrecognized device fingerprint`);
  }

  if (params.isLocationMismatch) {
    reasons.push(`the originating location (${params.location}) differs from the customer's usual activity hub (${params.usualLocation})`);
  }

  if (params.velocityLast10m >= 4) {
    reasons.push(`${params.velocityLast10m} rapid transactions occurred within the last 10 minutes`);
  }

  if (params.failedAttempts >= 2) {
    reasons.push(`there were ${params.failedAttempts} prior failed authorization attempts in the last 24 hours`);
  }

  if (params.isNewMerchant) {
    reasons.push(`this is the first transaction with this merchant`);
  }

  if (reasons.length === 0) {
    return `This transaction presents moderate statistical deviation across payment and merchant features, warranting a risk score of ${params.riskScore}/100 and a recommendation to ${params.decision}.`;
  }

  const joinedReasons = reasons.length === 1
    ? reasons[0]
    : reasons.slice(0, -1).join(', ') + ', and ' + reasons[reasons.length - 1];

  return `This transaction was flagged with a risk score of ${params.riskScore}/100 because ${joinedReasons}. The system recommends ${params.decision} pending risk analyst verification.`;
}

/**
 * Helper to evaluate simulation payload
 */
export function evaluateSimulation(
  sim: SimulationPayload,
  weights: EngineWeights = DEFAULT_WEIGHTS,
  thresholds: EngineThresholds = DEFAULT_THRESHOLDS
): RiskScoreResult {
  const hour = parseInt(sim.timeOfDay.split(':')[0] || '14', 10);

  return evaluateTransactionRisk(
    {
      amount: sim.amount,
      customerId: sim.customerId,
      merchantId: sim.merchantId,
      location: sim.location,
      previousLocation: sim.previousLocation,
      isNewDevice: sim.isNewDevice,
      isNewMerchant: sim.isNewMerchant,
      velocityLast10m: sim.velocityLast10m,
      failedAttemptsLast24h: sim.failedAttemptsLast24h,
      accountAgeDays: sim.accountAgeDays,
      timeOfDayHour: hour,
      customerBaseline: {
        id: sim.customerId,
        averageAmount: sim.averageCustomerTransaction,
        typicalAmountRange: [
          Math.round(sim.averageCustomerTransaction * 0.3),
          Math.round(sim.averageCustomerTransaction * 2.2),
        ],
        usualLocations: [sim.previousLocation || 'Hyderabad'],
        knownDevices: sim.isNewDevice ? ['Old Recognized Device'] : [sim.deviceType],
        typicalTxnPerDay: 3,
        accountAgeDays: sim.accountAgeDays,
      },
    },
    weights,
    thresholds
  );
}
