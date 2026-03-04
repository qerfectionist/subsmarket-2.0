from typing import List, Optional, Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from src.infrastructure.persistence.database import get_db
from src.infrastructure.telegram.auth import TelegramUser, get_current_user
from src.domain.entities.market import GigabyteOffer
from src.domain.entities.user import User
from src.interface.schemas.schemas import GigabyteOfferResponse, GigabyteOfferCreate
from src.security import limiter

router = APIRouter(prefix="/gigabytes", tags=["Gigabytes"])

@router.post("", response_model=GigabyteOfferResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("1/minute")
async def create_gigabyte_offer(
    request: Request,
    data: GigabyteOfferCreate,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Create a new GB sell offer. Rate limited: 1 per minute."""
    # Anti-spam: max 3 active offers per user (Free tier)
    active_count_result = await db.execute(
        select(func.count(GigabyteOffer.offer_id))
        .where(GigabyteOffer.seller_id == tg_user.id)
        .where(GigabyteOffer.is_active == True)
    )
    active_count = active_count_result.scalar() or 0
    if active_count >= 3:
        raise HTTPException(status_code=429, detail="Max 3 active offers allowed on Free tier")
    # 1. Validate inputs
    if data.amount_gb <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    if data.price < 50:
        raise HTTPException(status_code=400, detail="Price too low (min 50₸)")
        
    if data.price > data.amount_gb * 5000:
        raise HTTPException(status_code=400, detail="Price unreasonably high")

    # 2. Ensure user exists
    user_result = await db.execute(select(User).where(User.user_id == tg_user.id))
    user = user_result.scalar_one_or_none()
    
    if not user:
        # Auto-create user if not found (lazy auth)
        user = User(
            user_id=tg_user.id,
            username=tg_user.username,
            first_name=tg_user.first_name
        )
        db.add(user)
        await db.flush()

    # 3. Create Offer
    offer = GigabyteOffer(
        seller_id=tg_user.id,
        operator=data.operator,
        amount_gb=data.amount_gb,
        price=data.price,
        description=data.description,
        is_active=True
    )
    
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    
    return offer

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
