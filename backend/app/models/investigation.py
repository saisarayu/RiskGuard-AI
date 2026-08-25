from sqlalchemy import Column, String, Float, JSON, DateTime
from datetime import datetime
from ..core.database import Base

class InvestigationModel(Base):
    __tablename__ = "investigations"

    id = Column(String, primary_key=True, index=True)
    transactionId = Column(String, index=True, nullable=False)
    customerId = Column(String, nullable=False)
    customerName = Column(String, nullable=False)
    merchantId = Column(String, nullable=False)
    merchantName = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    riskScore = Column(Float, nullable=False)
    riskLevel = Column(String, nullable=False)
    status = Column(String, default="OPEN", index=True)
    priority = Column(String, default="HIGH")
    assignee = Column(String, default="Unassigned")
    openedAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    summary = Column(String, nullable=False)
    aiExplanation = Column(String, nullable=False)
    notes = Column(JSON, default=[])
    tags = Column(JSON, default=[])
