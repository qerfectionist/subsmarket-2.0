
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import UploadFile, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.deal import Deal
from src.domain.entities.market import GigabyteOffer
from src.domain.entities.user import User
from src.domain.services.notification_service import NotificationService
from src.domain.services.ai_service import AIService
from src.domain.services.trust_service import TrustService


class DealService:
    """Service to handle P2P deal flow."""

    @staticmethod
    async def create_deal(
        db: AsyncSession, 
        buyer_id: int, 
        offer_type: str, 
        offer_id: uuid.UUID, 
        amount: Decimal,
        quantity_gb: Optional[int] = None,
    ) -> Deal:
        """Creates a new deal and notifies the seller."""
        
        seller_id = None
        
        # 1. Validate Offer
        if offer_type == 'gigabyte':
            result = await db.execute(
                select(GigabyteOffer)
                .where(GigabyteOffer.offer_id == offer_id)
                .with_for_update()
            )
            offer = result.scalar_one_or_none()
            
            if not offer or not offer.is_active:
                 raise HTTPException(status_code=404, detail="Offer not found or inactive")
            
            seller_id = offer.seller_id
            
            if seller_id == buyer_id:
                raise HTTPException(status_code=400, detail="Cannot buy your own offer")

            gb_to_buy = quantity_gb or offer.amount_gb
            if gb_to_buy <= 0:
                raise HTTPException(status_code=400, detail="GB quantity must be positive")

            if gb_to_buy > offer.amount_gb:
                raise HTTPException(status_code=400, detail="Not enough GB available")

            expected_amount = offer.price * Decimal(gb_to_buy)
            if expected_amount != amount:
                 raise HTTPException(status_code=400, detail=f"Price mismatch. Expected {expected_amount}")
                 
            offer.amount_gb -= gb_to_buy
            if offer.amount_gb <= 0:
                offer.is_active = False

        elif offer_type == 'club':
             raise HTTPException(status_code=501, detail="Club P2P not implemented yet")
        else:
            raise HTTPException(status_code=400, detail="Invalid offer type")

        # 2. Create Deal
        deal = Deal(
            deal_id=uuid.uuid4(),
            buyer_id=buyer_id,
            seller_id=seller_id,
            offer_type=offer_type,
            gb_offer_id=offer_id if offer_type == 'gigabyte' else None,
            club_id=offer_id if offer_type == 'club' else None,
            amount=amount,
            status="CREATED"
        )
        
        db.add(deal)
        await db.commit()
        await db.refresh(deal)
        
        # 3. Notify Seller
        msg = f"📦 New Order! {amount} KZT for {offer_type}. Please check your deals."
        await NotificationService().send_to_user(seller_id, msg)
        
        return deal

    @staticmethod
    async def mark_paid(
        db: AsyncSession, 
        deal_id: uuid.UUID, 
        user_id: int, 
        proof_file: Optional[UploadFile] = None
    ) -> Deal:
        """
        Marks deal as paid by buyer. 
        Optionally analyzes receipt with AI.
        Notifies seller with AI verdict.
        """
        result = await db.execute(select(Deal).where(Deal.deal_id == deal_id).with_for_update())
        deal = result.scalar_one_or_none()
        
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
            
        if deal.buyer_id != user_id:
            raise HTTPException(status_code=403, detail="Only buyer can mark as paid")
            
        if deal.status != "CREATED":
            raise HTTPException(status_code=400, detail="Invalid status transition (must be CREATED)")

        # AI Analysis
        ai_verdict = ""
        if proof_file:
            try:
                content = await proof_file.read()
                # Reset cursor if we need to save file later (not implemented here)
                # await proof_file.seek(0) 
                
                # Analyze using real AI service
                analysis = await AIService.analyze_receipt(content)
                if analysis and analysis.get("is_receipt"):
                    ai_verdict = f"\n✅ AI Verified: Valid Receipt ({analysis.get('bank_name', 'Unknown Bank')},Amount: {analysis.get('amount', '?')})"
                else:
                    ai_verdict = "\n⚠️ AI Warning: Image might not be a valid receipt."
            except Exception as e:
                print(f"AI Analysis failed: {e}")
                ai_verdict = "\n(AI Analysis unavailable)"

        deal.status = "PAID_BY_BUYER"
        deal.paid_at = datetime.now(timezone.utc)
        deal.updated_at = datetime.now(timezone.utc)
        
        # Note: In production, upload proof_file to S3 here and save URL
        
        await db.commit()
        await db.refresh(deal)
        
        # Notify Seller
        msg = f"💰 Buyer paid for deal #{str(deal.deal_id)[:8]}!{ai_verdict}\nPlease confirm receipt."
        await NotificationService().send_to_user(deal.seller_id, msg)
        
        return deal

    @staticmethod
    async def confirm_deal(
        db: AsyncSession, 
        deal_id: uuid.UUID, 
        user_id: int
    ) -> Deal:
        """
        Seller confirms deal.
        Updates status to COMPLETED.
        Updates Trust Score.
        """
        result = await db.execute(select(Deal).where(Deal.deal_id == deal_id).with_for_update())
        deal = result.scalar_one_or_none()
        
        if not deal:
             raise HTTPException(status_code=404, detail="Deal not found")
             
        if deal.seller_id != user_id:
             raise HTTPException(status_code=403, detail="Only seller can confirm")
             
        if deal.status != "PAID_BY_BUYER":
             raise HTTPException(status_code=400, detail="Deal not paid by buyer yet")
             
        deal.status = "COMPLETED"
        deal.updated_at = datetime.now(timezone.utc)
        
        # Update Trust Score
        await TrustService.update_score(
            db=db,
            user_id=deal.seller_id,
            event_type="successful_deal",
            related_deal_id=deal.deal_id,
            notes=f"Confirmed deal {deal.deal_id}"
        )
        
        await db.commit()
        await db.refresh(deal)
        
        # Notify Buyer
        msg = f"✅ Deal Completed! Seller confirmed receipt. Enjoy your purchase."
        await NotificationService().send_to_user(deal.buyer_id, msg)
        
        return deal

    @staticmethod
    async def open_dispute(
        db: AsyncSession,
        deal_id: uuid.UUID,
        user_id: int,
        reason: str
    ) -> Deal:
        """Buyer opens a dispute."""
        result = await db.execute(select(Deal).where(Deal.deal_id == deal_id).with_for_update())
        deal = result.scalar_one_or_none()

        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        if deal.buyer_id != user_id:
             raise HTTPException(status_code=403, detail="Only buyer can dispute")
             
        if deal.status != "PAID_BY_BUYER":
             raise HTTPException(status_code=400, detail="Can only dispute paid deals")
             
        deal.status = "DISPUTED"
        deal.dispute_reason = reason
        deal.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        await db.refresh(deal)
        
        # Notify Admins
        await NotificationService().notify_admins(f"🚨 Dispute Opened! Deal: {deal_id}\nReason: {reason}")
        
        return deal
