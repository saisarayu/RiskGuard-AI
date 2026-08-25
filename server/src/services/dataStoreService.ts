import {
  Transaction,
  Customer,
  Merchant,
  InvestigationCase,
  FraudPatternGroup,
  EngineThresholds,
  EngineWeights,
  DecisionType,
  InvestigationStatus,
  SimulationPayload,
} from '../types';
import {
  DEFAULT_THRESHOLDS,
  DEFAULT_WEIGHTS,
  evaluateTransactionRisk,
  evaluateSimulation,
} from './riskEngineService';

class DataStoreService {
  public transactions: Transaction[] = [];
  public customers: Customer[] = [];
  public merchants: Merchant[] = [];
  public investigations: InvestigationCase[] = [];
  public fraudPatterns: FraudPatternGroup[] = [];
  public thresholds: EngineThresholds = DEFAULT_THRESHOLDS;
  public weights: EngineWeights = DEFAULT_WEIGHTS;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const customersData = [
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
    ];

    this.customers = customersData.map((c) => ({
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

    const merchantsData = [
      { id: 'MERCH-501', name: 'Nova Electronics Hub', category: 'High-Value Electronics', avgAmount: 28500, refundRate: 2.1, chargebackRate: 0.9, fraudRate: 3.8, isSuspicious: true, location: 'Bengaluru' },
      { id: 'MERCH-502', name: 'SwiftPay Instant Remit', category: 'Fintech / Crypto Voucher', avgAmount: 45000, refundRate: 0.4, chargebackRate: 1.8, fraudRate: 5.4, isSuspicious: true, location: 'Mumbai' },
      { id: 'MERCH-503', name: 'BigBazaar Grocery Online', category: 'Daily Supermarket & Grocery', avgAmount: 1450, refundRate: 1.2, chargebackRate: 0.05, fraudRate: 0.2, isSuspicious: false, location: 'Pan India' },
      { id: 'MERCH-504', name: 'UrbanKart Apparels', category: 'Fashion & Lifestyle', avgAmount: 3200, refundRate: 4.8, chargebackRate: 0.2, fraudRate: 0.6, isSuspicious: false, location: 'New Delhi' },
      { id: 'MERCH-505', name: 'StreamFlix Entertainment', category: 'Digital Subscription', avgAmount: 799, refundRate: 0.3, chargebackRate: 0.1, fraudRate: 0.4, isSuspicious: false, location: 'Mumbai' },
      { id: 'MERCH-506', name: 'CloudHost Global VPC', category: 'Cloud Infrastructure', avgAmount: 12000, refundRate: 0.8, chargebackRate: 1.2, fraudRate: 4.1, isSuspicious: true, location: 'Hyderabad' },
      { id: 'MERCH-507', name: 'FoodExpress Deliveries', category: 'Food & Quick Commerce', avgAmount: 550, refundRate: 2.4, chargebackRate: 0.08, fraudRate: 0.3, isSuspicious: false, location: 'Pan India' },
      { id: 'MERCH-508', name: 'Apex Game Credits', category: 'Gaming & Virtual Assets', avgAmount: 4900, refundRate: 1.1, chargebackRate: 2.2, fraudRate: 4.9, isSuspicious: true, location: 'Pune' },
      { id: 'MERCH-509', name: 'Aura Luxury Watches', category: 'Luxury Retail', avgAmount: 85000, refundRate: 1.5, chargebackRate: 1.1, fraudRate: 3.2, isSuspicious: true, location: 'Mumbai' },
    ];

    this.merchants = merchantsData.map((m, idx) => ({
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
      riskLevel: m.fraudRate > 3.5 ? 'CRITICAL' : m.fraudRate > 1.5 ? 'HIGH' : 'MEDIUM',
      isSuspicious: m.isSuspicious,
      joinedDate: new Date(Date.now() - (300 + idx * 40) * 86400000).toISOString().split('T')[0],
      location: m.location,
    }));

    const cust102 = this.customers.find((c) => c.id === 'CUST-102')!;
    const merch501 = this.merchants.find((m) => m.id === 'MERCH-501')!;

    // Showcase TXN-10234
    const eval10234 = evaluateTransactionRisk({
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
      timeOfDayHour: 2,
    });

    const txn10234: Transaction = {
      id: 'TXN-10234',
      amount: 75000,
      currency: 'INR',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
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
      riskFactors: eval10234.riskFactors,
      explanation: eval10234.explanation,
      patternTags: ['New Device + Large Payment', 'High Velocity'],
      investigationId: 'CASE-8801',
    };
    this.transactions.push(txn10234);

    // Generate batch transactions
    for (let i = 0; i < 260; i++) {
      const cust = this.customers[i % this.customers.length];
      const merch = this.merchants[(i * 3 + 1) % this.merchants.length];
      const minutesAgo = (i + 1) * 16;

      let isNewDevice = false;
      let isNewMerchant = false;
      let velocityLast10m = 1;
      let failedAttempts = 0;
      let location = cust.usualLocations[0];
      let amount = 0;
      const patternTags: string[] = [];

      if (i % 30 === 0) {
        velocityLast10m = 12;
        isNewDevice = true;
        amount = Math.round(cust.averageAmount * 10 + 5000);
        patternTags.push('High Velocity');
      } else if (i % 20 === 0) {
        location = 'London (Proxy)';
        isNewDevice = true;
        amount = Math.round(cust.averageAmount * 8 + 8000);
        patternTags.push('Location Anomaly');
      } else if (i % 15 === 0) {
        failedAttempts = 4;
        amount = Math.round(merch.averageAmount * 1.5);
        isNewMerchant = true;
        patternTags.push('Repeated Failed Attempts');
      } else {
        amount = Math.round(cust.averageAmount * (0.6 + Math.random() * 0.8));
      }

      const evaluation = evaluateTransactionRisk({
        amount,
        customerId: cust.id,
        merchantId: merch.id,
        location,
        previousLocation: cust.usualLocations[0],
        isNewDevice,
        isNewMerchant,
        velocityLast10m,
        failedAttemptsLast24h: failedAttempts,
        customerBaseline: cust,
        merchantBaseline: merch,
      });

      this.transactions.push({
        id: `TXN-${10235 + i}`,
        amount,
        currency: 'INR',
        timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString(),
        customerId: cust.id,
        customerName: cust.name,
        merchantId: merch.id,
        merchantName: merch.name,
        merchantCategory: merch.category,
        paymentMethod: i % 2 === 0 ? 'UPI' : 'Credit Card',
        location,
        previousLocation: cust.usualLocations[0],
        ipAddress: `122.172.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        deviceId: `DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        deviceType: i % 3 === 0 ? 'Android' : 'iOS',
        isNewDevice,
        isNewMerchant,
        failedAttemptsLast24h: failedAttempts,
        velocityLast10m,
        velocityLast1h: velocityLast10m + 1,
        timeSinceLastTxnMinutes: 10,
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

    // Fraud patterns
    this.fraudPatterns = [
      {
        id: 'PAT-VELOCITY-01',
        name: 'High Transaction Velocity Burst',
        code: 'VELOCITY_BURST',
        description: 'Multiple automated rapid-fire transactions from identical hardware/IP in short time window.',
        exampleScenario: '42 transactions from same device within 5 minutes.',
        severity: 'CRITICAL',
        affectedTxnCount: 42,
        totalExposure: 1845000,
        transactionIds: ['TXN-10234'],
        recommendation: 'Enforce rate-limiting on device ID and apply mandatory SMS OTP on velocity > 5 txns/10m.',
      },
      {
        id: 'PAT-DEVICE-02',
        name: 'New Device + High-Ticket Payment',
        code: 'NEW_DEVICE_HIGH_TICKET',
        description: 'High-value purchases initiated immediately upon first login from unrecognized hardware signature.',
        exampleScenario: '18 high-value payments originated from previously unseen devices.',
        severity: 'HIGH',
        affectedTxnCount: 18,
        totalExposure: 2460000,
        transactionIds: ['TXN-10234'],
        recommendation: 'Place high-value orders from new devices on 15-minute verification hold.',
      },
    ];

    // Seed initial investigations
    this.investigations = [
      {
        id: 'CASE-8801',
        transactionId: 'TXN-10234',
        customerId: 'CUST-102',
        customerName: 'Aarav Sharma',
        merchantId: 'MERCH-501',
        merchantName: 'Nova Electronics Hub',
        amount: 75000,
        riskScore: 92,
        riskLevel: 'CRITICAL',
        status: 'OPEN',
        priority: 'CRITICAL',
        assignee: 'Sanjay Deshmukh',
        openedAt: new Date(Date.now() - 10 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
        summary: 'High-risk account takeover alert: ₹75,000 electronics payment from new Windows machine.',
        aiExplanation: eval10234.explanation,
        notes: [
          {
            id: 'NOTE-1',
            author: 'RiskGuard AI System',
            text: 'Case automatically opened due to Risk Score (92) exceeding Critical Threshold (>80).',
            timestamp: new Date().toISOString(),
          },
        ],
        tags: ['Account Takeover', 'High Velocity', 'Electronics'],
      },
    ];
  }

  public getTransactions(filters?: any): Transaction[] {
    let list = [...this.transactions];
    if (filters?.decision && filters.decision !== 'ALL') {
      list = list.filter((t) => t.finalDecision === filters.decision);
    }
    if (filters?.riskLevel && filters.riskLevel !== 'ALL') {
      list = list.filter((t) => t.riskLevel === filters.riskLevel);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.merchantName.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }

  public overrideTransaction(
    id: string,
    analystDecision: DecisionType,
    analystName: string,
    reason: string,
    notes?: string
  ): Transaction | null {
    const txn = this.transactions.find((t) => t.id === id);
    if (!txn) return null;

    txn.finalDecision = analystDecision;
    txn.isOverridden = true;
    txn.overrideDetails = {
      originalDecision: txn.aiDecision,
      analystDecision,
      analystName,
      reason,
      notes,
      timestamp: new Date().toISOString(),
    };
    return txn;
  }

  public injectTransaction(payload: SimulationPayload): Transaction {
    const evaluation = evaluateSimulation(payload, this.weights, this.thresholds);
    const newTxnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTxn: Transaction = {
      id: newTxnId,
      amount: payload.amount,
      currency: 'INR',
      timestamp: new Date().toISOString(),
      customerId: payload.customerId,
      customerName: `Customer #${payload.customerId.replace('CUST-', '')}`,
      merchantId: payload.merchantId,
      merchantName: `Merchant #${payload.merchantId.replace('MERCH-', '')}`,
      merchantCategory: 'General Retail',
      paymentMethod: payload.paymentMethod,
      location: payload.location,
      previousLocation: payload.previousLocation,
      ipAddress: '185.220.101.99',
      deviceId: `DEV-SIM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      deviceType: payload.deviceType,
      isNewDevice: payload.isNewDevice,
      isNewMerchant: payload.isNewMerchant,
      failedAttemptsLast24h: payload.failedAttemptsLast24h,
      velocityLast10m: payload.velocityLast10m,
      velocityLast1h: payload.velocityLast10m + 2,
      timeSinceLastTxnMinutes: 1,
      riskScore: evaluation.riskScore,
      riskLevel: evaluation.riskLevel,
      aiDecision: evaluation.decision,
      finalDecision: evaluation.decision,
      isOverridden: false,
      riskFactors: evaluation.riskFactors,
      explanation: evaluation.explanation,
      patternTags: evaluation.riskScore >= 80 ? ['Simulated Injection', 'High Risk'] : ['Simulated Injection'],
    };

    this.transactions.unshift(newTxn);

    if (evaluation.riskScore >= 80) {
      this.investigations.unshift({
        id: `CASE-${Math.floor(8800 + Math.random() * 1100)}`,
        transactionId: newTxn.id,
        customerId: newTxn.customerId,
        customerName: newTxn.customerName,
        merchantId: newTxn.merchantId,
        merchantName: newTxn.merchantName,
        amount: newTxn.amount,
        riskScore: newTxn.riskScore,
        riskLevel: newTxn.riskLevel,
        status: 'OPEN',
        priority: 'CRITICAL',
        assignee: 'Unassigned',
        openedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        summary: `Auto-created case for simulated high-risk txn ${newTxn.id} (Score: ${newTxn.riskScore}).`,
        aiExplanation: newTxn.explanation,
        notes: [],
        tags: ['Simulated Injection'],
      });
    }

    return newTxn;
  }

  public updateInvestigation(caseId: string, status: InvestigationStatus, noteText?: string): InvestigationCase | null {
    const c = this.investigations.find((item) => item.id === caseId);
    if (!c) return null;

    c.status = status;
    c.updatedAt = new Date().toISOString();
    if (noteText) {
      c.notes.push({
        id: `NOTE-${Date.now()}`,
        author: 'Risk Analyst',
        text: noteText,
        timestamp: new Date().toISOString(),
      });
    }
    return c;
  }

  public getMetrics() {
    const highRiskCount = this.transactions.filter((t) => t.riskScore >= 61).length;
    const fraudCount = this.investigations.filter((i) => i.status === 'CONFIRMED_FRAUD').length +
      this.transactions.filter((t) => t.finalDecision === 'BLOCK').length;
    const amountAtRiskSum = this.transactions
      .filter((t) => t.finalDecision === 'BLOCK' || t.finalDecision === 'HOLD')
      .reduce((acc, t) => acc + t.amount, 0);
    const avgScore = Math.round(
      (this.transactions.reduce((acc, t) => acc + t.riskScore, 0) / Math.max(this.transactions.length, 1)) * 10
    ) / 10;

    return {
      totalTransactions: 128492 + this.transactions.length,
      highRiskTransactions: highRiskCount + 1240,
      fraudDetected: fraudCount + 338,
      amountAtRisk: amountAtRiskSum + 4200000,
      falsePositiveRate: 3.8,
      averageRiskScore: avgScore,
    };
  }
}

export const dataStore = new DataStoreService();
