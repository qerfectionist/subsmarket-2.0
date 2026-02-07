from typing import Optional
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Boolean, DateTime

class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass

class SoftDeleteMixin:
    """Mixin for soft delete support."""
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
