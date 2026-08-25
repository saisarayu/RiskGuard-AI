export type DecisionType = 'APPROVE' | 'VERIFY' | 'HOLD' | 'BLOCK';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'NetBanking' | 'Wallet';
export type DeviceType = 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux';
export type InvestigationStatus = 'OPEN' | 'INVESTIGATING' | 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'RESOLVED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  code: string;
  name: string;
  contribution: number; // e.g. +18, +22
  description: string;
  category: 'DEVICE' | 'VELOCITY' | 'AMOUNT' | 'LOCATION' | 'MERCHANT' | 'BEHAVIOR';
  severity: RiskLevel;
}

export interface AnalystOverride {
  originalDecision: DecisionType;
  analystDecision: DecisionType;
  analystName: string;
  reason: string;
  notes?: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  timestamp: string;
  customerId: string;
  customerName: string;
  merchantId: string;
  merchantName: string;
  merchantCategory: string;
  paymentMethod: PaymentMethod;
  location: string;
  previousLocation: string;
  ipAddress: string;
  deviceId: string;
  deviceType: DeviceType;
  isNewDevice: boolean;
  isNewMerchant: boolean;
  failedAttemptsLast24h: number;
  velocityLast10m: number;
  velocityLast1h: number;
  timeSinceLastTxnMinutes: number;
  riskScore: number;
  riskLevel: RiskLevel;
  aiDecision: DecisionType;
  finalDecision: DecisionType;
  isOverridden: boolean;
  overrideDetails?: AnalystOverride;
  riskFactors: RiskFactor[];
  explanation: string;
  patternTags?: string[];
  investigationId?: string;
  flaggedReasonSummary?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountAgeDays: number;
  totalTransactions: number;
  totalSpent: number;
  averageAmount: number;
  typicalAmountRange: [number, number];
  usualLocations: string[];
  knownDevices: string[];
  typicalTxnPerDay: number;
  riskScore: number;
  riskLevel: RiskLevel;
  suspiciousTxnCount: number;
  blockedTxnCount: number;
  createdAt: string;
  status: 'ACTIVE' | 'FLAGGED' | 'RESTRICTED';
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  totalTransactions: number;
  totalVolume: number;
  averageAmount: number;
  refundRate: number; // e.g. 1.8%
  chargebackRate: number; // e.g. 0.4%
  fraudRate: number; // e.g. 1.2%
  riskScore: number;
  riskLevel: RiskLevel;
  isSuspicious: boolean;
  joinedDate: string;
  location: string;
}

export interface InvestigationCase {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: InvestigationStatus;
  priority: PriorityLevel;
  assignee: string;
  openedAt: string;
  updatedAt: string;
  summary: string;
  aiExplanation: string;
  notes: {
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }[];
  tags: string[];
}

export interface FraudPatternGroup {
  id: string;
  name: string;
  code: 'VELOCITY_BURST' | 'NEW_DEVICE_HIGH_TICKET' | 'LOCATION_ANOMALY' | 'REPEATED_FAILED_ATTEMPTS' | 'CARDING_TEST';
  description: string;
  exampleScenario: string;
  severity: PriorityLevel;
  affectedTxnCount: number;
  totalExposure: number;
  transactionIds: string[];
  recommendation: string;
}

export interface EngineThresholds {
  approveMax: number; // default 30
  verifyMax: number;  // default 60
  holdMax: number;    // default 80
  blockMin: number;   // default 81
}

export interface EngineWeights {
  amountDeviationWeight: number;     // Weight for amount vs avg
  newDeviceWeight: number;           // Weight for unseen device
  locationMismatchWeight: number;    // Weight for impossible travel/mismatch
  velocityWeight: number;            // Weight for burst velocity
  failedAttemptsWeight: number;      // Weight for recent failures
  newMerchantWeight: number;         // Weight for first time merchant
  highRiskCategoryWeight: number;    // Weight for merchant category
  timeAnomalyWeight: number;         // Weight for odd hour transactions
}

export interface RiskScoreResult {
  riskScore: number;
  riskLevel: RiskLevel;
  decision: DecisionType;
  riskFactors: RiskFactor[];
  explanation: string;
  customerBaseline: {
    averageAmount: number;
    typicalRange: [number, number];
    usualLocation: string;
    usualDevice: string;
    typicalDailyTxn: number;
  };
  metrics: {
    amountRatio: number;
    velocityLast10m: number;
    isNewDevice: boolean;
    isLocationAnomaly: boolean;
    failedAttempts: number;
    isNewMerchant: boolean;
  };
}

export interface SimulationPayload {
  amount: number;
  customerId: string;
  merchantId: string;
  deviceType: DeviceType;
  isNewDevice: boolean;
  location: string;
  previousLocation: string;
  velocityLast10m: number;
  averageCustomerTransaction: number;
  isNewMerchant: boolean;
  failedAttemptsLast24h: number;
  accountAgeDays: number;
  timeOfDay: string;
  paymentMethod: PaymentMethod;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  relatedTransactionId?: string;
  relatedCustomerId?: string;
  relatedMerchantId?: string;
  suggestedActions?: { label: string; action: () => void }[];
}
