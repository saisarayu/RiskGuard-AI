from sqlalchemy import Column, String, Float, Integer, JSON
from ..core.database import Base

class PatternModel(Base):
    __tablename__ = "fraud_patterns"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    description = Column(String, nullable=False)
    exampleScenario = Column(String, nullable=False)
    severity = Column(String, default="HIGH")
    affectedTxnCount = Column(Integer, default=0)
    totalExposure = Column(Float, default=0.0)
    transactionIds = Column(JSON, default=[])
    recommendation = Column(String, nullable=False)
