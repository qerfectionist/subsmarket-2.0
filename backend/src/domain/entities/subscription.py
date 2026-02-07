import uuid
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Integer, String, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.domain.entities.base import Base

if TYPE_CHECKING:
    from src.domain.entities.club import Club

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
