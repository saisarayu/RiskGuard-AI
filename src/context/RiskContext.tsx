import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Transaction,
  Customer,
  Merchant,
  InvestigationCase,
  FraudPatternGroup,
  DecisionType,
  InvestigationStatus,
  EngineThresholds,
  EngineWeights,
  SimulationPayload,
} from '../types';
import { generateSyntheticDataset } from '../data/mockDataGenerator';
import {
  DEFAULT_THRESHOLDS,
  DEFAULT_WEIGHTS,
  evaluateTransactionRisk,
  evaluateSimulation,
} from '../engine/riskEngine';

interface ToastNotification {
  id: string;
  title: string;
  desc: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface RiskContextType {
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
  thresholds: EngineThresholds;
  weights: EngineWeights;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (txn: Transaction | null) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  selectedMerchant: Merchant | null;
  setSelectedMerchant: (merch: Merchant | null) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  copilotInitialPrompt: string;
  setCopilotInitialPrompt: (p: string) => void;
  toast: ToastNotification | null;
  showToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  overrideTransactionDecision: (
    txnId: string,
    newDecision: DecisionType,
    analystName: string,
    reason: string,
    notes?: string
  ) => void;
  injectSimulatedTransaction: (payload: SimulationPayload) => Transaction;
  updateInvestigationStatus: (caseId: string, newStatus: InvestigationStatus, noteText?: string) => void;
  addInvestigationCase: (txn: Transaction, initialNote?: string) => string;
  updateThresholds: (newThresholds: Partial<EngineThresholds>) => void;
  updateWeights: (newWeights: Partial<EngineWeights>) => void;
  triggerCopilotWithPrompt: (prompt: string) => void;
  resetAllData: () => void;
}

const RiskContext = createContext<RiskContextType | undefined>(undefined);

export const RiskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialData] = useState(() => generateSyntheticDataset());
  const [transactions, setTransactions] = useState<Transaction[]>(initialData.transactions);
  const [customers, setCustomers] = useState<Customer[]>(initialData.customers);
  const [merchants, setMerchants] = useState<Merchant[]>(initialData.merchants);
  const [investigations, setInvestigations] = useState<InvestigationCase[]>(initialData.investigations);
  const [fraudPatterns, setFraudPatterns] = useState<FraudPatternGroup[]>(initialData.fraudPatterns);
  const [kpis, setKpis] = useState(initialData.kpis);

  const [thresholds, setThresholds] = useState<EngineThresholds>(DEFAULT_THRESHOLDS);
  const [weights, setWeights] = useState<EngineWeights>(DEFAULT_WEIGHTS);

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, title, desc, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  };

  const triggerCopilotWithPrompt = (prompt: string) => {
    setCopilotInitialPrompt(prompt);
    setIsCopilotOpen(true);
  };

  // Recalculate dynamic KPIs when transactions or investigations change
  useEffect(() => {
    const highRiskCount = transactions.filter((t) => t.riskScore >= 61).length;
    const fraudCount = investigations.filter((i) => i.status === 'CONFIRMED_FRAUD').length + 
      transactions.filter((t) => t.finalDecision === 'BLOCK').length;
    const amountAtRiskSum = transactions
      .filter((t) => t.finalDecision === 'BLOCK' || t.finalDecision === 'HOLD')
      .reduce((acc, t) => acc + t.amount, 0);
    const avgScore = Math.round(
      (transactions.reduce((acc, t) => acc + t.riskScore, 0) / Math.max(transactions.length, 1)) * 10
    ) / 10;

    setKpis((prev) => ({
      ...prev,
      highRiskTransactions: highRiskCount + 1240, // Base scale
      fraudDetected: fraudCount + 338,
      amountAtRisk: amountAtRiskSum + 4200000,
      averageRiskScore: avgScore,
    }));
  }, [transactions, investigations]);

  // Override Transaction Decision
  const overrideTransactionDecision = (
    txnId: string,
    newDecision: DecisionType,
    analystName: string,
    reason: string,
    notes?: string
  ) => {
    setTransactions((prev) =>
      prev.map((txn) => {
        if (txn.id === txnId) {
          const updated: Transaction = {
            ...txn,
            finalDecision: newDecision,
            isOverridden: true,
            overrideDetails: {
              originalDecision: txn.aiDecision,
              analystDecision: newDecision,
              analystName: analystName || 'Lead Risk Analyst',
              reason: reason || 'Manual risk adjustment upon analyst inspection.',
              notes,
              timestamp: new Date().toISOString(),
            },
          };
          if (selectedTransaction?.id === txnId) {
            setSelectedTransaction(updated);
          }
          return updated;
        }
        return txn;
      })
    );

    showToast(
      'Analyst Override Applied',
      `Transaction ${txnId} decision updated to ${newDecision}. Audit log recorded.`,
      'success'
    );
  };

  // Inject Simulated Transaction into Live Stream
  const injectSimulatedTransaction = (payload: SimulationPayload): Transaction => {
    const evaluation = evaluateSimulation(payload, weights, thresholds);
    const cust = customers.find((c) => c.id === payload.customerId) || {
      id: payload.customerId,
      name: `Customer #${payload.customerId.replace('CUST-', '')}`,
    };
    const merch = merchants.find((m) => m.id === payload.merchantId) || {
      id: payload.merchantId,
      name: `Merchant #${payload.merchantId.replace('MERCH-', '')}`,
      category: 'General Commerce',
    };

    const newTxnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTxn: Transaction = {
      id: newTxnId,
      amount: payload.amount,
      currency: 'INR',
      timestamp: new Date().toISOString(),
      customerId: payload.customerId,
      customerName: cust.name,
      merchantId: payload.merchantId,
      merchantName: merch.name,
      merchantCategory: (merch as Merchant).category || 'General Commerce',
      paymentMethod: payload.paymentMethod,
      location: payload.location,
      previousLocation: payload.previousLocation,
      ipAddress: '142.250.190.46',
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
      patternTags:
        evaluation.riskScore >= 80
          ? ['Simulated Injection', 'High Risk Anomaly']
          : ['Simulated Injection'],
    };

    // Prepend to transaction list
    setTransactions((prev) => [newTxn, ...prev]);

    // If High/Critical risk, auto-open an investigation case
    if (evaluation.riskScore >= 80) {
      addInvestigationCase(
        newTxn,
        `Auto-created investigation for simulated high-risk transaction ${newTxnId} with score ${evaluation.riskScore}/100.`
      );
    }

    showToast(
      'Transaction Simulated & Ingested',
      `${newTxnId} evaluated: Score ${evaluation.riskScore}/100 → Recommended ${evaluation.decision}.`,
      evaluation.decision === 'BLOCK' ? 'error' : evaluation.decision === 'APPROVE' ? 'success' : 'warning'
    );

    return newTxn;
  };

  // Add an Investigation Case
  const addInvestigationCase = (txn: Transaction, initialNote?: string): string => {
    const caseId = `CASE-${Math.floor(8800 + Math.random() * 1100)}`;
    const newCase: InvestigationCase = {
      id: caseId,
      transactionId: txn.id,
      customerId: txn.customerId,
      customerName: txn.customerName,
      merchantId: txn.merchantId,
      merchantName: txn.merchantName,
      amount: txn.amount,
      riskScore: txn.riskScore,
      riskLevel: txn.riskLevel,
      status: 'OPEN',
      priority: txn.riskScore > 85 ? 'CRITICAL' : txn.riskScore > 65 ? 'HIGH' : 'MEDIUM',
      assignee: 'Unassigned',
      openedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary: `Automated risk triage for ${txn.id} (₹${txn.amount.toLocaleString('en-IN')}) at ${txn.merchantName}.`,
      aiExplanation: txn.explanation,
      notes: initialNote
        ? [
            {
              id: 'NOTE-INIT',
              author: 'RiskGuard Risk Engine',
              text: initialNote,
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
      tags: txn.patternTags || ['Anomaly Review'],
    };

    setInvestigations((prev) => [newCase, ...prev]);
    return caseId;
  };

  // Update Investigation Status
  const updateInvestigationStatus = (
    caseId: string,
    newStatus: InvestigationStatus,
    noteText?: string
  ) => {
    setInvestigations((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const notes = [...c.notes];
          if (noteText) {
            notes.push({
              id: `NOTE-${Date.now()}`,
              author: 'Sanjay Deshmukh (Risk Analyst)',
              text: noteText,
              timestamp: new Date().toISOString(),
            });
          }
          return {
            ...c,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            notes,
          };
        }
        return c;
      })
    );

    showToast(
      'Investigation Updated',
      `Case ${caseId} moved to ${newStatus.replace('_', ' ')}.`,
      'info'
    );
  };

  // Update Thresholds
  const updateThresholds = (newThresholds: Partial<EngineThresholds>) => {
    setThresholds((prev) => {
      const merged = { ...prev, ...newThresholds };
      showToast('Engine Thresholds Updated', 'Transaction decision boundary rules updated.', 'success');
      return merged;
    });
  };

  // Update Weights
  const updateWeights = (newWeights: Partial<EngineWeights>) => {
    setWeights((prev) => {
      const merged = { ...prev, ...newWeights };
      showToast('Risk Factor Weights Updated', 'AI factor scoring multipliers calibrated.', 'success');
      return merged;
    });
  };

  // Reset to initial
  const resetAllData = () => {
    const fresh = generateSyntheticDataset();
    setTransactions(fresh.transactions);
    setCustomers(fresh.customers);
    setMerchants(fresh.merchants);
    setInvestigations(fresh.investigations);
    setFraudPatterns(fresh.fraudPatterns);
    setKpis(fresh.kpis);
    setThresholds(DEFAULT_THRESHOLDS);
    setWeights(DEFAULT_WEIGHTS);
    showToast('Data Reset', 'All transactions and states restored to default dataset.', 'info');
  };

  return (
    <RiskContext.Provider
      value={{
        transactions,
        customers,
        merchants,
        investigations,
        fraudPatterns,
        kpis,
        thresholds,
        weights,
        activeTab,
        setActiveTab,
        selectedTransaction,
        setSelectedTransaction,
        selectedCustomer,
        setSelectedCustomer,
        selectedMerchant,
        setSelectedMerchant,
        isCopilotOpen,
        setIsCopilotOpen,
        searchQuery,
        setSearchQuery,
        copilotInitialPrompt,
        setCopilotInitialPrompt,
        toast,
        showToast,
        overrideTransactionDecision,
        injectSimulatedTransaction,
        updateInvestigationStatus,
        addInvestigationCase,
        updateThresholds,
        updateWeights,
        triggerCopilotWithPrompt,
        resetAllData,
      }}
    >
      {children}
    </RiskContext.Provider>
  );
};

export const useRisk = () => {
  const context = useContext(RiskContext);
  if (!context) {
    throw new Error('useRisk must be used within a RiskProvider');
  }
  return context;
};
