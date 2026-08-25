from sqlalchemy import Column, String, Float, Integer, JSON, DateTime
from datetime import datetime
from ..core.database import Base

class CustomerModel(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    accountAgeDays = Column(Integer, default=30)
    totalTransactions = Column(Integer, default=0)
    totalSpent = Column(Float, default=0.0)
    averageAmount = Column(Float, default=2500.0)
    typicalAmountRange = Column(JSON, default=[500, 5000])
    usualLocations = Column(JSON, default=["Hyderabad"])
    knownDevices = Column(JSON, default=["Android Phone"])
    typicalTxnPerDay = Column(Integer, default=3)
    riskScore = Column(Float, default=15.0)
    riskLevel = Column(String, default="LOW")
    suspiciousTxnCount = Column(Integer, default=0)
    blockedTxnCount = Column(Integer, default=0)
    createdAt = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="ACTIVE")
