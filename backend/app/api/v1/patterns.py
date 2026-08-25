from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.pattern import PatternModel
from ...schemas.common import PatternSchema

router = APIRouter(prefix="/patterns", tags=["Fraud Patterns"])

@router.get("", response_model=List[PatternSchema])
def list_patterns(db: Session = Depends(get_db)):
    return db.query(PatternModel).all()
