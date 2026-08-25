from sqlalchemy import Column, String, Float, Integer, Boolean, JSON, DateTime
from datetime import datetime
from ..core.database import Base

class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    customerId = Column(String, index=True, nullable=False)
    customerName = Column(String, nullable=False)
    merchantId = Column(String, index=True, nullable=False)
    merchantName = Column(String, nullable=False)
    merchantCategory = Column(String, nullable=False)
    paymentMethod = Column(String, nullable=False)
    
    location = Column(String, nullable=False)
    previousLocation = Column(String, nullable=True)
    ipAddress = Column(String, nullable=False)
    deviceId = Column(String, nullable=False)
    deviceType = Column(String, nullable=False)
    isNewDevice = Column(Boolean, default=False)
    isNewMerchant = Column(Boolean, default=False)
    
    failedAttemptsLast24h = Column(Integer, default=0)
    velocityLast10m = Column(Integer, default=1)
    velocityLast1h = Column(Integer, default=1)
    timeSinceLastTxnMinutes = Column(Integer, default=1)
    
    riskScore = Column(Float, nullable=False, index=True)
    riskLevel = Column(String, nullable=False)
    aiDecision = Column(String, nullable=False)
    finalDecision = Column(String, nullable=False, index=True)
    isOverridden = Column(Boolean, default=False)
    overrideDetails = Column(JSON, nullable=True)
    
    riskFactors = Column(JSON, default=[])
    explanation = Column(String, nullable=False)
    patternTags = Column(JSON, default=[])
    investigationId = Column(String, nullable=True)
