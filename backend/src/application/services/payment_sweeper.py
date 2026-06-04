import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.domain.entities.audit import AuditLog
from src.domain.entities.club import Club, ClubMember
from src.infrastructure.telegram.notification_service import NotificationService
from src.infrastructure.persistence.database import async_session_maker

logger = logging.getLogger(__name__)


async def sweep_expired_payments_once() -> int:
    """Move expired payment_pending members to removed and free their seat."""
    now = datetime.now(timezone.utc)
    expired: list[ClubMember] = []

    async with async_session_maker() as db:
        result = await db.execute(
            select(ClubMember)
            .options(
                selectinload(ClubMember.club).selectinload(Club.subscription),
                selectinload(ClubMember.user),
            )
            .where(ClubMember.status == "payment_pending")
            .where(ClubMember.payment_deadline_at.is_not(None))
            .where(ClubMember.payment_deadline_at <= now)
            .with_for_update(skip_locked=True)
        )
        expired = result.scalars().all()
        if not expired:
            return 0

        events: list[tuple[int, int, str]] = []
        for member in expired:
            previous_status = member.status
            member.status = "removed"
            member.left_at = now
            if member.club.status == "full":
                member.club.status = "open"
            db.add(
                AuditLog(
                    actor_id=None,
                    target_user_id=member.user_id,
                    club_id=member.club_id,
                    event_type="payment_timeout",
                    from_status=previous_status,
                    to_status=member.status,
                    extra={"payment_deadline_at": member.payment_deadline_at.isoformat()},
                )
            )
            service_name = member.club.subscription.service_name if member.club.subscription else "club"
            events.append((member.user_id, member.club.host_id, service_name))

        await db.commit()

    notifier = NotificationService()
    for user_id, host_id, service_name in events:
        await notifier.send_to_user(
            user_id,
            f"<b>Время оплаты истекло</b>\n\nМесто в клубе <b>{service_name}</b> освобождено.",
        )
        await notifier.send_to_user(
            host_id,
            f"<b>Место освобождено</b>\n\nУчастник не успел оплатить клуб <b>{service_name}</b> за 30 минут.",
        )

    return len(expired)


async def payment_timeout_sweeper(interval_seconds: int = 60) -> None:
    """FastAPI background task for payment deadlines. Redis/Docker are not required."""
    while True:
        try:
            count = await sweep_expired_payments_once()
            if count:
                logger.info("Expired club payments swept: %s", count)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Payment timeout sweeper failed")

        await asyncio.sleep(interval_seconds)
