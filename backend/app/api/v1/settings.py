from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/settings", tags=["Engine Settings"])

# In-memory settings state
CONFIG_STATE = {
    "thresholds": {
        "approveMax": 30,
        "verifyMax": 60,
        "holdMax": 80,
        "blockMin": 81,
    },
    "weights": {
        "amountDeviationWeight": 22,
        "newDeviceWeight": 18,
        "locationMismatchWeight": 15,
        "velocityWeight": 20,
        "failedAttemptsWeight": 16,
        "newMerchantWeight": 10,
        "highRiskCategoryWeight": 12,
        "timeAnomalyWeight": 8,
    }
}

class SettingsUpdateRequest(BaseModel):
    thresholds: Dict[str, int] = None
    weights: Dict[str, int] = None

@router.get("")
def get_settings():
    return {"success": True, "data": CONFIG_STATE}

@router.put("")
def update_settings(body: SettingsUpdateRequest):
    if body.thresholds:
        CONFIG_STATE["thresholds"].update(body.thresholds)
    if body.weights:
        CONFIG_STATE["weights"].update(body.weights)
    return {"success": True, "data": CONFIG_STATE}
