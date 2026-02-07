"""Club API routes."""

from datetime import datetime
from decimal import Decimal
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.interface.schemas.schemas import (
    ClubCreate,
    ClubDetails,
    ClubListItem,
    ClubMemberResponse,
    ClubUpdate,
    StatusResponse,
    SubscriptionResponse,
    UserResponse,
    JoinRequest
)
from src.domain.entities.club import Club, ClubMember
from src.domain.entities.subscription import Subscription
from src.domain.entities.user import User
from src.application.services.club_service import ClubService
from src.infrastructure.telegram.auth import TelegramUser, get_current_user
from src.infrastructure.persistence.database import get_db

router = APIRouter(prefix="/clubs", tags=["clubs"])


def get_service(db: AsyncSession = Depends(get_db)) -> ClubService:
    return ClubService(db)


@router.get("", response_model=list[ClubListItem])
async def get_clubs(
    db: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ClubService, Depends(get_service)],
    category: Optional[str] = Query(None, description="Filter: digital or telecom"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter: open, full"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> list[ClubListItem]:
    """Get list of clubs with filters."""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    query = (
        select(Club)
        .options(selectinload(Club.subscription))
        .where(Club.is_deleted == False)
    )
    
    if category:
        query = query.where(Club.category == category)
    
    if status_filter:
        query = query.where(Club.status == status_filter)
    else:
        # Default: show open clubs first
        query = query.where(Club.status.in_(["open", "full"]))
    
    query = query.order_by(Club.created_at.desc()).limit(limit).offset(offset)
    
    result = await db.execute(query)
    clubs = result.scalars().all()
    
    return [await service.get_club_list_item(club) for club in clubs]


@router.get("/{club_id}", response_model=ClubDetails)
async def get_club(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> ClubDetails:
    """Get club details. Credentials shown only to active members."""
    return await service.get_club_details(club_id, tg_user.id)


@router.post("", response_model=ClubListItem, status_code=status.HTTP_201_CREATED)
async def create_club(
    data: ClubCreate,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> ClubListItem:
    """Create a new club."""
    return await service.create_club(data, tg_user.id)


@router.post("/{club_id}/join", response_model=StatusResponse)
async def join_club(
    club_id: UUID,
    request: JoinRequest,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ClubService, Depends(get_service)],
) -> StatusResponse:
    """Request to join a club."""
    # Ensure User exists in DB (ORM object needed for service)
    from sqlalchemy import select
    user_result = await db.execute(select(User).where(User.user_id == tg_user.id))
    user = user_result.scalar_one_or_none()
    
    if not user:
        user = User(
            user_id=tg_user.id,
            username=tg_user.username,
            first_name=tg_user.first_name,
        )
        db.add(user)
        await db.flush()

    msg = await service.join_club(club_id, user, request.phone_number)
    return StatusResponse(status="success", message=msg)


@router.post("/{club_id}/leave", response_model=StatusResponse)
async def leave_club(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> StatusResponse:
    """Leave a club."""
    msg = await service.leave_club(club_id, tg_user.id)
    return StatusResponse(status="success", message=msg)


@router.get("/{club_id}/members", response_model=list[ClubMemberResponse])
async def get_club_members(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[ClubMemberResponse]:
    """Get club members. Only visible to host and members."""
    # Logic remains here as it's simple read-only access control + query
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    # Get club to check host
    club_result = await db.execute(select(Club).where(Club.club_id == club_id))
    club = club_result.scalar_one_or_none()
    
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Check access
    is_host = club.host_id == tg_user.id
    
    member_check = await db.execute(
        select(ClubMember)
        .where(ClubMember.club_id == club_id)
        .where(ClubMember.user_id == tg_user.id)
        .where(ClubMember.status == "active")
    )
    is_member = member_check.scalar_one_or_none() is not None
    
    if not is_host and not is_member:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get members
    result = await db.execute(
        select(ClubMember)
        .options(selectinload(ClubMember.user))
        .where(ClubMember.club_id == club_id)
        .where(ClubMember.status.in_(["active", "pending"]))
        .order_by(ClubMember.joined_at)
    )
    members = result.scalars().all()
    
    return [
        ClubMemberResponse(
            member_id=m.member_id,
            user=UserResponse.model_validate(m.user),
            status=m.status,
            phone_number=m.phone_number,
            joined_at=m.joined_at,
            last_payment_at=m.last_payment_at,
        )
        for m in members
    ]
