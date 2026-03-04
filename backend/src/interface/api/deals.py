"""Deal API routes."""

from datetime import datetime
from decimal import Decimal
from typing import Annotated, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status, Body, UploadFile, File
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.domain.entities.deal import Deal
from src.domain.entities.market import GigabyteOffer
from src.domain.entities.user import User
from src.domain.entities.club import Club
from src.infrastructure.telegram.auth import TelegramUser, get_current_user
from src.infrastructure.persistence.database import get_db
from src.domain.services.deal_service import DealService
from src.security import limiter

router = APIRouter(prefix="/deals", tags=["deals"])


# --- Schemas ---

class CreateDealRequest(BaseModel):
    offer_type: str  # 'gigabyte' | 'club'
    offer_id: UUID
    amount: Decimal


class DealResponse(BaseModel):
    deal_id: UUID
    buyer_id: int
    seller_id: int
    offer_type: str
    status: str
    amount: Decimal
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None
    dispute_reason: Optional[str] = None
    proof_screenshot_id: Optional[str] = None
    gb_offer_id: Optional[UUID] = None
    club_id: Optional[UUID] = None


    model_config = ConfigDict(from_attributes=True)


@router.get("/my", response_model=list[DealResponse])
async def get_my_deals(
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get deals where user is buyer or seller.
    Ordered by updated_at desc.
    """
    query = select(Deal).where(
        (Deal.buyer_id == tg_user.id) | (Deal.seller_id == tg_user.id)
    ).order_by(Deal.updated_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(
    deal_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get deal details.
    Must be buyer or seller.
    """
    query = select(Deal).where(Deal.deal_id == deal_id)
    result = await db.execute(query)
    deal = result.scalar_one_or_none()
    
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
        
    if deal.buyer_id != tg_user.id and deal.seller_id != tg_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    return deal


# --- Routes ---

@router.post("", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def create_deal(
    request: Request,
    data: CreateDealRequest,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new P2P deal. Rate limited: 5 per hour."""
    return await DealService.create_deal(
        db, 
        tg_user.id, 
        data.offer_type, 
        data.offer_id, 
        data.amount
    )


@router.post("/{deal_id}/pay", response_model=DealResponse)
@limiter.limit("3/minute")
async def mark_deal_paid(
    request: Request,
    deal_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    proof: Optional[UploadFile] = File(None),
):
    """Buyer marks deal as PAID. Rate limited: 3 per minute."""
    return await DealService.mark_paid(db, deal_id, tg_user.id, proof)


@router.post("/{deal_id}/confirm", response_model=DealResponse)
@limiter.limit("5/minute")
async def confirm_deal(
    request: Request,
    deal_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Seller confirms receipt of funds.
    Status transition: PAID_BY_BUYER -> COMPLETED
    """
    return await DealService.confirm_deal(db, deal_id, tg_user.id)

@router.post("/{deal_id}/dispute", response_model=DealResponse)
@limiter.limit("3/minute")
async def open_dispute(
    request: Request,
    deal_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    reason: str = Body(..., embed=True),
    proof_screenshot_id: Optional[str] = Body(None, embed=True),
):
    """
    Buyer opens a dispute if seller is unresponsive.
    Status transition: PAID_BY_BUYER -> DISPUTED
    """
    return await DealService.open_dispute(db, deal_id, tg_user.id, reason)
