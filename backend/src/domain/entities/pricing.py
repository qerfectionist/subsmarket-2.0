"""
Pricing Service entity for market benchmarks.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Boolean, Text, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from src.domain.entities.base import Base


class PricingService(Base):
    """Service with pricing benchmarks based on market analysis."""
    __tablename__ = "pricing_services"
    
    service_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False)  # streaming, cloud, education
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_kk: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    logo: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Family settings
    family_size: Mapped[int] = mapped_column(Integer, default=6)
    billing_cycle: Mapped[str] = mapped_column(String(20), default='monthly')  # monthly, yearly
    
    # Price benchmarks (in KZT)
    price_min: Mapped[int] = mapped_column(Integer, nullable=False)
    price_max: Mapped[int] = mapped_column(Integer, nullable=False)
    price_recommended: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Region settings
    regions: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String(10)), nullable=True)
    region_restriction: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Metadata
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    popularity: Mapped[int] = mapped_column(Integer, default=50)  # 0-100
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def is_price_fair(self, price: int) -> bool:
        """Check if a price is within fair market range."""
        return self.price_min <= price <= self.price_max
    
    def is_price_suspicious(self, price: int) -> bool:
        """Check if price is suspiciously low (potential scam)."""
        return price < self.price_min * 0.5


class TelecomOperator(Base):
    """Telecom operator for GB marketplace."""
    __tablename__ = "telecom_operators"
    
    operator_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    logo: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # GB pricing (per 1 GB in KZT)
    gb_price_min: Mapped[int] = mapped_column(Integer, nullable=False)
    gb_price_max: Mapped[int] = mapped_column(Integer, nullable=False)
    gb_price_recommended: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Minimum volume
    gb_min_volume: Mapped[int] = mapped_column(Integer, default=5)
    
    # Metadata
    popularity: Mapped[int] = mapped_column(Integer, default=50)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    def is_price_fair(self, price_per_gb: int) -> bool:
        """Check if GB price is within fair market range."""
        return self.gb_price_min <= price_per_gb <= self.gb_price_max
