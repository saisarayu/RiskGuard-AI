from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CustomerSchema(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    accountAgeDays: int
    totalTransactions: int
    totalSpent: float
    averageAmount: float
    typicalAmountRange: List[float]
    usualLocations: List[str]
    knownDevices: List[str]
    typicalTxnPerDay: int
    riskScore: float
    riskLevel: str
    suspiciousTxnCount: int
    blockedTxnCount: int
    createdAt: datetime
    status: str

    class Config:
        from_attributes = True

class MerchantSchema(BaseModel):
    id: str
    name: str
    category: str
    totalTransactions: int
    totalVolume: float
    averageAmount: float
    refundRate: float
    chargebackRate: float
    fraudRate: float
    riskScore: float
    riskLevel: str
    isSuspicious: bool
    joinedDate: Optional[str] = None
    location: str

    class Config:
        from_attributes = True

class NoteSchema(BaseModel):
    id: str
    author: str
    text: str
    timestamp: str

class InvestigationSchema(BaseModel):
    id: str
    transactionId: str
    customerId: str
    customerName: str
    merchantId: str
    merchantName: str
    amount: float
    riskScore: float
    riskLevel: str
    status: str
    priority: str
    assignee: str
    openedAt: datetime
    updatedAt: datetime
    summary: str
    aiExplanation: str
    notes: List[NoteSchema] = []
    tags: List[str] = []

    class Config:
        from_attributes = True

class UpdateInvestigationRequest(BaseModel):
    status: str
    note: Optional[str] = None

class PatternSchema(BaseModel):
    id: str
    name: str
    code: str
    description: str
    exampleScenario: str
    severity: str
    affectedTxnCount: int
    totalExposure: float
    transactionIds: List[str] = []
    recommendation: str

    class Config:
        from_attributes = True

class CopilotQueryRequest(BaseModel):
    query: str
    context: Optional[dict] = None

class CopilotQueryResponse(BaseModel):
    answer: str
    timestamp: str
    source: str = "Gemini-AI / RiskGuard Engine"

class MetricsResponse(BaseModel):
    totalTransactions: int
    highRiskTransactions: int
    fraudDetected: int
    amountAtRisk: float
    falsePositiveRate: float
    averageRiskScore: float
