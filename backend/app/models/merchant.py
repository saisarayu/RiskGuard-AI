from sqlalchemy import Column, String, Float, Integer, Boolean
from ..core.database import Base

class MerchantModel(Base):
    __tablename__ = "merchants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    totalTransactions = Column(Integer, default=0)
    totalVolume = Column(Float, default=0.0)
    averageAmount = Column(Float, default=0.0)
    refundRate = Column(Float, default=1.0)
    chargebackRate = Column(Float, default=0.1)
    fraudRate = Column(Float, default=0.5)
    riskScore = Column(Float, default=20.0)
    riskLevel = Column(String, default="LOW")
    isSuspicious = Column(Boolean, default=False)
    joinedDate = Column(String, nullable=True)
    location = Column(String, default="Pan India")
