import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.entities.base import Base, SoftDeleteMixin

if TYPE_CHECKING:
    from src.domain.entities.user import User

class GigabyteOffer(Base, SoftDeleteMixin):
    """Offer to sell mobile data (GB)."""
    __tablename__ = "gigabyte_offers"
    
    offer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    
    operator: Mapped[str] = mapped_column(String(50), nullable=False)  # Beeline, Tele2, etc.
    amount_gb: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    seller: Mapped["User"] = relationship()


class AccountOffer(Base, SoftDeleteMixin):
    """Offer to sell a digital account (Steam, VPN, etc.)."""
    __tablename__ = "account_offers"
    
    offer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    service_category: Mapped[str] = mapped_column(String(50), nullable=False)  # Gaming, VPN, Streaming, Other
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    seller: Mapped["User"] = relationship()
