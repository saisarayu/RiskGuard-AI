from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ...core.database import get_db
from ...models.investigation import InvestigationModel
from ...schemas.common import InvestigationSchema, UpdateInvestigationRequest

router = APIRouter(prefix="/investigations", tags=["Investigations"])

@router.get("", response_model=List[InvestigationSchema])
def list_investigations(db: Session = Depends(get_db)):
    return db.query(InvestigationModel).order_by(InvestigationModel.openedAt.desc()).all()

@router.patch("/{case_id}", response_model=InvestigationSchema)
def update_investigation(case_id: str, body: UpdateInvestigationRequest, db: Session = Depends(get_db)):
    c = db.query(InvestigationModel).filter(InvestigationModel.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")

    c.status = body.status
    c.updatedAt = datetime.utcnow()

    if body.note:
        notes_list = list(c.notes or [])
        notes_list.append({
            "id": f"NOTE-{datetime.utcnow().timestamp()}",
            "author": "Risk Analyst",
            "text": body.note,
            "timestamp": datetime.utcnow().isoformat()
        })
        c.notes = notes_list

    db.commit()
    db.refresh(c)
    return c
