"""Subscription API routes."""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.interface.schemas.schemas import SubscriptionResponse
from src.domain.entities.subscription import Subscription
from src.infrastructure.persistence.database import get_db

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("", response_model=list[SubscriptionResponse])
async def get_subscriptions(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Optional[str] = Query(None, description="Filter by category: digital or telecom"),
) -> list[SubscriptionResponse]:
    """Get all available subscription services."""
    
    query = select(Subscription).where(Subscription.is_active == True)
    
    if category:
        query = query.where(Subscription.category == category)
    
    query = query.order_by(Subscription.service_name)
    
    result = await db.execute(query)
    subscriptions = result.scalars().all()
    
    return [SubscriptionResponse.model_validate(s) for s in subscriptions]
