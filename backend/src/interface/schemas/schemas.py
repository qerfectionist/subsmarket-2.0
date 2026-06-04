"""Pydantic schemas for API requests/responses."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


# ============================================
# User Schemas
# ============================================

class UserBase(BaseModel):
    """Base user data."""
    user_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None


class UserResponse(UserBase):
    """User response with stats."""
    trust_score: Decimal = Field(default=Decimal("5.0"))
    p2p_deals_count: int = 0
    p2p_success_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Subscription Schemas
# ============================================

class SubscriptionResponse(BaseModel):
    """Subscription service response."""
    subscription_id: UUID
    service_name: str
    service_name_kk: Optional[str] = None
    category: str  # 'digital' | 'telecom'
    icon_url: Optional[str] = None
    max_members: int
    official_price: Optional[Decimal] = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Club Schemas
# ============================================

class ClubBase(BaseModel):
    """Base club data."""
    subscription_id: Optional[UUID] = None
    service_id: Optional[str] = None  # New system ID (e.g. 'netflix')
    price_total: Decimal
    max_members: int = Field(ge=2, le=10)
    payment_method: str = "kaspi"
    payment_details: Optional[str] = None
    payment_day: Optional[int] = Field(default=None, ge=1, le=31)
    description: Optional[str] = Field(default=None, max_length=500)
    rules: Optional[str] = Field(default=None, max_length=1000)
    
    # Validation settings
    approval_mode: str = "manual"  # manual | auto
    min_trust_score: Optional[Decimal] = Field(default=None, ge=0, le=5)


class ClubCreate(ClubBase):
    """Create club request."""
    pass


class ClubUpdate(BaseModel):
    """Update club request."""
    price_total: Optional[Decimal] = None
    payment_day: Optional[int] = Field(default=None, ge=1, le=31)
    description: Optional[str] = Field(default=None, max_length=500)
    rules: Optional[str] = Field(default=None, max_length=1000)
    approval_mode: Optional[str] = None
    min_trust_score: Optional[Decimal] = Field(default=None, ge=0, le=5)


class ClubListItem(BaseModel):
    """Club in list response."""
    club_id: UUID
    host_id: int
    subscription: SubscriptionResponse
    category: str
    price_total: Decimal
    price_per_member: Decimal
    max_members: int
    current_members: int = 0
    status: str
    description: Optional[str] = None
    created_at: datetime
    approval_mode: str = "manual"  # Expose to list so UI can show badge
    
    model_config = ConfigDict(from_attributes=True)


class ClubDetails(ClubListItem):
    """Full club details (for members only)."""
    host: UserResponse
    # Credentials removed - No Escrow policy
    payment_method: str
    payment_details: Optional[str] = None
    payment_day: Optional[int] = None
    rules: Optional[str] = None
    telegram_group_link: Optional[str] = None
    min_trust_score: Optional[Decimal] = None  # Specific detail
    my_status: Optional[str] = None  # 'pending' | 'active' | 'approved' | 'left' | null


# ============================================
# Club Member Schemas
# ============================================


# ... existing schemas

class JoinRequest(BaseModel):
    """Request body for joining a club."""
    phone_number: Optional[str] = None


class ClubMemberResponse(BaseModel):
    """Club member info."""
    member_id: UUID
    user: UserResponse
    status: str
    phone_number: Optional[str] = None  # Added
    joined_at: datetime
    last_payment_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Generic Schemas
# ============================================

class StatusResponse(BaseModel):
    """Generic status response."""
    status: str
    message: str


class PaginatedResponse(BaseModel):
    """Paginated list response."""
    items: list
    total: int
    page: int
    per_page: int
    pages: int

# ============================================================================
# GIGABYTE MARKET SCHEMAS
# ============================================================================

class GigabyteOfferBase(BaseModel):
    operator: str
    amount_gb: int
    price: Decimal
    description: Optional[str] = None

class GigabyteOfferCreate(GigabyteOfferBase):
    """Schema for creating a new GB offer."""
    pass

class GigabyteOfferResponse(GigabyteOfferBase):
    offer_id: UUID
    seller_id: int
    created_at: datetime
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# ACCOUNT MARKET SCHEMAS
# ============================================================================

class AccountOfferBase(BaseModel):
    title: str
    service_category: str  # e.g., "Gaming", "VPN"
    price: Decimal
    description: str

class AccountOfferCreate(AccountOfferBase):
    pass

class AccountOfferResponse(AccountOfferBase):
    offer_id: UUID
    seller_id: int
    created_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
