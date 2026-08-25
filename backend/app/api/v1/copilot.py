from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from ...core.database import get_db
from ...schemas.common import CopilotQueryRequest, CopilotQueryResponse
from ...services.gemini_copilot import gemini_copilot

router = APIRouter(prefix="/copilot", tags=["AI Copilot Assistant"])

@router.post("/query", response_model=CopilotQueryResponse)
def query_copilot(req: CopilotQueryRequest, db: Session = Depends(get_db)):
    answer = gemini_copilot.query(req.query, db, req.context)
    return CopilotQueryResponse(
        answer=answer,
        timestamp=datetime.utcnow().isoformat(),
        source="Gemini-AI / Scikit-Learn Hybrid Pipeline"
    )
