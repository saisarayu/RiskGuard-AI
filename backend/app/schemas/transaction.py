from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime
from .risk import RiskFactorSchema

class AnalystOverrideSchema(BaseModel):
    originalDecision: str
    analystDecision: str
    analystName: str
    reason: str
    notes: Optional[str] = None
    timestamp: str

class OverrideRequest(BaseModel):
    analystDecision: str
    analystName: str
    reason: str
    notes: Optional[str] = None

class TransactionSchema(BaseModel):
    id: str
    amount: float
    currency: str = "INR"
    timestamp: datetime
    customerId: str
    customerName: str
    merchantId: str
    merchantName: str
    merchantCategory: str
    paymentMethod: str
    location: str
    previousLocation: Optional[str] = None
    ipAddress: str
    deviceId: str
    deviceType: str
    isNewDevice: bool
    isNewMerchant: bool
    failedAttemptsLast24h: int
    velocityLast10m: int
    velocityLast1h: int
    timeSinceLastTxnMinutes: int
    riskScore: float
    riskLevel: str
    aiDecision: str
    finalDecision: str
    isOverridden: bool = False
    overrideDetails: Optional[Dict[str, Any]] = None
    riskFactors: List[RiskFactorSchema] = []
    explanation: str
    patternTags: Optional[List[str]] = []
    investigationId: Optional[str] = None

    class Config:
        from_attributes = True
