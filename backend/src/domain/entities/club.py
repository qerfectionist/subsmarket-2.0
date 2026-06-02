import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import BigInteger, ForeignKey, Index, Integer, String, Text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.entities.base import Base, SoftDeleteMixin

if TYPE_CHECKING:
    from src.domain.entities.user import User
    from src.domain.entities.subscription import Subscription

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
    host_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
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
    
    # Configuration
    approval_mode: Mapped[str] = mapped_column(String(20), default="manual") # 'manual' or 'auto'
    min_trust_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True) # For auto-approve
    
    # Payment
    payment_method: Mapped[str] = mapped_column(String(50), default="kaspi")
    payment_details: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    payment_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Info
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rules: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    telegram_group_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    host: Mapped["User"] = relationship(back_populates="clubs_hosted")
    subscription: Mapped["Subscription"] = relationship(back_populates="clubs")
    members: Mapped[list["ClubMember"]] = relationship(back_populates="club")


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
        BigInteger, ForeignKey("users.user_id"), nullable=False
    )
    
    status: Mapped[str] = mapped_column(String(20), default="pending")
    
    # Telecom Requirement
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Payment tracking
    last_payment_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    next_payment_due: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    left_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    club: Mapped["Club"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="memberships")
