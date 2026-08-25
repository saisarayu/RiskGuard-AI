from fastapi import APIRouter, Depends
from ...schemas.risk import RiskEvaluationInput, RiskScoreResultSchema, SimulationPayloadSchema
from ...ml.risk_engine import risk_engine

router = APIRouter(prefix="/risk", tags=["Risk Scoring Engine"])

@router.post("/evaluate", response_model=RiskScoreResultSchema)
def evaluate_transaction(input_data: RiskEvaluationInput):
    """Evaluate multidimensional transaction risk via Scikit-Learn Hybrid Engine."""
    return risk_engine.evaluate(input_data)

@router.post("/simulate", response_model=RiskScoreResultSchema)
def simulate_transaction(payload: SimulationPayloadSchema):
    """Real-time parameter sandbox evaluation."""
    hour = int(payload.timeOfDay.split(":")[0]) if ":" in payload.timeOfDay else 14
    inp = RiskEvaluationInput(
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
    )
    return risk_engine.evaluate(inp)
