"""Domain models: Enums for business logic.

These enums are the single source of truth for allowed status values.
They MUST stay in sync with `domain/rules/club_state_machine.py`.
"""

from enum import Enum


class UserStatus(str, Enum):
    """User account status."""
    active = "active"
    banned = "banned"
    suspended = "suspended"


class ClubStatus(str, Enum):
    """Club lifecycle status."""
    open = "open"           # Accepting new members
    full = "full"           # Max members reached
    frozen = "frozen"       # Temporarily paused (dispute)
    closed = "closed"       # Permanently closed
    deleted = "deleted"     # Soft-deleted


class MemberStatus(str, Enum):
    """Club membership status — full lifecycle.

    Transition graph (see club_state_machine.py for authoritative rules):
        pending → approved → access_issued → payment_pending → payment_claimed → active
        pending → rejected
        pending → left (cancel_request)
        * → left (voluntary leave)
        * → disputed → (resolved externally)
        payment_pending → removed (timeout)
    """
    pending = "pending"                   # Awaiting host approval
    invited = "invited"                   # Host approved, pre-access
    approved = "approved"                 # Legacy compatibility (≈ invited)
    access_issued = "access_issued"       # Host shared credentials / access
    payment_pending = "payment_pending"   # Access given, awaiting payment
    payment_claimed = "payment_claimed"   # User marked payment sent, host must verify manually
    paid = "paid"                         # Legacy compatibility
    active = "active"                     # Host confirmed payment
    disputed = "disputed"                 # Under dispute, club frozen
    rejected = "rejected"                 # Host rejected join request
    removed = "removed"                   # Removed by system (e.g. timeout)
    left = "left"                         # Left voluntarily
    kicked = "kicked"                     # Removed by host


class ClubCategory(str, Enum):
    """Type of club / subscription."""
    digital = "digital"     # Netflix, Spotify, YouTube Premium
    telecom = "telecom"     # Beeline Family, Tele2, Altel


# Backward-compatible export expected by domain.__init__.
ClubType = ClubCategory


class MobileOperator(str, Enum):
    """Mobile operators for GB Market.

    NOTE: Altel is excluded from GB Market per business rules,
    but kept here for telecom club tariffs.
    """
    beeline = "beeline"
    activ = "activ"
    tele2 = "tele2"
    altel = "altel"
    izi = "izi"


class P2POfferStatus(str, Enum):
    """GB offer status."""
    active = "active"
    paused = "paused"
    sold_out = "sold_out"
    cancelled = "cancelled"


class P2PTransactionStatus(str, Enum):
    """P2P transaction lifecycle."""
    pending = "pending"         # Created, awaiting payment
    paid = "paid"               # Buyer marked as paid
    confirmed = "confirmed"     # Seller confirmed payment
    gb_sent = "gb_sent"         # GB transferred
    completed = "completed"     # Both parties confirmed
    disputed = "disputed"       # Under dispute
    cancelled = "cancelled"     # Cancelled by either party
    expired = "expired"         # Timed out
