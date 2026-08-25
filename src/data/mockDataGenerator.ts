import {
  Transaction,
  Customer,
  Merchant,
  InvestigationCase,
  FraudPatternGroup,
  PaymentMethod,
  DeviceType,
} from '../types';
import { evaluateTransactionRisk } from '../engine/riskEngine';

// Seed list of realistic customers
const SEED_CUSTOMERS_DATA = [
  { id: 'CUST-102', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', usualLocations: ['Hyderabad', 'Secunderabad'], knownDevices: ['Samsung Galaxy S23 (Android)', 'OnePlus 11'], avgAmount: 2500, minRange: 500, maxRange: 5000, txnsPerDay: 3, ageDays: 480 },
  { id: 'CUST-103', name: 'Priya Venkatesh', email: 'priya.v@example.com', phone: '+91 98450 11223', usualLocations: ['Bengaluru'], knownDevices: ['iPhone 15 Pro (iOS)', 'MacBook Pro M2'], avgAmount: 6200, minRange: 1500, maxRange: 12000, txnsPerDay: 4, ageDays: 720 },
  { id: 'CUST-104', name: 'Rohan Mehta', email: 'rohan.mehta@example.com', phone: '+91 98201 33445', usualLocations: ['Mumbai', 'Thane'], knownDevices: ['Google Pixel 8 (Android)', 'Windows PC'], avgAmount: 3800, minRange: 800, maxRange: 7500, txnsPerDay: 2, ageDays: 310 },
  { id: 'CUST-105', name: 'Ananya Deshmukh', email: 'ananya.d@example.com', phone: '+91 98112 55667', usualLocations: ['Pune'], knownDevices: ['iPhone 14 (iOS)'], avgAmount: 1800, minRange: 300, maxRange: 4000, txnsPerDay: 3, ageDays: 190 },
  { id: 'CUST-106', name: 'Vikramaditya Roy', email: 'v.roy@example.com', phone: '+91 98334 77889', usualLocations: ['Kolkata'], knownDevices: ['Xiaomi 13 Pro (Android)'], avgAmount: 4200, minRange: 1000, maxRange: 8500, txnsPerDay: 2, ageDays: 600 },
  { id: 'CUST-107', name: 'Sneha Kulkarni', email: 'sneha.k@example.com', phone: '+91 98665 99001', usualLocations: ['Chennai'], knownDevices: ['Samsung Galaxy A54 (Android)'], avgAmount: 2100, minRange: 400, maxRange: 4500, txnsPerDay: 3, ageDays: 140 },
  { id: 'CUST-108', name: 'Kabir Singhania', email: 'kabir.s@example.com', phone: '+91 98990 12345', usualLocations: ['Delhi NCR', 'Gurugram'], knownDevices: ['iPhone 15 (iOS)', 'iPad Pro'], avgAmount: 14500, minRange: 3000, maxRange: 35000, txnsPerDay: 5, ageDays: 850 },
  { id: 'CUST-109', name: 'Meera Nambiar', email: 'meera.n@example.com', phone: '+91 98471 23456', usualLocations: ['Kochi'], knownDevices: ['Nothing Phone (2)'], avgAmount: 3100, minRange: 700, maxRange: 6000, txnsPerDay: 2, ageDays: 260 },
  { id: 'CUST-110', name: 'Aditya Verma', email: 'aditya.v@example.com', phone: '+91 97110 34567', usualLocations: ['Noida', 'Delhi'], knownDevices: ['Realme GT Neo (Android)'], avgAmount: 1900, minRange: 400, maxRange: 3800, txnsPerDay: 4, ageDays: 95 },
  { id: 'CUST-111', name: 'Tanvi Agarwal', email: 'tanvi.a@example.com', phone: '+91 98290 45678', usualLocations: ['Jaipur'], knownDevices: ['Vivo X90 (Android)'], avgAmount: 2800, minRange: 600, maxRange: 5500, txnsPerDay: 2, ageDays: 420 },
  { id: 'CUST-112', name: 'Karthik Raman', email: 'karthik.r@example.com', phone: '+91 98401 56789', usualLocations: ['Chennai', 'Coimbatore'], knownDevices: ['OnePlus Nord (Android)'], avgAmount: 3400, minRange: 800, maxRange: 6500, txnsPerDay: 3, ageDays: 510 },
  { id: 'CUST-113', name: 'Zoya Akhtar', email: 'zoya.a@example.com', phone: '+91 98200 67890', usualLocations: ['Mumbai'], knownDevices: ['iPhone 13 (iOS)'], avgAmount: 5100, minRange: 1200, maxRange: 9800, txnsPerDay: 3, ageDays: 340 },
  { id: 'CUST-114', name: 'Arjun Nair', email: 'arjun.nair@example.com', phone: '+91 98452 78901', usualLocations: ['Bengaluru'], knownDevices: ['MacBook Air', 'Pixel 7a'], avgAmount: 7800, minRange: 2000, maxRange: 15000, txnsPerDay: 4, ageDays: 670 },
  { id: 'CUST-115', name: 'Deepika Sen', email: 'deepika.s@example.com', phone: '+91 98302 89012', usualLocations: ['Kolkata'], knownDevices: ['Samsung S22'], avgAmount: 2300, minRange: 500, maxRange: 4800, txnsPerDay: 2, ageDays: 180 },
  { id: 'CUST-116', name: 'Harsh Vardhan', email: 'harsh.v@example.com', phone: '+91 98711 90123', usualLocations: ['Chandigarh'], knownDevices: ['Motorola Edge 40'], avgAmount: 3200, minRange: 700, maxRange: 6200, txnsPerDay: 3, ageDays: 290 },
];

// Seed list of realistic merchants
const SEED_MERCHANTS_DATA = [
  { id: 'MERCH-501', name: 'Nova Electronics Hub', category: 'High-Value Electronics', avgAmount: 28500, refundRate: 2.1, chargebackRate: 0.9, fraudRate: 3.8, isSuspicious: true, location: 'Bengaluru' },
  { id: 'MERCH-502', name: 'SwiftPay Instant Remit', category: 'Fintech / Crypto Voucher', avgAmount: 45000, refundRate: 0.4, chargebackRate: 1.8, fraudRate: 5.4, isSuspicious: true, location: 'Mumbai' },
  { id: 'MERCH-503', name: 'BigBazaar Grocery Online', category: 'Daily Supermarket & Grocery', avgAmount: 1450, refundRate: 1.2, chargebackRate: 0.05, fraudRate: 0.2, isSuspicious: false, location: 'Pan India' },
  { id: 'MERCH-504', name: 'UrbanKart Apparels', category: 'Fashion & Lifestyle', avgAmount: 3200, refundRate: 4.8, chargebackRate: 0.2, fraudRate: 0.6, isSuspicious: false, location: 'New Delhi' },
  { id: 'MERCH-505', name: 'StreamFlix Entertainment', category: 'Digital Subscription', avgAmount: 799, refundRate: 0.3, chargebackRate: 0.1, fraudRate: 0.4, isSuspicious: false, location: 'Mumbai' },
  { id: 'MERCH-506', name: 'CloudHost Global VPC', category: 'Cloud Infrastructure', avgAmount: 12000, refundRate: 0.8, chargebackRate: 1.2, fraudRate: 4.1, isSuspicious: true, location: 'Hyderabad' },
  { id: 'MERCH-507', name: 'FoodExpress Deliveries', category: 'Food & Quick Commerce', avgAmount: 550, refundRate: 2.4, chargebackRate: 0.08, fraudRate: 0.3, isSuspicious: false, location: 'Pan India' },
  { id: 'MERCH-508', name: 'Apex Game Credits', category: 'Gaming & Virtual Assets', avgAmount: 4900, refundRate: 1.1, chargebackRate: 2.2, fraudRate: 4.9, isSuspicious: true, location: 'Pune' },
  { id: 'MERCH-509', name: 'Aura Luxury Watches', category: 'Luxury Retail', avgAmount: 85000, refundRate: 1.5, chargebackRate: 1.1, fraudRate: 3.2, isSuspicious: true, location: 'Mumbai' },
  { id: 'MERCH-510', name: 'MedPlus Pharma Direct', category: 'Healthcare & Pharmacy', avgAmount: 1850, refundRate: 0.7, chargebackRate: 0.04, fraudRate: 0.1, isSuspicious: false, location: 'Hyderabad' },
  { id: 'MERCH-511', name: 'FlightJet Air Travel', category: 'Travel & Airlines', avgAmount: 18400, refundRate: 3.5, chargebackRate: 0.6, fraudRate: 1.8, isSuspicious: false, location: 'Delhi NCR' },
  { id: 'MERCH-512', name: 'Zest Fuel & EV Charge', category: 'Automotive & Utilities', avgAmount: 2200, refundRate: 0.2, chargebackRate: 0.02, fraudRate: 0.1, isSuspicious: false, location: 'Pan India' },
];

const CITIES = ['Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune', 'Kolkata', 'Chennai', 'Jaipur', 'Ahmedabad', 'Kochi', 'London (Proxy)', 'Singapore (Proxy)', 'Bucharest (VPN)'];
const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Credit Card', 'Debit Card', 'NetBanking', 'Wallet'];
const DEVICE_TYPES: DeviceType[] = ['Android', 'iOS', 'Windows', 'macOS'];

export interface InitialDataPayload {
  transactions: Transaction[];
  customers: Customer[];
  merchants: Merchant[];
  investigations: InvestigationCase[];
  fraudPatterns: FraudPatternGroup[];
  kpis: {
    totalTransactions: number;
    highRiskTransactions: number;
    fraudDetected: number;
    amountAtRisk: number;
    falsePositiveRate: number;
    averageRiskScore: number;
  };
}

/**
 * Generates an internally consistent, synthetic dataset with 250+ transactions
 */
export function generateSyntheticDataset(): InitialDataPayload {
  // 1. Build Customers
  const customers: Customer[] = SEED_CUSTOMERS_DATA.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    accountAgeDays: c.ageDays,
    totalTransactions: 0,
    totalSpent: 0,
    averageAmount: c.avgAmount,
    typicalAmountRange: [c.minRange, c.maxRange],
    usualLocations: c.usualLocations,
    knownDevices: c.knownDevices,
    typicalTxnPerDay: c.txnsPerDay,
    riskScore: 18,
    riskLevel: 'LOW',
    suspiciousTxnCount: 0,
    blockedTxnCount: 0,
    createdAt: new Date(Date.now() - c.ageDays * 86400000).toISOString(),
    status: 'ACTIVE',
  }));

  // 2. Build Merchants
  const merchants: Merchant[] = SEED_MERCHANTS_DATA.map((m, idx) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    totalTransactions: 120 + idx * 85,
    totalVolume: Math.round(m.avgAmount * (120 + idx * 85)),
    averageAmount: m.avgAmount,
    refundRate: m.refundRate,
    chargebackRate: m.chargebackRate,
    fraudRate: m.fraudRate,
    riskScore: Math.round(m.fraudRate * 14 + m.chargebackRate * 12 + 10),
    riskLevel: m.fraudRate > 3.5 ? 'CRITICAL' : m.fraudRate > 1.5 ? 'HIGH' : m.fraudRate > 0.8 ? 'MEDIUM' : 'LOW',
    isSuspicious: m.isSuspicious,
    joinedDate: new Date(Date.now() - (300 + idx * 40) * 86400000).toISOString().split('T')[0],
    location: m.location,
  }));

  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const merchantMap = new Map(merchants.map((m) => [m.id, m]));

  const transactions: Transaction[] = [];
  const now = Date.now();

  // Helper to generate transaction timestamp
  const getRelativeTimestamp = (minutesAgo: number) => {
    return new Date(now - minutesAgo * 60000).toISOString();
  };

  // --- Seed Showcase Transaction 1 (Prompt Exact Match: TXN-10234) ---
  const cust102 = customerMap.get('CUST-102')!;
  const merch501 = merchantMap.get('MERCH-501')!;
  const txn10234Evaluation = evaluateTransactionRisk({
    amount: 75000,
    customerId: cust102.id,
    merchantId: merch501.id,
    merchantCategory: merch501.category,
    location: 'Hyderabad',
    previousLocation: 'Hyderabad',
    isNewDevice: true,
    isNewMerchant: true,
    velocityLast10m: 12,
    failedAttemptsLast24h: 3,
    customerBaseline: cust102,
    merchantBaseline: merch501,
    timeOfDayHour: 2, // 2 AM odd hour
  });

  const txn10234: Transaction = {
    id: 'TXN-10234',
    amount: 75000,
    currency: 'INR',
    timestamp: getRelativeTimestamp(12),
    customerId: cust102.id,
    customerName: cust102.name,
    merchantId: merch501.id,
    merchantName: merch501.name,
    merchantCategory: merch501.category,
    paymentMethod: 'Credit Card',
    location: 'Hyderabad',
    previousLocation: 'Hyderabad',
    ipAddress: '185.220.101.45',
    deviceId: 'DEV-NEW-88910',
    deviceType: 'Windows',
    isNewDevice: true,
    isNewMerchant: true,
    failedAttemptsLast24h: 3,
    velocityLast10m: 12,
    velocityLast1h: 18,
    timeSinceLastTxnMinutes: 1,
    riskScore: 92,
    riskLevel: 'CRITICAL',
    aiDecision: 'BLOCK',
    finalDecision: 'BLOCK',
    isOverridden: false,
    riskFactors: txn10234Evaluation.riskFactors,
    explanation: txn10234Evaluation.explanation,
    patternTags: ['New Device + Large Payment', 'High Velocity'],
    investigationId: 'CASE-8801',
  };
  transactions.push(txn10234);

  // --- Seed Showcase Transaction 2 (Card Testing / Failed Attempts) ---
  const cust108 = customerMap.get('CUST-108')!;
  const merch502 = merchantMap.get('MERCH-502')!;
  const eval2 = evaluateTransactionRisk({
    amount: 98000,
    customerId: cust108.id,
    merchantId: merch502.id,
    location: 'Bucharest (VPN)',
    previousLocation: 'Delhi NCR',
    isNewDevice: true,
    isNewMerchant: true,
    velocityLast10m: 8,
    failedAttemptsLast24h: 5,
    customerBaseline: cust108,
    merchantBaseline: merch502,
    timeOfDayHour: 3,
  });

  const txn10235: Transaction = {
    id: 'TXN-10235',
    amount: 98000,
    currency: 'INR',
    timestamp: getRelativeTimestamp(25),
    customerId: cust108.id,
    customerName: cust108.name,
    merchantId: merch502.id,
    merchantName: merch502.name,
    merchantCategory: merch502.category,
    paymentMethod: 'Credit Card',
    location: 'Bucharest (VPN)',
    previousLocation: 'Delhi NCR',
    ipAddress: '109.166.134.12',
    deviceId: 'DEV-PROXY-4192',
    deviceType: 'Linux',
    isNewDevice: true,
    isNewMerchant: true,
    failedAttemptsLast24h: 5,
    velocityLast10m: 8,
    velocityLast1h: 14,
    timeSinceLastTxnMinutes: 2,
    riskScore: 96,
    riskLevel: 'CRITICAL',
    aiDecision: 'BLOCK',
    finalDecision: 'BLOCK',
    isOverridden: false,
    riskFactors: eval2.riskFactors,
    explanation: eval2.explanation,
    patternTags: ['Location Anomaly', 'Repeated Failed Attempts'],
    investigationId: 'CASE-8802',
  };
  transactions.push(txn10235);

  // --- Seed Showcase Transaction 3 (Analyst Overridden TXN) ---
  const cust103 = customerMap.get('CUST-103')!;
  const merch509 = merchantMap.get('MERCH-509')!;
  const eval3 = evaluateTransactionRisk({
    amount: 85000,
    customerId: cust103.id,
    merchantId: merch509.id,
    location: 'Bengaluru',
    previousLocation: 'Bengaluru',
    isNewDevice: true,
    isNewMerchant: true,
    velocityLast10m: 1,
    failedAttemptsLast24h: 0,
    customerBaseline: cust103,
    merchantBaseline: merch509,
    timeOfDayHour: 15,
  });

  const txn10236: Transaction = {
    id: 'TXN-10236',
    amount: 85000,
    currency: 'INR',
    timestamp: getRelativeTimestamp(45),
    customerId: cust103.id,
    customerName: cust103.name,
    merchantId: merch509.id,
    merchantName: merch509.name,
    merchantCategory: merch509.category,
    paymentMethod: 'NetBanking',
    location: 'Bengaluru',
    previousLocation: 'Bengaluru',
    ipAddress: '122.172.84.19',
    deviceId: 'DEV-MAC-9912',
    deviceType: 'macOS',
    isNewDevice: true,
    isNewMerchant: true,
    failedAttemptsLast24h: 0,
    velocityLast10m: 1,
    velocityLast1h: 2,
    timeSinceLastTxnMinutes: 180,
    riskScore: 68,
    riskLevel: 'HIGH',
    aiDecision: 'HOLD',
    finalDecision: 'APPROVE',
    isOverridden: true,
    overrideDetails: {
      originalDecision: 'HOLD',
      analystDecision: 'APPROVE',
      analystName: 'Sanjay Deshmukh (Lead Analyst)',
      reason: 'Customer completed high-value biometric 2FA step-up & VIP verification verified via bank video KYC.',
      notes: 'Customer confirmed purchase of anniversary watch at Aura Luxury store.',
      timestamp: getRelativeTimestamp(35),
    },
    riskFactors: eval3.riskFactors,
    explanation: eval3.explanation,
    patternTags: ['New Device + Large Payment'],
  };
  transactions.push(txn10236);

  // --- Seed Showcase Transaction 4 (Medium Risk Verify TXN) ---
  const cust104 = customerMap.get('CUST-104')!;
  const merch506 = merchantMap.get('MERCH-506')!;
  const eval4 = evaluateTransactionRisk({
    amount: 14000,
    customerId: cust104.id,
    merchantId: merch506.id,
    location: 'Mumbai',
    previousLocation: 'Mumbai',
    isNewDevice: true,
    isNewMerchant: true,
    velocityLast10m: 2,
    failedAttemptsLast24h: 1,
    customerBaseline: cust104,
    merchantBaseline: merch506,
    timeOfDayHour: 19,
  });

  const txn10237: Transaction = {
    id: 'TXN-10237',
    amount: 14000,
    currency: 'INR',
    timestamp: getRelativeTimestamp(60),
    customerId: cust104.id,
    customerName: cust104.name,
    merchantId: merch506.id,
    merchantName: merch506.name,
    merchantCategory: merch506.category,
    paymentMethod: 'UPI',
    location: 'Mumbai',
    previousLocation: 'Mumbai',
    ipAddress: '49.36.120.44',
    deviceId: 'DEV-TAB-3301',
    deviceType: 'Android',
    isNewDevice: true,
    isNewMerchant: true,
    failedAttemptsLast24h: 1,
    velocityLast10m: 2,
    velocityLast1h: 3,
    timeSinceLastTxnMinutes: 40,
    riskScore: 52,
    riskLevel: 'MEDIUM',
    aiDecision: 'VERIFY',
    finalDecision: 'VERIFY',
    isOverridden: false,
    riskFactors: eval4.riskFactors,
    explanation: eval4.explanation,
    patternTags: [],
  };
  transactions.push(txn10237);

  // --- Generate 260+ realistic transactions spanning the last 72 hours ---
  let txnCounter = 10238;

  // Patterns clustering setup
  const velocityClusterCustomer = cust102;
  const locationClusterCustomer = customerMap.get('CUST-106') || cust102;

  for (let i = 0; i < 265; i++) {
    const cust = customers[i % customers.length];
    const merch = merchants[(i * 3 + 1) % merchants.length];
    const minutesAgo = Math.floor(i * 15 + Math.random() * 20) + 1;
    const hour = (24 - Math.floor((minutesAgo % 1440) / 60)) % 24;

    let isNewDevice = false;
    let isNewMerchant = false;
    let velocityLast10m = 1;
    let failedAttempts = 0;
    let location = cust.usualLocations[0] || 'Hyderabad';
    let previousLocation = cust.usualLocations[0] || 'Hyderabad';
    let amount = 0;
    const patternTags: string[] = [];

    // Synthetic injection of specific fraud scenarios
    if (i % 35 === 0) {
      // Scenario: Velocity attack burst
      velocityLast10m = Math.floor(Math.random() * 8) + 10;
      isNewDevice = true;
      amount = Math.round(cust.averageAmount * 12 + Math.random() * 10000);
      patternTags.push('High Velocity');
    } else if (i % 22 === 0) {
      // Scenario: Location anomaly (Impossible travel)
      location = i % 2 === 0 ? 'London (Proxy)' : 'Singapore (Proxy)';
      previousLocation = cust.usualLocations[0];
      amount = Math.round(cust.averageAmount * 8 + 5000);
      isNewDevice = true;
      patternTags.push('Location Anomaly');
    } else if (i % 18 === 0) {
      // Scenario: Card testing with failed attempts
      failedAttempts = Math.floor(Math.random() * 4) + 3;
      amount = Math.round(merch.averageAmount * 1.5);
      isNewMerchant = true;
      patternTags.push('Repeated Failed Attempts');
    } else if (i % 12 === 0) {
      // Scenario: High value new device
      isNewDevice = true;
      isNewMerchant = true;
      amount = Math.round(cust.averageAmount * 6 + 15000);
      patternTags.push('New Device + Large Payment');
    } else {
      // Normal routine transaction
      const variance = (Math.random() - 0.4) * 0.8;
      amount = Math.max(150, Math.round(cust.averageAmount * (1 + variance)));
      isNewDevice = Math.random() < 0.08;
      isNewMerchant = Math.random() < 0.15;
      velocityLast10m = Math.random() < 0.1 ? 2 : 1;
      failedAttempts = Math.random() < 0.05 ? 1 : 0;
      location = cust.usualLocations[Math.floor(Math.random() * cust.usualLocations.length)];
      previousLocation = location;
    }

    const evaluation = evaluateTransactionRisk({
      amount,
      customerId: cust.id,
      merchantId: merch.id,
      merchantCategory: merch.category,
      location,
      previousLocation,
      isNewDevice,
      isNewMerchant,
      velocityLast10m,
      failedAttemptsLast24h: failedAttempts,
      customerBaseline: cust,
      merchantBaseline: merch,
      timeOfDayHour: hour,
    });

    const txnId = `TXN-${txnCounter++}`;
    const deviceType = DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)];
    const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];

    transactions.push({
      id: txnId,
      amount,
      currency: 'INR',
      timestamp: getRelativeTimestamp(minutesAgo),
      customerId: cust.id,
      customerName: cust.name,
      merchantId: merch.id,
      merchantName: merch.name,
      merchantCategory: merch.category,
      paymentMethod,
      location,
      previousLocation,
      ipAddress: `${Math.floor(Math.random() * 180 + 20)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      deviceId: `DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      deviceType,
      isNewDevice,
      isNewMerchant,
      failedAttemptsLast24h: failedAttempts,
      velocityLast10m,
      velocityLast1h: velocityLast10m + Math.floor(Math.random() * 3),
      timeSinceLastTxnMinutes: Math.floor(Math.random() * 120) + 1,
      riskScore: evaluation.riskScore,
      riskLevel: evaluation.riskLevel,
      aiDecision: evaluation.decision,
      finalDecision: evaluation.decision,
      isOverridden: false,
      riskFactors: evaluation.riskFactors,
      explanation: evaluation.explanation,
      patternTags: patternTags.length > 0 ? patternTags : undefined,
    });
  }

  // Sort transactions in reverse chronological order
  transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Aggregate Customer Stats
  customers.forEach((cust) => {
    const custTxns = transactions.filter((t) => t.customerId === cust.id);
    cust.totalTransactions = custTxns.length;
    cust.totalSpent = custTxns.reduce((acc, t) => acc + t.amount, 0);
    cust.suspiciousTxnCount = custTxns.filter((t) => t.riskScore >= 61).length;
    cust.blockedTxnCount = custTxns.filter((t) => t.finalDecision === 'BLOCK').length;
    if (cust.blockedTxnCount > 0) {
      cust.riskScore = Math.min(95, 45 + cust.blockedTxnCount * 15);
      cust.riskLevel = cust.riskScore > 80 ? 'CRITICAL' : 'HIGH';
      cust.status = cust.riskScore > 80 ? 'RESTRICTED' : 'FLAGGED';
    } else if (cust.suspiciousTxnCount > 0) {
      cust.riskScore = 48;
      cust.riskLevel = 'MEDIUM';
      cust.status = 'FLAGGED';
    } else {
      cust.riskScore = 14;
      cust.riskLevel = 'LOW';
      cust.status = 'ACTIVE';
    }
  });

  // Aggregate Merchant Stats
  merchants.forEach((merch) => {
    const merchTxns = transactions.filter((t) => t.merchantId === merch.id);
    if (merchTxns.length > 0) {
      merch.totalTransactions = merchTxns.length * 15; // Synthetic scale
      merch.totalVolume = merchTxns.reduce((acc, t) => acc + t.amount, 0) * 12;
      const flagged = merchTxns.filter((t) => t.riskScore >= 61).length;
      merch.fraudRate = Math.min(8.5, Math.round(((flagged / merchTxns.length) * 10 + merch.fraudRate) * 10) / 10);
    }
  });

  // 3. Build Fraud Pattern Groups
  const highVelocityTxns = transactions.filter((t) => t.patternTags?.includes('High Velocity')).map((t) => t.id);
  const newDeviceHighTxns = transactions.filter((t) => t.patternTags?.includes('New Device + Large Payment')).map((t) => t.id);
  const locationAnomalyTxns = transactions.filter((t) => t.patternTags?.includes('Location Anomaly')).map((t) => t.id);
  const failedAttemptsTxns = transactions.filter((t) => t.patternTags?.includes('Repeated Failed Attempts')).map((t) => t.id);

  const fraudPatterns: FraudPatternGroup[] = [
    {
      id: 'PAT-VELOCITY-01',
      name: 'High Transaction Velocity Burst',
      code: 'VELOCITY_BURST',
      description: 'Multiple automated rapid-fire transactions originating from identical hardware/IP within a short time window.',
      exampleScenario: '42 transactions from the same device within 5 minutes attempting small-to-mid ticket draining.',
      severity: 'CRITICAL',
      affectedTxnCount: highVelocityTxns.length || 42,
      totalExposure: 1845000,
      transactionIds: highVelocityTxns.slice(0, 10),
      recommendation: 'Enforce rate-limiting on device ID and apply mandatory SMS OTP + biometric challenge on velocity > 5 txns/10m.',
    },
    {
      id: 'PAT-DEVICE-02',
      name: 'New Device + High-Ticket Payment',
      code: 'NEW_DEVICE_HIGH_TICKET',
      description: 'High-value purchases initiated immediately upon first login from an unrecognized device or browser signature.',
      exampleScenario: '18 high-value payments originated from previously unseen devices within 30 minutes of credential change.',
      severity: 'HIGH',
      affectedTxnCount: newDeviceHighTxns.length || 18,
      totalExposure: 2460000,
      transactionIds: newDeviceHighTxns.slice(0, 10),
      recommendation: 'Place high-value orders from new devices on 15-minute verification hold with push authorization notification.',
    },
    {
      id: 'PAT-GEO-03',
      name: 'Location Anomaly & Impossible Travel',
      code: 'LOCATION_ANOMALY',
      description: 'Transactions logged from geographic regions physically impossible to reach within elapsed timestamps or known VPN/datacenter ranges.',
      exampleScenario: 'Accounts active in Hyderabad making simultaneous payments through Romanian and Singaporean VPN nodes.',
      severity: 'HIGH',
      affectedTxnCount: locationAnomalyTxns.length || 15,
      totalExposure: 950000,
      transactionIds: locationAnomalyTxns.slice(0, 10),
      recommendation: 'Flag ASN/datacenter IP blocks and request location services verification via mobile application.',
    },
    {
      id: 'PAT-FAIL-04',
      name: 'Repeated Authorization Failures',
      code: 'REPEATED_FAILED_ATTEMPTS',
      description: 'Sequential CVV/OTP declines followed by an abrupt high-value successful checkout.',
      exampleScenario: 'Multiple failed payment attempts followed by successful high-value transactions (brute force testing pattern).',
      severity: 'HIGH',
      affectedTxnCount: failedAttemptsTxns.length || 12,
      totalExposure: 780000,
      transactionIds: failedAttemptsTxns.slice(0, 10),
      recommendation: 'Temporarily lock payment method after 3 consecutive authorization failures within 1 hour.',
    },
  ];

  // 4. Build Initial Investigation Cases
  const investigations: InvestigationCase[] = [
    {
      id: 'CASE-8801',
      transactionId: 'TXN-10234',
      customerId: cust102.id,
      customerName: cust102.name,
      merchantId: merch501.id,
      merchantName: merch501.name,
      amount: 75000,
      riskScore: 92,
      riskLevel: 'CRITICAL',
      status: 'OPEN',
      priority: 'CRITICAL',
      assignee: 'Sanjay Deshmukh',
      openedAt: getRelativeTimestamp(10),
      updatedAt: getRelativeTimestamp(5),
      summary: 'High-risk account takeover alert: ₹75,000 electronics payment from new Windows machine with velocity spike of 12 txns/10m.',
      aiExplanation: txn10234Evaluation.explanation,
      notes: [
        {
          id: 'NOTE-1',
          author: 'RiskGuard AI System',
          text: 'Case automatically opened due to Risk Score (92) exceeding Critical Threshold (>80). Recommended action: BLOCK & Freeze payment credential.',
          timestamp: getRelativeTimestamp(10),
        },
      ],
      tags: ['Account Takeover', 'High Velocity', 'Electronics'],
    },
    {
      id: 'CASE-8802',
      transactionId: 'TXN-10235',
      customerId: cust108.id,
      customerName: cust108.name,
      merchantId: merch502.id,
      merchantName: merch502.name,
      amount: 98000,
      riskScore: 96,
      riskLevel: 'CRITICAL',
      status: 'INVESTIGATING',
      priority: 'CRITICAL',
      assignee: 'Ananya Sharma',
      openedAt: getRelativeTimestamp(20),
      updatedAt: getRelativeTimestamp(12),
      summary: 'Crypto voucher purchase originating from VPN node in Bucharest after 5 failed CVV attempts.',
      aiExplanation: eval2.explanation,
      notes: [
        {
          id: 'NOTE-1',
          author: 'Ananya Sharma',
          text: 'IP 109.166.134.12 belongs to known hosting ASN. Customer registered in Delhi NCR. Contacting customer for out-of-band verification.',
          timestamp: getRelativeTimestamp(15),
        },
      ],
      tags: ['VPN/Proxy', 'Crypto', 'Card Testing'],
    },
    {
      id: 'CASE-8803',
      transactionId: 'TXN-10236',
      customerId: cust103.id,
      customerName: cust103.name,
      merchantId: merch509.id,
      merchantName: merch509.name,
      amount: 85000,
      riskScore: 68,
      riskLevel: 'HIGH',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      assignee: 'Sanjay Deshmukh',
      openedAt: getRelativeTimestamp(40),
      updatedAt: getRelativeTimestamp(35),
      summary: 'Luxury watch payment manually approved after video KYC verification.',
      aiExplanation: eval3.explanation,
      notes: [
        {
          id: 'NOTE-1',
          author: 'Sanjay Deshmukh',
          text: 'Customer verified transaction via Bank Video KYC. Legitimate luxury store purchase for anniversary. Overridden AI recommendation from HOLD to APPROVE.',
          timestamp: getRelativeTimestamp(35),
        },
      ],
      tags: ['Manual Override', 'VIP Customer', 'Luxury'],
    },
    {
      id: 'CASE-8804',
      transactionId: 'TXN-10245',
      customerId: 'CUST-106',
      customerName: 'Vikramaditya Roy',
      merchantId: 'MERCH-508',
      merchantName: 'Apex Game Credits',
      amount: 32000,
      riskScore: 84,
      riskLevel: 'CRITICAL',
      status: 'CONFIRMED_FRAUD',
      priority: 'HIGH',
      assignee: 'Vikram Patel',
      openedAt: getRelativeTimestamp(180),
      updatedAt: getRelativeTimestamp(90),
      summary: 'Gaming voucher purchase with stolen card credentials. Chargeback received from issuing bank.',
      aiExplanation: 'Rapid gaming credits purchase with mismatching billing address and suspicious velocity pattern.',
      notes: [
        {
          id: 'NOTE-1',
          author: 'Vikram Patel',
          text: 'Issuing bank confirmed card was reported compromised 2 hours ago. Merchant notified to cancel virtual asset delivery. Case marked Confirmed Fraud.',
          timestamp: getRelativeTimestamp(90),
        },
      ],
      tags: ['Gaming', 'Chargeback', 'Stolen Card'],
    },
    {
      id: 'CASE-8805',
      transactionId: 'TXN-10252',
      customerId: 'CUST-105',
      customerName: 'Ananya Deshmukh',
      merchantId: 'MERCH-504',
      merchantName: 'UrbanKart Apparels',
      amount: 12500,
      riskScore: 64,
      riskLevel: 'HIGH',
      status: 'FALSE_POSITIVE',
      priority: 'LOW',
      assignee: 'Neha Verma',
      openedAt: getRelativeTimestamp(240),
      updatedAt: getRelativeTimestamp(160),
      summary: 'Festive season apparel purchase triggered amount spike rule.',
      aiExplanation: 'Amount is 7x higher than customer average, but device and IP matched customer home location.',
      notes: [
        {
          id: 'NOTE-1',
          author: 'Neha Verma',
          text: 'Customer verified order for Diwali gifting. No anomaly detected on device fingerprint. Marked as False Positive.',
          timestamp: getRelativeTimestamp(160),
        },
      ],
      tags: ['False Positive', 'Festive Spike', 'Apparel'],
    },
  ];

  // 5. KPI calculations
  const totalTransactions = 128492; // Realistic synthetic total scale
  const highRiskTransactions = 1284;
  const fraudDetected = 342;
  const amountAtRisk = 4860000; // ₹48.6L
  const falsePositiveRate = 3.8; // 3.8%
  const averageRiskScore = 27.4;

  return {
    transactions,
    customers,
    merchants,
    investigations,
    fraudPatterns,
    kpis: {
      totalTransactions,
      highRiskTransactions,
      fraudDetected,
      amountAtRisk,
      falsePositiveRate,
      averageRiskScore,
    },
  };
}
