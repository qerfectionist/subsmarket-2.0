"""Deal API routes."""

from datetime import datetime
from decimal import Decimal
from typing import Annotated, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status, Body
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


# --- Routes ---

@router.post("", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
async def create_deal(
    data: CreateDealRequest,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Create a new P2P deal.
    Initial status: CREATED
    """
    # 1. Validate Offer
    seller_id = None
    
    if data.offer_type == 'gigabyte':
        offer_result = await db.execute(select(GigabyteOffer).where(GigabyteOffer.offer_id == data.offer_id))
        offer = offer_result.scalar_one_or_none()
        if not offer or not offer.is_active:
             raise HTTPException(status_code=404, detail="Offer not found or inactive")
        seller_id = offer.seller_id
        
        # Validation: Cannot buy own offer
        if seller_id == tg_user.id:
            raise HTTPException(status_code=400, detail="Cannot buy your own offer")

        # Validation: Price match (simple check)
        if offer.price != data.amount:
             raise HTTPException(status_code=400, detail="Price mismatch")

    elif data.offer_type == 'club':
         # Future scope: P2P club transfers or complex logic
         # For now assume buying entry? But 'Club' model isn't a listing per se like GB.
         # Assuming data.offer_id is club_id for entry fee?
         # Simplification: Only support 'gigabyte' for Sprint 2 P2P focus as per request.
         raise HTTPException(status_code=501, detail="Club P2P not fully implemented yet")
    else:
        raise HTTPException(status_code=400, detail="Invalid offer type")

    # 2. Create Deal
    deal = Deal(
        deal_id=uuid4(),
        buyer_id=tg_user.id,
        seller_id=seller_id,
        offer_type=data.offer_type,
        gb_offer_id=data.offer_id if data.offer_type == 'gigabyte' else None,
        club_id=data.offer_id if data.offer_type == 'club' else None,
        amount=data.amount,
        status="CREATED"
    )
    
    db.add(deal)
    await db.commit()
    await db.refresh(deal)
    return deal


@router.post("/{deal_id}/pay", response_model=DealResponse)
async def mark_deal_paid(
    deal_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Buyer marks deal as PAID.
    Status transition: CREATED -> PAID_BY_BUYER
    """
    deal_result = await db.execute(select(Deal).where(Deal.deal_id == deal_id))
    deal = deal_result.scalar_one_or_none()
    
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
        
    if deal.buyer_id != tg_user.id:
        raise HTTPException(status_code=403, detail="Only buyer can mark as paid")
        
    if deal.status != "CREATED":
        raise HTTPException(status_code=400, detail="Invalid status transition")
        
    deal.status = "PAID_BY_BUYER"
    deal.updated_at = datetime.utcnow()
    deal.paid_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(deal)
    
    # Notify Seller (Mock implementation for now)
    # notification_service.send(deal.seller_id, "Buyer paid!")
    
    return deal

@router.post("/{deal_id}/confirm", response_model=DealResponse)
async def confirm_deal(
    deal_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Seller confirms receipt of funds.
    Status transition: PAID_BY_BUYER -> COMPLETED
    """
    from src.domain.services.trust_service import TrustService
    
    deal_result = await db.execute(select(Deal).where(Deal.deal_id == deal_id))
    deal = deal_result.scalar_one_or_none()
    
    if not deal:
         raise HTTPException(status_code=404, detail="Deal not found")
         
    if deal.seller_id != tg_user.id:
         raise HTTPException(status_code=403, detail="Only seller can confirm")
         
    if deal.status != "PAID_BY_BUYER":
         raise HTTPException(status_code=400, detail="Deal not marked as paid by buyer")
         
    deal.status = "COMPLETED"
    deal.updated_at = datetime.utcnow()
    
    # Update seller trust score
    await TrustService.update_score(
        db=db,
        user_id=deal.seller_id,
        event_type="successful_deal",
        related_deal_id=deal.deal_id,
        notes=f"Completed {deal.offer_type} deal"
    )
    
    # Optional: Bonus for buyer too? 
    # For now following simple rules where successful deals build seller reputation.
    
    await db.commit()
    await db.refresh(deal)
    return deal

@router.post("/{deal_id}/dispute", response_model=DealResponse)
async def open_dispute(
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
    deal_result = await db.execute(select(Deal).where(Deal.deal_id == deal_id))
    deal = deal_result.scalar_one_or_none()
    
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
        
    if deal.buyer_id != tg_user.id:
        raise HTTPException(status_code=403, detail="Only buyer can open dispute")
        
    if deal.status != "PAID_BY_BUYER":
        raise HTTPException(status_code=400, detail="Only paid deals can be disputed")
    
    # Time check: usually wait 15-30 mins. 
    # For now, allowing immediate for testing, or check deal.paid_at
    if deal.paid_at:
        elapsed = datetime.utcnow() - deal.paid_at
        if elapsed.total_seconds() < 900: # 15 minutes
            raise HTTPException(status_code=400, detail="Please wait 15 minutes before opening a dispute") 

    deal.status = "DISPUTED"
    deal.dispute_reason = reason
    deal.proof_screenshot_id = proof_screenshot_id
    deal.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(deal)
    
    return deal
