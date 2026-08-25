import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine, Base, SessionLocal
from .services.synthetic_data import seed_database_if_empty
from .api.v1 import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables & seed data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
    print(f"[RiskGuard AI] FastAPI Server running on {settings.HOST}:{settings.PORT}")
    yield
    # Shutdown
    print("[RiskGuard AI] FastAPI Server shutting down")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Based Transaction Risk Scoring, Scikit-Learn ML Fraud Detection, and Explainable AI Decision Engine",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_v1_router)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "RiskGuard AI Backend",
        "engine": "FastAPI + Scikit-Learn + SQLAlchemy",
        "version": settings.VERSION
    }

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "RiskGuard AI — AI-Powered Payment Risk Management API",
        "docs": "/docs",
        "health": "/health",
        "api_v1": "/api/v1"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
