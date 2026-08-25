import {
  Transaction,
  Customer,
  Merchant,
  InvestigationCase,
  FraudPatternGroup,
  DecisionType,
  InvestigationStatus,
  SimulationPayload,
  RiskScoreResult,
} from '../types';

const API_BASE_URL = '/api/v1';

export class RiskApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP error ${response.status}`);
    }
    return response.json();
  }

  // Health check
  public static async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/health');
      return res.ok;
    } catch {
      return false;
    }
  }

  // Risk evaluation & simulation
  public static async evaluateRisk(input: any): Promise<RiskScoreResult> {
    return this.request<RiskScoreResult>('/risk/evaluate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  public static async simulateTransaction(payload: SimulationPayload): Promise<RiskScoreResult> {
    return this.request<RiskScoreResult>('/risk/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Transactions
  public static async getTransactions(params?: { decision?: string; riskLevel?: string; search?: string }): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (params?.decision && params.decision !== 'ALL') query.append('decision', params.decision);
    if (params?.riskLevel && params.riskLevel !== 'ALL') query.append('riskLevel', params.riskLevel);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<Transaction[]>(`/transactions${queryString}`);
  }

  public static async getTransactionById(id: string): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`);
  }

  public static async overrideTransaction(
    id: string,
    analystDecision: DecisionType,
    analystName: string,
    reason: string,
    notes?: string
  ): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}/override`, {
      method: 'POST',
      body: JSON.stringify({ analystDecision, analystName, reason, notes }),
    });
  }

  public static async injectTransaction(payload: SimulationPayload): Promise<Transaction> {
    return this.request<Transaction>('/transactions/inject', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Customers
  public static async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/customers');
  }

  public static async getCustomerById(id: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  // Merchants
  public static async getMerchants(): Promise<Merchant[]> {
    return this.request<Merchant[]>('/merchants');
  }

  public static async getMerchantById(id: string): Promise<Merchant> {
    return this.request<Merchant>(`/merchants/${id}`);
  }

  // Patterns
  public static async getPatterns(): Promise<FraudPatternGroup[]> {
    return this.request<FraudPatternGroup[]>('/patterns');
  }

  // Investigations
  public static async getInvestigations(): Promise<InvestigationCase[]> {
    return this.request<InvestigationCase[]>('/investigations');
  }

  public static async updateInvestigation(caseId: string, status: InvestigationStatus, note?: string): Promise<InvestigationCase> {
    return this.request<InvestigationCase>(`/investigations/${caseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  // Copilot query
  public static async queryCopilot(query: string, context?: any): Promise<{ answer: string; timestamp: string }> {
    return this.request<{ answer: string; timestamp: string }>('/copilot/query', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });
  }

  // Telemetry metrics
  public static async getMetrics(): Promise<any> {
    return this.request<any>('/metrics');
  }
}
