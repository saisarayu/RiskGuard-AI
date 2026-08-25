from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.customer import CustomerModel
from ...schemas.common import CustomerSchema

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerSchema])
def list_customers(db: Session = Depends(get_db)):
    return db.query(CustomerModel).all()

@router.get("/{cust_id}", response_model=CustomerSchema)
def get_customer(cust_id: str, db: Session = Depends(get_db)):
    cust = db.query(CustomerModel).filter(CustomerModel.id == cust_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust
