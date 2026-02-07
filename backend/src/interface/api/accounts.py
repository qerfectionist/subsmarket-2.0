from datetime import datetime
from uuid import UUID
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.persistence.database import get_db
from src.infrastructure.telegram.auth import get_current_user, TelegramUser
from src.domain.entities.market import AccountOffer
from src.interface.schemas.schemas import AccountOfferCreate, AccountOfferResponse

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.post("", response_model=AccountOfferResponse, status_code=status.HTTP_201_CREATED)
async def create_account_offer(
    data: AccountOfferCreate,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new account offer."""
    offer = AccountOffer(
        seller_id=tg_user.id, # Fixed: tg_user has .id, not .user_id
        title=data.title,
        service_category=data.service_category,
        price=data.price,
        description=data.description,
    )
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return offer

@router.get("", response_model=List[AccountOfferResponse])
async def list_account_offers(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: str | None = None,
):
    """List active account offers."""
    query = select(AccountOffer).where(AccountOffer.is_active == True, AccountOffer.is_deleted == False)
    
    if category:
        query = query.where(AccountOffer.service_category == category)
        
    query = query.order_by(desc(AccountOffer.created_at))
    
    result = await db.execute(query)
    return result.scalars().all()
