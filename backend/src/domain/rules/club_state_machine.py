"""Club and membership status rules.

This module is intentionally framework-free: it knows nothing about FastAPI,
SQLAlchemy sessions, Telegram, or HTTP. Application services call these rules
before mutating persistence models.
"""

from dataclasses import dataclass


CLUB_OPEN = "open"
CLUB_FULL = "full"
CLUB_FROZEN = "frozen"
CLUB_CLOSED = "closed"
CLUB_DELETED = "deleted"

MEMBER_PENDING = "pending"
MEMBER_INVITED = "invited"
MEMBER_ACCESS_ISSUED = "access_issued"
MEMBER_PAYMENT_PENDING = "payment_pending"
MEMBER_PAYMENT_CLAIMED = "payment_claimed"
MEMBER_PAID = "paid"  # Legacy compatibility.
MEMBER_ACTIVE = "active"
MEMBER_APPROVED = "approved"
MEMBER_REJECTED = "rejected"
MEMBER_REMOVED = "removed"
MEMBER_DISPUTED = "disputed"
MEMBER_LEFT = "left"
MEMBER_KICKED = "kicked"

OCCUPIED_MEMBER_STATUSES = (
    MEMBER_ACCESS_ISSUED,
    MEMBER_PAYMENT_PENDING,
    MEMBER_PAYMENT_CLAIMED,
    MEMBER_ACTIVE,
)
PRIVATE_ACCESS_STATUSES = (
    MEMBER_ACCESS_ISSUED,
    MEMBER_PAYMENT_PENDING,
    MEMBER_PAYMENT_CLAIMED,
    MEMBER_ACTIVE,
)
VISIBLE_MEMBER_STATUSES = (
    MEMBER_INVITED,
    MEMBER_APPROVED,
    MEMBER_ACCESS_ISSUED,
    MEMBER_PAYMENT_PENDING,
    MEMBER_PAYMENT_CLAIMED,
    MEMBER_ACTIVE,
    MEMBER_DISPUTED,
)
ACTIVE_PAYMENT_STATUSES = (
    MEMBER_ACCESS_ISSUED,
    MEMBER_PAYMENT_PENDING,
    MEMBER_PAYMENT_CLAIMED,
    MEMBER_ACTIVE,
)
LIVE_MEMBER_STATUSES = (
    MEMBER_PENDING,
    MEMBER_INVITED,
    MEMBER_APPROVED,
    MEMBER_ACCESS_ISSUED,
    MEMBER_PAYMENT_PENDING,
    MEMBER_PAYMENT_CLAIMED,
    MEMBER_ACTIVE,
    MEMBER_DISPUTED,
)
HISTORICAL_MEMBER_STATUSES = (
    MEMBER_LEFT,
    MEMBER_KICKED,
    MEMBER_REJECTED,
    MEMBER_REMOVED,
)


@dataclass(frozen=True)
class ClubRuleViolation(Exception):
    """Domain rule failed."""

    message: str

    def __str__(self) -> str:
        return self.message


TRANSITIONS: dict[str, tuple[tuple[str, ...], str]] = {
    "approve": ((MEMBER_PENDING,), MEMBER_APPROVED),
    "issue_access": ((MEMBER_APPROVED,), MEMBER_PAYMENT_PENDING),
    "mark_paid": ((MEMBER_PAYMENT_PENDING,), MEMBER_PAYMENT_CLAIMED),
    "confirm_payment": ((MEMBER_PAYMENT_CLAIMED,), MEMBER_ACTIVE),
    "reject": ((MEMBER_PENDING, MEMBER_APPROVED), MEMBER_REJECTED),
    "cancel_request": ((MEMBER_PENDING,), MEMBER_LEFT),
    "payment_timeout": ((MEMBER_PAYMENT_PENDING,), MEMBER_REMOVED),
    "leave": (LIVE_MEMBER_STATUSES, MEMBER_LEFT),
    "dispute": (
        (
            MEMBER_ACCESS_ISSUED,
            MEMBER_PAYMENT_PENDING,
            MEMBER_PAYMENT_CLAIMED,
            MEMBER_ACTIVE,
        ),
        MEMBER_DISPUTED,
    ),
}


def require_club_mutable(club_status: str) -> None:
    if club_status == CLUB_FROZEN:
        raise ClubRuleViolation("Club is frozen because of a dispute")
    if club_status in {CLUB_CLOSED, CLUB_DELETED}:
        raise ClubRuleViolation("Club is closed")


def require_joinable(club_status: str) -> None:
    require_club_mutable(club_status)
    if club_status != CLUB_OPEN:
        raise ClubRuleViolation("Club is not accepting new members")


def transition(action: str, current_status: str) -> str:
    if action not in TRANSITIONS:
        raise ClubRuleViolation(f"Unknown member transition: {action}")

    allowed_from, target_status = TRANSITIONS[action]
    if current_status not in allowed_from:
        raise ClubRuleViolation(f"Cannot {action.replace('_', ' ')} from status {current_status}")
    return target_status


def occupies_seat(member_status: str) -> bool:
    return member_status in OCCUPIED_MEMBER_STATUSES


def has_private_access(member_status: str) -> bool:
    return member_status in PRIVATE_ACCESS_STATUSES


def is_visible_member(member_status: str) -> bool:
    return member_status in VISIBLE_MEMBER_STATUSES


def is_live_membership(member_status: str) -> bool:
    return member_status in LIVE_MEMBER_STATUSES
