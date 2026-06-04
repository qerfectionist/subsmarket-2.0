"""Club API routes."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
from src.security import limiter

router = APIRouter(prefix="/clubs", tags=["clubs"])


def get_service(db: AsyncSession = Depends(get_db)) -> ClubService:
    return ClubService(db)


@router.get("/my", response_model=list[ClubListItem])
@limiter.limit("60/minute")
async def get_my_clubs(
    request: Request,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ClubService, Depends(get_service)],
) -> list[ClubListItem]:
    """Get clubs where current user is host or active member."""
    # Clubs where user is host
    host_q = await db.execute(
        select(Club)
        .options(selectinload(Club.subscription))
        .where(Club.host_id == tg_user.id)
        .where(Club.is_deleted == False)
        .where(Club.status != "deleted")
        .order_by(Club.created_at.desc())
    )
    hosted = host_q.scalars().all()

    # Club IDs where user is a member (not host)
    member_q = await db.execute(
        select(ClubMember.club_id)
        .where(ClubMember.user_id == tg_user.id)
        .where(ClubMember.status.in_(["active", "pending", "approved"]))
    )
    member_club_ids = [row[0] for row in member_q.all()]

    member_clubs: list[Club] = []
    if member_club_ids:
        mclub_q = await db.execute(
            select(Club)
            .options(selectinload(Club.subscription))
            .where(Club.club_id.in_(member_club_ids))
            .where(Club.is_deleted == False)
            .order_by(Club.created_at.desc())
        )
        member_clubs = mclub_q.scalars().all()

    all_clubs = hosted + member_clubs
    if not all_clubs:
        return []

    club_ids = [c.club_id for c in all_clubs]
    counts = await service.get_member_counts_batch(club_ids)

    return [
        service.build_club_list_item(club, counts.get(club.club_id, 0) + 1)
        for club in all_clubs
    ]


@router.get("", response_model=dict)
@limiter.limit("60/minute")
async def get_clubs(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ClubService, Depends(get_service)],
    category: Optional[str] = Query(None, description="Filter: digital or telecom"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter: open, full"),
    search: Optional[str] = Query(None, description="Search by subscription name"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> dict:
    """Get paginated list of clubs. Returns {items, total}."""
    # Build base conditions
    conditions = [Club.is_deleted == False]
    if category:
        conditions.append(Club.category == category)
    if status_filter:
        conditions.append(Club.status == status_filter)
    else:
        conditions.append(Club.status.in_(["open", "full"]))

    # Search by subscription name (JOIN if needed)
    search_join = search and search.strip()

    if search_join:

        search_join = search_join.replace('%', r'\%').replace('_', r'\_')

    # Get total count
    if search_join:
        count_query = (
            select(func.count(Club.club_id))
            .join(Subscription, Club.subscription_id == Subscription.subscription_id)
            .where(*conditions)
            .where(Subscription.service_name.ilike(f"%{search_join}%", escape='\\'  ))
        )
    else:
        count_query = select(func.count(Club.club_id)).where(*conditions)
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Get paginated clubs
    if search_join:
        paginated_query = (
            select(Club)
            .options(selectinload(Club.subscription))
            .join(Subscription, Club.subscription_id == Subscription.subscription_id)
            .where(*conditions)
            .where(Subscription.service_name.ilike(f"%{search_join}%", escape='\\'  ))
            .order_by(Club.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    else:
        paginated_query = (
            select(Club)
            .options(selectinload(Club.subscription))
            .where(*conditions)
            .order_by(Club.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
    result = await db.execute(paginated_query)
    clubs = result.scalars().all()

    # ONE batch query for all member counts — eliminates N+1
    club_ids = [c.club_id for c in clubs]
    counts = await service.get_member_counts_batch(club_ids)

    items = [
        service.build_club_list_item(club, counts.get(club.club_id, 0) + 1)
        for club in clubs
    ]

    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.get("/{club_id}", response_model=ClubDetails)
async def get_club(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> ClubDetails:
    """Get club details. Credentials shown only to active members."""
    return await service.get_club_details(club_id, tg_user.id)


@router.post("", response_model=ClubListItem, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def create_club(
    request: Request,
    data: ClubCreate,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ClubService, Depends(get_service)],
) -> ClubListItem:
    """Create a new club. Rate limited: 5 per hour."""
    user_result = await db.execute(select(User).where(User.user_id == tg_user.id))
    user = user_result.scalar_one_or_none()
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
        user.last_active_at = datetime.now(timezone.utc)
        if tg_user.username:
            user.username = tg_user.username
        if tg_user.first_name:
            user.first_name = tg_user.first_name

    return await service.create_club(data, tg_user.id)


@router.patch("/{club_id}", response_model=ClubListItem)
async def update_club(
    club_id: UUID,
    data: ClubUpdate,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> ClubListItem:
    """Update club details. Host only."""
    return await service.update_club(club_id, data, tg_user.id)


@router.post("/{club_id}/join", response_model=StatusResponse)
@limiter.limit("10/hour")
async def join_club(
    request: Request,
    club_id: UUID,
    join_data: JoinRequest,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    service: Annotated[ClubService, Depends(get_service)],
) -> StatusResponse:
    """Request to join a club."""
    # Ensure User exists in DB (ORM object needed for service)
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

    msg = await service.join_club(club_id, user, join_data.phone_number)
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


@router.delete("/{club_id}", response_model=StatusResponse)
async def delete_club(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> StatusResponse:
    """Delete a club (admin/host)."""
    msg = await service.delete_club(club_id, tg_user.id)
    return StatusResponse(status="success", message=msg)


@router.get("/{club_id}/members", response_model=list[ClubMemberResponse])
async def get_club_members(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> list[ClubMemberResponse]:
    """Get club members. Only visible to host and active members."""
    return await service.get_club_members(club_id, tg_user.id)


@router.get("/{club_id}/pending", response_model=list[ClubMemberResponse])
async def get_pending_members(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> list[ClubMemberResponse]:
    """Get pending join requests. Only visible to host."""
    members = await service.get_pending_members(club_id, tg_user.id)
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


@router.post("/{club_id}/members/{member_id}/approve", response_model=StatusResponse)
async def approve_member(
    club_id: UUID,
    member_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> StatusResponse:
    """Approve a pending member. Host only."""
    msg = await service.approve_member(club_id, member_id, tg_user.id)
    return StatusResponse(status="success", message=msg)


@router.post("/{club_id}/members/{member_id}/reject", response_model=StatusResponse)
async def reject_member(
    club_id: UUID,
    member_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> StatusResponse:
    """Reject a pending member. Host only."""
    msg = await service.reject_member(club_id, member_id, tg_user.id)
    return StatusResponse(status="success", message=msg)


@router.delete("/{club_id}/join", response_model=StatusResponse)
async def cancel_join_request(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
) -> StatusResponse:
    """Cancel user's own pending join request."""
    msg = await service.cancel_join_request(club_id, tg_user.id)
    return StatusResponse(status="success", message=msg)


@router.post("/{club_id}/remind", response_model=StatusResponse)
async def remind_host(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    service: Annotated[ClubService, Depends(get_service)],
    db: AsyncSession = Depends(get_db),
) -> StatusResponse:
    """Send a reminder to the club host about pending join request."""
    # Get full user object for the notification message
    result = await db.execute(select(User).where(User.user_id == tg_user.id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    msg = await service.remind_host_of_request(club_id, user)
    return StatusResponse(status="success", message=msg)


