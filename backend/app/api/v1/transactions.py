from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random
from ...core.database import get_db
from ...models.transaction import TransactionModel
from ...models.customer import CustomerModel
from ...models.merchant import MerchantModel
from ...models.investigation import InvestigationModel
from ...schemas.transaction import TransactionSchema, OverrideRequest
from ...schemas.risk import SimulationPayloadSchema
from ...ml.risk_engine import risk_engine, RiskEvaluationInput

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionSchema])
def list_transactions(
    decision: Optional[str] = Query("ALL"),
    riskLevel: Optional[str] = Query("ALL"),
    search: Optional[str] = Query(None),
    limit: int = Query(200, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    query = db.query(TransactionModel)
    if decision and decision != "ALL":
        query = query.filter(TransactionModel.finalDecision == decision)
    if riskLevel and riskLevel != "ALL":
        query = query.filter(TransactionModel.riskLevel == riskLevel)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (TransactionModel.id.ilike(s)) |
            (TransactionModel.customerName.ilike(s)) |
            (TransactionModel.merchantName.ilike(s)) |
            (TransactionModel.location.ilike(s))
        )
    return query.order_by(TransactionModel.timestamp.desc()).offset(offset).limit(limit).all()

@router.get("/{txn_id}", response_model=TransactionSchema)
def get_transaction(txn_id: str, db: Session = Depends(get_db)):
    txn = db.query(TransactionModel).filter(TransactionModel.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn

@router.post("/{txn_id}/override", response_model=TransactionSchema)
def override_transaction(txn_id: str, body: OverrideRequest, db: Session = Depends(get_db)):
    txn = db.query(TransactionModel).filter(TransactionModel.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    txn.finalDecision = body.analystDecision
    txn.isOverridden = True
    txn.overrideDetails = {
        "originalDecision": txn.aiDecision,
        "analystDecision": body.analystDecision,
        "analystName": body.analystName,
        "reason": body.reason,
        "notes": body.notes,
        "timestamp": datetime.utcnow().isoformat()
    }
    db.commit()
    db.refresh(txn)
    return txn

@router.post("/inject", response_model=TransactionSchema, status_code=201)
def inject_simulated_transaction(payload: SimulationPayloadSchema, db: Session = Depends(get_db)):
    hour = int(payload.timeOfDay.split(":")[0]) if ":" in payload.timeOfDay else 14
    evaluation = risk_engine.evaluate(RiskEvaluationInput(
        amount=payload.amount,
        customerId=payload.customerId,
        merchantId=payload.merchantId,
        location=payload.location,
        previousLocation=payload.previousLocation,
        isNewDevice=payload.isNewDevice,
        isNewMerchant=payload.isNewMerchant,
        velocityLast10m=payload.velocityLast10m,
        failedAttemptsLast24h=payload.failedAttemptsLast24h,
        accountAgeDays=payload.accountAgeDays,
        timeOfDayHour=hour,
        averageCustomerTransaction=payload.averageCustomerTransaction
    ))

    cust = db.query(CustomerModel).filter(CustomerModel.id == payload.customerId).first()
    merch = db.query(MerchantModel).filter(MerchantModel.id == payload.merchantId).first()

    new_id = f"TXN-{random.randint(10000, 99999)}"
    new_txn = TransactionModel(
        id=new_id,
        amount=payload.amount,
        currency="INR",
        timestamp=datetime.utcnow(),
        customerId=payload.customerId,
        customerName=cust.name if cust else f"Customer #{payload.customerId.replace('CUST-', '')}",
        merchantId=payload.merchantId,
        merchantName=merch.name if merch else f"Merchant #{payload.merchantId.replace('MERCH-', '')}",
        merchantCategory=merch.category if merch else "General Retail",
        paymentMethod=payload.paymentMethod,
        location=payload.location,
        previousLocation=payload.previousLocation,
        ipAddress="185.220.101.99",
        deviceId=f"DEV-SIM-{hex(random.randint(1000, 9999))[2:].upper()}",
        deviceType=payload.deviceType,
        isNewDevice=payload.isNewDevice,
        isNewMerchant=payload.isNewMerchant,
        failedAttemptsLast24h=payload.failedAttemptsLast24h,
        velocityLast10m=payload.velocityLast10m,
        velocityLast1h=payload.velocityLast10m + 2,
        timeSinceLastTxnMinutes=1,
        riskScore=evaluation.riskScore,
        riskLevel=evaluation.riskLevel,
        aiDecision=evaluation.decision,
        finalDecision=evaluation.decision,
        isOverridden=False,
        riskFactors=[f.model_dump() for f in evaluation.riskFactors],
        explanation=evaluation.explanation,
        patternTags=["Simulated Injection", "High Risk"] if evaluation.riskScore >= 80 else ["Simulated Injection"]
    )
    db.add(new_txn)

    # Auto-create investigation for high-risk injection
    if evaluation.riskScore >= 80:
        db.add(InvestigationModel(
            id=f"CASE-{random.randint(8800, 9900)}",
            transactionId=new_id,
            customerId=new_txn.customerId,
            customerName=new_txn.customerName,
            merchantId=new_txn.merchantId,
            merchantName=new_txn.merchantName,
            amount=new_txn.amount,
            riskScore=new_txn.riskScore,
            riskLevel=new_txn.riskLevel,
            status="OPEN",
            priority="CRITICAL",
            assignee="Unassigned",
            openedAt=datetime.utcnow(),
            updatedAt=datetime.utcnow(),
            summary=f"Simulated anomaly alert for {new_id} (₹{new_txn.amount:,.0f}).",
            aiExplanation=new_txn.explanation,
            notes=[],
            tags=["Simulated Injection"]
        ))

    db.commit()
    db.refresh(new_txn)
    return new_txn
