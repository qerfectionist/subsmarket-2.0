from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from src.infrastructure.database import get_db
from src.domain.models import GigabyteOffer, User
from src.api.schemas import GigabyteOfferResponse

router = APIRouter()

@router.get("/", response_model=List[GigabyteOfferResponse])
async def get_gigabyte_offers(
    operator: Optional[str] = None,
    min_gb: Optional[int] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    Get active GB offers.
    """
    query = (
        select(GigabyteOffer)
        .where(GigabyteOffer.is_active == True)
        .where(GigabyteOffer.is_deleted == False)
        .order_by(desc(GigabyteOffer.created_at))
        .limit(limit)
    )
    
    if operator:
        query = query.where(func.lower(GigabyteOffer.operator) == operator.lower())
    
    if min_gb:
        query = query.where(GigabyteOffer.amount_gb >= min_gb)
        
    result = await db.execute(query)
    offers = result.scalars().all()
    return offers

@router.get("/analytics/avg-price")
async def get_price_analytics(
    operator: str,
    amount_gb: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get average market price for specific amount of GB.
    Useful for price suggestion.
    """
    query = (
        select(func.avg(GigabyteOffer.price))
        .where(GigabyteOffer.is_active == True)
        .where(func.lower(GigabyteOffer.operator) == operator.lower())
        .where(GigabyteOffer.amount_gb == amount_gb)
    )
    
    result = await db.execute(query)
    avg_price = result.scalar()
    
    return {
        "operator": operator,
        "amount_gb": amount_gb,
        "average_price": round(avg_price, 2) if avg_price else None,
        "suggested_price": round(avg_price, -1) if avg_price else None # Round to nearest 10
    }
