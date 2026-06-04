import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import BigInteger, ForeignKey, String, Numeric, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.entities.base import Base

if TYPE_CHECKING:
    from src.domain.entities.user import User
    from src.domain.entities.club import Club
    from src.domain.entities.market import GigabyteOffer, AccountOffer

class Deal(Base):
    """P2P transaction for Clubs, GBs, or Accounts."""
    __tablename__ = "deals"
    __table_args__ = (
        Index("ix_deals_status", "status"),
        Index("ix_deals_updated_at", "updated_at"),
        Index("ix_deals_buyer_id", "buyer_id"),
        Index("ix_deals_seller_id", "seller_id"),
    )
    
    deal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    buyer_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    seller_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    
    # Type of deal
    offer_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'gigabyte' | 'club' | 'account'
    
    # Links to specific offers (only one SHOULD be set)
    gb_offer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("gigabyte_offers.offer_id"), nullable=True
    )
    club_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("clubs.club_id"), nullable=True
    )
    account_offer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("account_offers.offer_id"), nullable=True
    )
    
    # Status Workflow
    # CREATED -> WAITING_PAYMENT -> PAID_BY_BUYER -> COMPLETED
    #                                            -> DISPUTED
    #         -> CANCELLED
    status: Mapped[str] = mapped_column(String(20), default="CREATED")
    
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Evidence (for deals or disputes)
    proof_screenshot_id: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    dispute_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # Logic for time checking
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    buyer: Mapped["User"] = relationship(foreign_keys=[buyer_id])
    seller: Mapped["User"] = relationship(foreign_keys=[seller_id])
    gb_offer: Mapped["GigabyteOffer"] = relationship()
    club: Mapped["Club"] = relationship()
    account_offer: Mapped["AccountOffer"] = relationship()
