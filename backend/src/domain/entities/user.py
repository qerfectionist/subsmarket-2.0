from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Index, Integer, String, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.entities.base import Base

if TYPE_CHECKING:
    from src.domain.entities.club import Club, ClubMember

class User(Base):
    """Telegram user (buyer/seller/host)."""
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_username", "username"),
    )
    
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
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_active_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    clubs_hosted: Mapped[list["Club"]] = relationship(back_populates="host")
    memberships: Mapped[list["ClubMember"]] = relationship(back_populates="user")
