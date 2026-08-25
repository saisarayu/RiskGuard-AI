from pydantic import BaseModel, Field
from typing import List, Optional, Tuple, Dict, Any

class RiskFactorSchema(BaseModel):
    code: str
    name: str
    contribution: int
    description: str
    category: str
    severity: str

class RiskEvaluationInput(BaseModel):
    amount: float
    customerId: str
    merchantId: str
    merchantCategory: Optional[str] = "General"
    location: str
    previousLocation: Optional[str] = None
    isNewDevice: bool = False
    isNewMerchant: bool = False
    velocityLast10m: int = 1
    failedAttemptsLast24h: int = 0
    accountAgeDays: Optional[int] = 365
    timeOfDayHour: Optional[int] = 14
    averageCustomerTransaction: Optional[float] = 2500.0

class CustomerBaselineSchema(BaseModel):
    averageAmount: float
    typicalRange: List[float]
    usualLocation: str
    usualDevice: str
    typicalDailyTxn: int

class RiskMetricsSchema(BaseModel):
    amountRatio: float
    velocityLast10m: int
    isNewDevice: bool
    isLocationAnomaly: bool
    failedAttempts: int
    isNewMerchant: bool
    mlPredictionProbability: Optional[float] = None

class RiskScoreResultSchema(BaseModel):
    riskScore: float
    riskLevel: str
    decision: str
    riskFactors: List[RiskFactorSchema]
    explanation: str
    customerBaseline: CustomerBaselineSchema
    metrics: RiskMetricsSchema
    modelType: str = "Hybrid Scikit-Learn Random Forest + Rule Attribution Engine"

class SimulationPayloadSchema(BaseModel):
    amount: float
    customerId: str
    merchantId: str
    deviceType: str
    isNewDevice: bool
    location: str
    previousLocation: str
    velocityLast10m: int
    averageCustomerTransaction: float
    isNewMerchant: bool
    failedAttemptsLast24h: int
    accountAgeDays: int
    timeOfDay: str
    paymentMethod: str
