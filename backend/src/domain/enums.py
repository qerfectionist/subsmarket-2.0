"""Domain models: Enums for business logic."""

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
    frozen = "frozen"       # Temporarily paused
    closed = "closed"       # Permanently closed


class ClubType(str, Enum):
    """Type of club/subscription."""
    digital = "digital"     # Netflix, Spotify, YouTube Premium
    telecom = "telecom"     # Beeline Family, Tele2, Altel


class MemberStatus(str, Enum):
    """Club membership status."""
    pending = "pending"         # Awaiting payment
    active = "active"           # Paid and active
    payment_due = "payment_due" # Payment reminder sent
    left = "left"               # Left voluntarily
    kicked = "kicked"           # Removed by host


class MobileOperator(str, Enum):
    """Mobile operators for GB Market."""
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
