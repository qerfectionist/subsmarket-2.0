"""
Trust-related entities: TrustEvent, Complaint.
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import BigInteger, ForeignKey, Index, Integer, String, Text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.entities.base import Base

if TYPE_CHECKING:
    from src.domain.entities.user import User
    from src.domain.entities.deal import Deal


class TrustEvent(Base):
    """Audit trail for trust score changes."""
    __tablename__ = "trust_events"
    __table_args__ = (
        Index("ix_trust_events_user_id", "user_id"),
        Index("ix_trust_events_event_type", "event_type"),
        Index("ix_trust_events_created_at", "created_at"),
    )
    
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    
    # Event details
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Event types: deal_completed, complaint_confirmed, complaint_rejected,
    #              seller_cancellation, fraud_ban, rating_boosted
    
    score_change: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False)
    score_before: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False)
    score_after: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False)
    
    related_deal_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user: Mapped["User"] = relationship()


class Complaint(Base):
    """User complaint about another user."""
    __tablename__ = "complaints"
    __table_args__ = (
        Index("ix_complaints_status", "status"),
        Index("ix_complaints_target_id", "target_id"),
    )
    
    complaint_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    reporter_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    target_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    deal_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("deals.deal_id"), nullable=True
    )
    
    # Complaint details
    reason: Mapped[str] = mapped_column(String(50), nullable=False)
    # Reasons: fraud, non_payment, spam, fake_listing, no_delivery, other
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evidence_urls: Mapped[Optional[list[str]]] = mapped_column(ARRAY(Text), nullable=True)
    
    # Resolution
    status: Mapped[str] = mapped_column(String(20), default="pending")
    # Statuses: pending, investigating, confirmed, rejected
    resolved_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=True)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    reporter: Mapped["User"] = relationship(foreign_keys=[reporter_id])
    target: Mapped["User"] = relationship(foreign_keys=[target_id])
    deal: Mapped[Optional["Deal"]] = relationship()


class JoinRequest(Base):
    """Request to join a club."""
    __tablename__ = "join_requests"
    __table_args__ = (
        Index("ix_join_requests_status", "status"),
        Index("ix_join_requests_club_id", "club_id"),
    )
    
    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    club_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("clubs.club_id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    # Statuses: pending, approved, rejected
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
