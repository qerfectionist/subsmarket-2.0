"""User API routes."""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.interface.schemas.schemas import UserResponse
from src.domain.entities.user import User
from src.infrastructure.telegram.auth import TelegramUser, get_current_user
from src.infrastructure.persistence.database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Get current user profile. Creates user if not exists."""
    
    # Try to find existing user
    result = await db.execute(
        select(User).where(User.user_id == tg_user.id)
    )
    user = result.scalar_one_or_none()
    
    # Create if not exists
    if not user:
        user = User(
            user_id=tg_user.id,
            username=tg_user.username,
            first_name=tg_user.first_name,
            last_active_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.flush()
    else:
        # Update last active
        user.last_active_at = datetime.now(timezone.utc)
        if tg_user.username:
            user.username = tg_user.username
        if tg_user.first_name:
            user.first_name = tg_user.first_name
    
    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Get user by ID (public profile)."""
    
    result = await db.execute(
        select(User).where(User.user_id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse.model_validate(user)
