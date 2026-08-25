from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.merchant import MerchantModel
from ...schemas.common import MerchantSchema

router = APIRouter(prefix="/merchants", tags=["Merchants"])

@router.get("", response_model=List[MerchantSchema])
def list_merchants(db: Session = Depends(get_db)):
    return db.query(MerchantModel).all()

@router.get("/{merch_id}", response_model=MerchantSchema)
def get_merchant(merch_id: str, db: Session = Depends(get_db)):
    merch = db.query(MerchantModel).filter(MerchantModel.id == merch_id).first()
    if not merch:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return merch
