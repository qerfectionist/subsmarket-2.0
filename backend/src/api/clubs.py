"""Club API routes."""

from datetime import datetime
from decimal import Decimal
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.api.schemas import (
    ClubCreate,
    ClubDetails,
    ClubListItem,
    ClubMemberResponse,
    ClubUpdate,
    StatusResponse,
    SubscriptionResponse,
    UserResponse,
)
from src.domain import Club, ClubMember, Subscription, User
from src.infrastructure import TelegramUser, get_current_user, get_db

router = APIRouter(prefix="/clubs", tags=["clubs"])


async def get_club_with_count(db: AsyncSession, club: Club) -> ClubListItem:
    """Helper to build ClubListItem with member count."""
    # Count active members
    count_result = await db.execute(
        select(func.count(ClubMember.member_id))
        .where(ClubMember.club_id == club.club_id)
        .where(ClubMember.status.in_(["active", "pending"]))
    )
    member_count = count_result.scalar() or 0
    
    return ClubListItem(
        club_id=club.club_id,
        host_id=club.host_id,
        subscription=SubscriptionResponse.model_validate(club.subscription),
        category=club.category,
        price_total=club.price_total,
        price_per_member=club.price_per_member,
        max_members=club.max_members,
        current_members=member_count,
        status=club.status,
        description=club.description,
        created_at=club.created_at,
    )


@router.get("", response_model=list[ClubListItem])
async def get_clubs(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Optional[str] = Query(None, description="Filter: digital or telecom"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter: open, full"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> list[ClubListItem]:
    """Get list of clubs with filters."""
    
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
    
    return [await get_club_with_count(db, club) for club in clubs]


@router.get("/{club_id}", response_model=ClubDetails)
async def get_club(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ClubDetails:
    """Get club details. Credentials shown only to active members."""
    
    result = await db.execute(
        select(Club)
        .options(
            selectinload(Club.subscription),
            selectinload(Club.host),
            selectinload(Club.members),
        )
        .where(Club.club_id == club_id)
        .where(Club.is_deleted == False)
    )
    club = result.scalar_one_or_none()
    
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    # Check if user is member
    is_host = club.host_id == tg_user.id
    is_active_member = any(
        m.user_id == tg_user.id and m.status == "active"
        for m in club.members
    )
    
    # Count members
    member_count = sum(
        1 for m in club.members if m.status in ["active", "pending"]
    )
    
    # Build response
    response = ClubDetails(
        club_id=club.club_id,
        host_id=club.host_id,
        host=UserResponse.model_validate(club.host),
        subscription=SubscriptionResponse.model_validate(club.subscription),
        category=club.category,
        price_total=club.price_total,
        price_per_member=club.price_per_member,
        max_members=club.max_members,
        current_members=member_count,
        status=club.status,
        description=club.description,
        created_at=club.created_at,
        payment_method=club.payment_method,
        payment_details=club.payment_details if (is_host or is_active_member) else None,
        payment_day=club.payment_day,
        rules=club.rules,
        telegram_group_link=club.telegram_group_link if (is_host or is_active_member) else None,
        # Credentials only for active members
        login=club.login_encrypted if is_active_member else None,  # TODO: decrypt
        password=club.password_encrypted if is_active_member else None,  # TODO: decrypt
    )
    
    return response


@router.post("", response_model=ClubListItem, status_code=status.HTTP_201_CREATED)
async def create_club(
    data: ClubCreate,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ClubListItem:
    """Create a new club."""
    
    # Verify subscription exists
    sub_result = await db.execute(
        select(Subscription).where(Subscription.subscription_id == data.subscription_id)
    )
    subscription = sub_result.scalar_one_or_none()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subscription_id"
        )
    
    # Calculate price per member
    price_per_member = data.price_total / Decimal(data.max_members)
    
    # Create club
    club = Club(
        host_id=tg_user.id,
        subscription_id=data.subscription_id,
        category=subscription.category,
        price_total=data.price_total,
        price_per_member=price_per_member,
        max_members=data.max_members,
        status="open",
        login_encrypted=data.login,  # TODO: encrypt
        password_encrypted=data.password,  # TODO: encrypt
        payment_method=data.payment_method,
        payment_details=data.payment_details,
        payment_day=data.payment_day,
        description=data.description,
        rules=data.rules,
    )
    
    db.add(club)
    await db.flush()
    
    # Reload with subscription
    await db.refresh(club, ["subscription"])
    
    return await get_club_with_count(db, club)


@router.post("/{club_id}/join", response_model=StatusResponse)
async def join_club(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> StatusResponse:
    """Request to join a club."""
    
    # Get club
    result = await db.execute(
        select(Club)
        .options(selectinload(Club.members))
        .where(Club.club_id == club_id)
        .where(Club.is_deleted == False)
    )
    club = result.scalar_one_or_none()
    
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    if club.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Club is not accepting new members"
        )
    
    # Check if already member
    existing = next(
        (m for m in club.members if m.user_id == tg_user.id and m.status not in ["left", "kicked"]),
        None
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already a member of this club"
        )
    
    # Check capacity
    active_count = sum(1 for m in club.members if m.status in ["active", "pending"])
    if active_count >= club.max_members:
        club.status = "full"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Club is full"
        )
    
    # Ensure user exists
    user_result = await db.execute(
        select(User).where(User.user_id == tg_user.id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        user = User(
            user_id=tg_user.id,
            username=tg_user.username,
            first_name=tg_user.first_name,
        )
        db.add(user)
        await db.flush()
    
    # Create membership
    member = ClubMember(
        club_id=club_id,
        user_id=tg_user.id,
        status="pending",
    )
    
    db.add(member)
    
    # Update club status if full
    if active_count + 1 >= club.max_members:
        club.status = "full"
    
    return StatusResponse(
        status="success",
        message="Join request sent. Awaiting payment confirmation."
    )


@router.post("/{club_id}/leave", response_model=StatusResponse)
async def leave_club(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> StatusResponse:
    """Leave a club."""
    
    result = await db.execute(
        select(ClubMember)
        .where(ClubMember.club_id == club_id)
        .where(ClubMember.user_id == tg_user.id)
        .where(ClubMember.status.in_(["active", "pending"]))
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not a member of this club"
        )
    
    member.status = "left"
    member.left_at = datetime.utcnow()
    
    # Reopen club if was full
    club_result = await db.execute(
        select(Club).where(Club.club_id == club_id)
    )
    club = club_result.scalar_one_or_none()
    if club and club.status == "full":
        club.status = "open"
    
    return StatusResponse(
        status="success",
        message="You have left the club"
    )


@router.get("/{club_id}/members", response_model=list[ClubMemberResponse])
async def get_club_members(
    club_id: UUID,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[ClubMemberResponse]:
    """Get club members. Only visible to host and members."""
    
    # Get club
    club_result = await db.execute(
        select(Club).where(Club.club_id == club_id)
    )
    club = club_result.scalar_one_or_none()
    
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
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
            joined_at=m.joined_at,
            last_payment_at=m.last_payment_at,
        )
        for m in members
    ]
