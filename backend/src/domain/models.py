"""Domain models: SQLAlchemy ORM entities."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


class SoftDeleteMixin:
    """Mixin for soft delete support."""
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


# ============================================================================
# USER
# ============================================================================

class User(Base):
    """Telegram user (buyer/seller/host)."""
    __tablename__ = "users"
    
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)  # Telegram ID
    username: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Status & Trust
    status: Mapped[str] = mapped_column(String(20), default="active")
    trust_score: Mapped[Decimal] = mapped_column(Numeric(3, 2), default=Decimal("5.0"))
    scam_reports: Mapped[int] = mapped_column(Integer, default=0)
    
    # P2P Stats
    p2p_deals_count: Mapped[int] = mapped_column(Integer, default=0)
    p2p_success_count: Mapped[int] = mapped_column(Integer, default=0)
    p2p_total_volume_gb: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_active_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    clubs_hosted: Mapped[list["Club"]] = relationship(back_populates="host")
    memberships: Mapped[list["ClubMember"]] = relationship(back_populates="user")


# ============================================================================
# SUBSCRIPTION (Service catalog)
# ============================================================================

class Subscription(Base):
    """Available subscription services (Netflix, Spotify, Beeline Family, etc.)."""
    __tablename__ = "subscriptions"
    
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    service_name: Mapped[str] = mapped_column(String(100), nullable=False)
    service_name_kk: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # digital / telecom
    icon_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    max_members: Mapped[int] = mapped_column(Integer, default=6)
    official_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    clubs: Mapped[list["Club"]] = relationship(back_populates="subscription")


# ============================================================================
# CLUB (Family subscription group)
# ============================================================================

class Club(Base, SoftDeleteMixin):
    """Group for sharing subscriptions."""
    __tablename__ = "clubs"
    __table_args__ = (
        Index("ix_clubs_status", "status"),
        Index("ix_clubs_host_id", "host_id"),
        Index("ix_clubs_category", "category"),
    )
    
    club_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    # Relations
    host_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("subscriptions.subscription_id"), nullable=False
    )
    
    # Type: digital or telecom
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Pricing
    price_total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    price_per_member: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    max_members: Mapped[int] = mapped_column(Integer, default=4)
    
    # Status
    status: Mapped[str] = mapped_column(String(20), default="open")
    
    # Credentials (encrypted, only for digital clubs)
    login_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    password_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Payment
    payment_method: Mapped[str] = mapped_column(String(50), default="kaspi")
    payment_details: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    payment_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Info
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rules: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    telegram_group_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    host: Mapped["User"] = relationship(back_populates="clubs_hosted")
    subscription: Mapped["Subscription"] = relationship(back_populates="clubs")
    members: Mapped[list["ClubMember"]] = relationship(back_populates="club")


# ============================================================================
# CLUB MEMBER
# ============================================================================

class ClubMember(Base):
    """User membership in a club."""
    __tablename__ = "club_members"
    __table_args__ = (
        Index("ix_club_members_status", "status"),
    )
    
    member_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    club_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("clubs.club_id"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False
    )
    
    status: Mapped[str] = mapped_column(String(20), default="pending")
    
    # Payment tracking
    last_payment_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    next_payment_due: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    left_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    club: Mapped["Club"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="memberships")
