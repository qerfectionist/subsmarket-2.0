from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.domain.entities.club import Club, ClubMember
from src.domain.entities.subscription import Subscription
from src.domain.entities.user import User
from src.interface.schemas.schemas import ClubCreate, ClubDetails, ClubListItem, UserResponse, SubscriptionResponse


class ClubService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_member_count(self, club_id: UUID) -> int:
        """Count active or pending members."""
        result = await self.db.execute(
            select(func.count(ClubMember.member_id))
            .where(ClubMember.club_id == club_id)
            .where(ClubMember.status.in_(["active", "pending"]))
        )
        return result.scalar() or 0

    async def get_club_list_item(self, club: Club) -> ClubListItem:
        """Convert Club model to ClubListItem with member count."""
        member_count = await self._get_member_count(club.club_id)
        
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

    async def get_club_details(self, club_id: UUID, user_id: int) -> ClubDetails:
        """Get full club details with access control check."""
        result = await self.db.execute(
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
        
        # Check access
        is_host = club.host_id == user_id
        is_active_member = any(
            m.user_id == user_id and m.status == "active"
            for m in club.members
        )
        
        # Find current user's membership status
        my_membership = next(
            (m for m in club.members if m.user_id == user_id and m.status not in ["left", "kicked"]),
            None
        )
        
        member_count = await self._get_member_count(club.club_id)
        
        return ClubDetails(
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
            payment_details=club.payment_details if (is_host or is_active_member or any(m.user_id == user_id and m.status == "approved" for m in club.members)) else None,
            payment_day=club.payment_day,
            rules=club.rules,
            telegram_group_link=club.telegram_group_link if (is_host or is_active_member) else None,
            my_status=my_membership.status if my_membership else None,
        )

    async def update_club(self, club_id: UUID, data: "ClubUpdate", user_id: int) -> ClubListItem:
        """Update club fields. Only the host can update."""
        from src.interface.schemas.schemas import ClubUpdate
        club_result = await self.db.execute(
            select(Club)
            .options(selectinload(Club.subscription))
            .where(Club.club_id == club_id)
            .where(Club.is_deleted == False)
        )
        club = club_result.scalar_one_or_none()
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        if club.host_id != user_id:
            raise HTTPException(status_code=403, detail="Only the host can edit this club")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(club, field) and value is not None:
                setattr(club, field, value)

        # Recalculate price_per_member if price_total changed
        if 'price_total' in update_data:
            club.price_per_member = Decimal(str(update_data['price_total'])) / Decimal(club.max_members)

        await self.db.flush()
        list_item = await self.get_club_list_item(club)
        await self.db.commit()
        return list_item

    # ─── Helper: service id slug → display name ──────────────────────────────
    _SERVICE_NAMES: dict[str, tuple[str, str]] = {
        # id: (display_name, category)
        'youtube_premium': ('YouTube Premium', 'digital'),
        'netflix': ('Netflix', 'digital'),
        'spotify': ('Spotify', 'digital'),
        'apple_music': ('Apple Music', 'digital'),
        'yandex_plus': ('Яндекс Плюс', 'digital'),
        'microsoft_365': ('Microsoft 365', 'digital'),
        'google_one': ('Google One', 'digital'),
        'duolingo': ('Duolingo', 'digital'),
        'chatgpt': ('ChatGPT Plus', 'digital'),
        'canva': ('Canva Pro', 'digital'),
        'adobe': ('Adobe Creative Cloud', 'digital'),
        'skillbox': ('Skillbox', 'digital'),
        'coursera': ('Coursera', 'digital'),
        'beeline': ('Beeline Family', 'telecom'),
        'kcell': ('Kcell Family', 'telecom'),
        'activ': ('Activ Family', 'telecom'),
        'tele2': ('Tele2 Family', 'telecom'),
    }

    async def _resolve_subscription(self, data: "ClubCreate") -> "Subscription":
        """Resolve subscription by UUID or by service_id string slug.
        If not found — auto-create a Subscription record on the fly.
        """
        # 1. Try by UUID
        if data.subscription_id:
            sub_result = await self.db.execute(
                select(Subscription).where(Subscription.subscription_id == data.subscription_id)
            )
            sub = sub_result.scalar_one_or_none()
            if sub:
                return sub

        # 2. Try by service_id slug → match service_name
        service_id = getattr(data, 'service_id', None)
        if service_id:
            # Try exact match on service_name slug in DB
            service_id_lower = service_id.lower().replace('_', ' ')
            sub_result = await self.db.execute(
                select(Subscription).where(
                    Subscription.service_name.ilike(f'%{service_id_lower}%')
                )
            )
            sub = sub_result.scalars().first()
            if sub:
                return sub

            # Auto-create from catalog data
            name, category = self._SERVICE_NAMES.get(service_id, (service_id.replace('_', ' ').title(), 'digital'))
            sub = Subscription(
                service_name=name,
                category=category,
                max_members=10,
                is_active=True,
            )
            self.db.add(sub)
            await self.db.flush()
            return sub

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="subscription_id or service_id is required"
        )

    async def create_club(self, data: ClubCreate, user_id: int) -> ClubListItem:
        """Create a new club."""
        subscription = await self._resolve_subscription(data)

        price_per_member = data.price_total / Decimal(data.max_members)

        club = Club(
            host_id=user_id,
            subscription_id=subscription.subscription_id,
            category=subscription.category,
            price_total=data.price_total,
            price_per_member=price_per_member,
            max_members=data.max_members,
            status="open",
            payment_method=data.payment_method,
            payment_details=data.payment_details,
            payment_day=data.payment_day,
            description=data.description,
            rules=data.rules,
        )

        self.db.add(club)
        await self.db.flush()
        await self.db.refresh(club, ["subscription"])

        list_item = await self.get_club_list_item(club)
        await self.db.commit()
        return list_item

    async def join_club(self, club_id: UUID, user: User, phone_number: Optional[str] = None) -> str:
        """Process join request."""
        # Get club with locking for update if needed (omitted for simplicity, but strictly should lock)
        result = await self.db.execute(
            select(Club)
            .options(selectinload(Club.members))
            .where(Club.club_id == club_id)
            .where(Club.is_deleted == False)
        )
        club = result.scalar_one_or_none()
        
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
            
        if club.status != "open":
            raise HTTPException(status_code=400, detail="Club is not accepting new members")
            
        # Telecom Logic: Phone Check
        if club.category == "telecom" and not phone_number:
             # Basic check, in real app verify via SMS or User profile
            raise HTTPException(
                status_code=400, 
                detail="Phone number required for Telecom clubs"
            )

        # Check existing membership
        existing = next(
            (m for m in club.members if m.user_id == user.user_id and m.status not in ["left", "kicked"]),
            None
        )
        if existing:
            raise HTTPException(status_code=400, detail="Already a member")
            
        # Check capacity
        active_count = await self._get_member_count(club_id)
        if active_count >= club.max_members:
            club.status = "full"
            raise HTTPException(status_code=400, detail="Club is full")
            
        # Ensure user exists in DB (creates if not exists, handled by `get_current_user` usually, 
        # but here we ensure the ORM object is attached if needed. 
        # Assuming `user` passed is already a valid ORM object or we fetch it.
        # Ideally the caller ensures user exists in DB)
        
        # Determine initial membership status based on club approval settings
        # Status flow: pending → approved (credentials revealed) → active (paid)
        new_status = "pending"
        msg = "Join request sent. Awaiting host approval."

        if club.approval_mode == "auto":
            if club.min_trust_score and user.trust_score < club.min_trust_score:
                # Trust score too low — fall back to manual review
                msg = "Trust score too low for auto-approval. Request pending host review."
            else:
                # Auto-approve: skip host review, reveal payment credentials
                new_status = "approved"
                msg = "Request auto-approved! Please proceed to payment."

        member = ClubMember(
            club_id=club_id,
            user_id=user.user_id,
            status=new_status,
            phone_number=phone_number,
        )
        
        self.db.add(member)
        
        # Auto-close if full (predictive)
        if active_count + 1 >= club.max_members:
            club.status = "full"

        await self.db.commit()
        return msg

    async def leave_club(self, club_id: UUID, user_id: int) -> str:
        """Leave a club."""
        result = await self.db.execute(
            select(ClubMember)
            .where(ClubMember.club_id == club_id)
            .where(ClubMember.user_id == user_id)
            .where(ClubMember.status.in_(["active", "pending", "approved"]))
        )
        member = result.scalar_one_or_none()
        
        if not member:
            raise HTTPException(status_code=404, detail="Not a member")
            
        member.status = "left"
        member.left_at = datetime.utcnow()
        
        # Reopen club if it was full
        club_result = await self.db.execute(
            select(Club).where(Club.club_id == club_id)
        )
        club = club_result.scalar_one_or_none()
        if club and club.status == "full":
            club.status = "open"

        await self.db.commit()
        return "You have left the club"

    async def get_pending_members(self, club_id: UUID, host_id: int) -> list[ClubMember]:
        """Get pending join requests for host to review."""
        # Verify caller is host
        club_result = await self.db.execute(
            select(Club).where(Club.club_id == club_id).where(Club.is_deleted == False)
        )
        club = club_result.scalar_one_or_none()
        if not club:
            raise HTTPException(status_code=404, detail="Club not found")
        if club.host_id != host_id:
            raise HTTPException(status_code=403, detail="Only the host can view requests")

        result = await self.db.execute(
            select(ClubMember)
            .options(selectinload(ClubMember.user))
            .where(ClubMember.club_id == club_id)
            .where(ClubMember.status == "pending")
            .order_by(ClubMember.joined_at.asc())
        )
        return result.scalars().all()

    async def approve_member(self, club_id: UUID, member_id: UUID, host_id: int) -> str:
        """Approve a pending join request."""
        # Fetch with user data
        result = await self.db.execute(
            select(ClubMember)
            .options(selectinload(ClubMember.club))
            .where(ClubMember.member_id == member_id)
            .where(ClubMember.club_id == club_id)
        )
        member = result.scalar_one_or_none()

        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        if member.club.host_id != host_id:
            raise HTTPException(status_code=403, detail="Only the host can approve members")
        if member.status != "pending":
            raise HTTPException(status_code=400, detail=f"Member is already {member.status}")

        # Check capacity
        active_count = await self._get_member_count(club_id)
        if active_count >= member.club.max_members:
            raise HTTPException(status_code=400, detail="Club is full")

        member.status = "active"

        # Auto-close if now full
        active_count_after = await self._get_member_count(club_id)
        if active_count_after >= member.club.max_members:
            member.club.status = "full"

        await self.db.commit()
        return "Member approved successfully"

    async def reject_member(self, club_id: UUID, member_id: UUID, host_id: int) -> str:
        """Reject a pending join request."""
        result = await self.db.execute(
            select(ClubMember)
            .options(selectinload(ClubMember.club))
            .where(ClubMember.member_id == member_id)
            .where(ClubMember.club_id == club_id)
        )
        member = result.scalar_one_or_none()

        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        if member.club.host_id != host_id:
            raise HTTPException(status_code=403, detail="Only the host can reject members")
        if member.status != "pending":
            raise HTTPException(status_code=400, detail=f"Member is already {member.status}")

        member.status = "kicked"
        member.left_at = datetime.utcnow()

        await self.db.commit()
        return "Member rejected"

    async def cancel_join_request(self, club_id: UUID, user_id: int) -> str:
        """User cancels their own pending join request."""
        result = await self.db.execute(
            select(ClubMember)
            .where(ClubMember.club_id == club_id)
            .where(ClubMember.user_id == user_id)
            .where(ClubMember.status == "pending")
        )
        member = result.scalar_one_or_none()

        if not member:
            raise HTTPException(status_code=404, detail="No pending request found")

        member.status = "left"
        member.left_at = datetime.utcnow()

        await self.db.commit()
        return "Join request cancelled"

    async def remind_host_of_request(self, club_id: UUID, user: User) -> str:
        """Send a reminder notification to the host about pending join requests."""
        from src.domain.services.notification_service import NotificationService

        # Get club with host
        result = await self.db.execute(
            select(Club)
            .options(selectinload(Club.host), selectinload(Club.subscription))
            .where(Club.club_id == club_id)
            .where(Club.is_deleted == False)
        )
        club = result.scalar_one_or_none()

        if not club:
            raise HTTPException(status_code=404, detail="Club not found")

        # Ensure caller has a pending request
        member_result = await self.db.execute(
            select(ClubMember)
            .where(ClubMember.club_id == club_id)
            .where(ClubMember.user_id == user.user_id)
            .where(ClubMember.status == "pending")
        )
        if not member_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="No pending request to remind about")

        # Rate limit: only once per 6 hours (simple check via last_payment_at abuse — better: separate table)
        # For now, just send the notification
        user_name = user.first_name or user.username or f"User #{user.user_id}"
        service_name = club.subscription.service_name if club.subscription else "клуб"

        message = (
            f"🔔 <b>Напоминание о заявке</b>\n\n"
            f"Пользователь <b>{user_name}</b> ждёт одобрения заявки в ваш клуб <b>{service_name}</b>.\n\n"
            f"Откройте приложение, чтобы рассмотреть заявку."
        )

        await NotificationService.send_to_user(club.host_id, message)
        return "Reminder sent to host"

    async def delete_club(self, club_id: UUID, host_id: int):
        club_result = await self.db.execute(select(Club).where(Club.club_id == club_id))
        club = club_result.scalar_one_or_none()

        if not club:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

        # Either host or admin (for open testing we can just delete)
        if club.host_id != host_id:
            # allow for testing? let's stick to reality or at least logging
            pass # Currently allowing any admin action as you asked

        from sqlalchemy import delete
        await self.db.execute(delete(ClubMember).where(ClubMember.club_id == club_id))

        await self.db.delete(club)
        await self.db.commit()
        return "Club completely deleted"


