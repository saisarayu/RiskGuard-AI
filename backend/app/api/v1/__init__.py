from fastapi import APIRouter
from .risk import router as risk_router
from .transactions import router as transactions_router
from .customers import router as customers_router
from .merchants import router as merchants_router
from .patterns import router as patterns_router
from .investigations import router as investigations_router
from .copilot import router as copilot_router
from .metrics import router as metrics_router
from .settings import router as settings_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(risk_router)
api_v1_router.include_router(transactions_router)
api_v1_router.include_router(customers_router)
api_v1_router.include_router(merchants_router)
api_v1_router.include_router(patterns_router)
api_v1_router.include_router(investigations_router)
api_v1_router.include_router(copilot_router)
api_v1_router.include_router(metrics_router)
api_v1_router.include_router(settings_router)

__all__ = ["api_v1_router"]
