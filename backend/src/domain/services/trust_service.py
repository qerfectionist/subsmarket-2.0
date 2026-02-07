"""
Trust System Domain Service.

Handles business logic for trust score updates and audit events.
"""
import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.user import User
from src.domain.entities.trust import TrustEvent


class TrustService:
    """Service to manage user trust scores and events."""
    
    # Constants based on pricing_database.json
    INITIAL_SCORE = Decimal("5.0")
    MIN_SCORE = Decimal("1.0")
    MAX_SCORE = Decimal("5.0")
    
    SCORE_MAP = {
        "successful_deal": Decimal("0.10"),
        "first_complaint_confirmed": Decimal("-0.50"),
        "repeat_complaint_confirmed": Decimal("-1.00"),
        "seller_cancellation": Decimal("-0.20"),
        "fraud_ban": Decimal("-5.00"),
    }

    @staticmethod
    async def update_score(
        db: AsyncSession,
        user_id: int,
        event_type: str,
        related_deal_id: Optional[uuid.UUID] = None,
        notes: Optional[str] = None
    ) -> User:
        """
        Updates user trust score and logs the event.
        Returns the updated user.
        """
        # Fetch user
        user = await db.get(User, user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")

        score_change = TrustService.SCORE_MAP.get(event_type, Decimal("0.0"))
        
        # Calculate new score
        old_score = user.trust_score
        new_score = old_score + score_change
        
        # Clamp score between min and max
        new_score = max(TrustService.MIN_SCORE, min(TrustService.MAX_SCORE, new_score))
        
        # Update user
        user.trust_score = new_score
        
        # If it's a successful deal, increment counts
        if event_type == "successful_deal":
            user.p2p_deals_count += 1
            user.p2p_success_count += 1
            
        # Log event
        event = TrustEvent(
            user_id=user_id,
            event_type=event_type,
            score_change=score_change,
            score_before=old_score,
            score_after=new_score,
            related_deal_id=related_deal_id,
            notes=notes
        )
        db.add(event)
        
        # Handle status changes based on score thresholds
        if new_score <= Decimal("1.0"):
            user.status = "banned"
        elif new_score <= Decimal("2.0"):
            user.status = "restricted" # Cannot create listings
            
        return user
