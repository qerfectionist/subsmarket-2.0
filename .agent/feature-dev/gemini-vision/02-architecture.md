# 🏗️ Phase 2: Architecture - Gemini Vision Integration

**Feature**: Payment Screenshot Verification
**Date**: 2026-02-07
**Status**: Phase 2 Complete

---

## 📐 System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Telegram Mini App                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/TS)                      │
│                                                             │
│  ┌──────────────────┐  ┌─────────────────────────────┐   │
│  │ PaymentUpload.tsx│  │ VerificationStatus.tsx      │   │
│  │  - File picker   │  │  - Loading state            │   │
│  │  - Preview       │  │  - Success/Error display    │   │
│  │  - Submit        │  │  - Extracted data view      │   │
│  └──────────────────┘  └─────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ POST /api/deals/{id}/verify
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Layer                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ deals.py                                             │ │
│  │  @router.post("/{deal_id}/verify-payment")          │ │
│  │    1. Validate file                                  │ │
│  │    2. Upload to storage                              │ │
│  │    3. Call VisionService                             │ │
│  │    4. Update deal status                             │ │
│  │    5. Trigger trust update                           │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Domain Service Layer                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ vision_service.py                                    │ │
│  │                                                      │ │
│  │  class VisionService:                                │ │
│  │    def analyze_payment(screenshot) -> PaymentInfo   │ │
│  │    def validate_image(file) -> bool                 │ │
│  │    def extract_metadata(response) -> dict           │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Service                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Google Gemini Vision API                             │ │
│  │  - Model: gemini-2.0-flash-exp                       │ │
│  │  - Input: Payment screenshot image                   │ │
│  │  - Output: Structured payment data                   │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

### Backend

```
backend/src/
├── domain/
│   └── services/
│       └── vision_service.py       # NEW: Gemini Vision integration
│
├── api/
│   ├── deals.py                     # NEW: P2P deal endpoints
│   └── schemas.py                   # UPDATED: Add payment schemas
│
├── infrastructure/
│   └── storage/
│       └── file_storage.py          # NEW: Screenshot storage
│
└── config.py                        # UPDATED: Add Gemini config
```

### Frontend

```
frontend/src/
├── features/
│   └── deals/
│       ├── api/
│       │   └── dealsApi.ts          # NEW: Deal API calls
│       ├── components/
│       │   ├── PaymentUpload.tsx     # NEW: Upload component
│       │   └── VerificationStatus.tsx # NEW: Status display
│       └── types/
│           └── deal.ts               # NEW: Deal types
│
└── shared/
    └── ui/
        └── FileUpload.tsx            # REUSE: Existing component
```

---

## 📋 Interface Definitions

### Domain Models

```python
# backend/src/domain/services/vision_service.py

from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

@dataclass
class PaymentInfo:
    \"\"\"Extracted payment information from screenshot.\"\"\"
    amount: Decimal
    currency: str
    recipient: str
    sender: Optional[str]
    transaction_id: Optional[str]
    payment_method: str  # "kaspi", "halyk", "jusan", etc.
    timestamp: Optional[str]
    confidence_score: float  # 0.0 to 1.0

class VisionService:
    \"\"\"Service for analyzing payment screenshots.\"\"\"
    
    async def analyze_payment_screenshot(
        self, 
        image_data: bytes,
        expected_amount: Optional[Decimal] = None
    ) -> PaymentInfo:
        \"\"\"
        Analyze payment screenshot and extract structured data.
        
        Args:
            image_data: Raw image bytes
            expected_amount: Optional expected amount for validation
            
        Returns:
            PaymentInfo with extracted data
            
        Raises:
            InvalidImageError: If image is invalid/corrupted
            PaymentVerificationError: If payment data cannot be extracted
        \"\"\"
        pass
```

### API Schemas

```python
# backend/src/api/schemas.py

from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Optional
from uuid import UUID

class PaymentVerificationRequest(BaseModel):
    \"\"\"Request to verify payment screenshot.\"\"\"
    expected_amount: Optional[Decimal] = Field(None, description="Expected payment amount")

class PaymentVerificationResponse(BaseModel):
    \"\"\"Response with verification result.\"\"\"
    verification_id: UUID
    is_verified: bool
    extracted_data: dict
    confidence_score: float
    message: str
    verified_at: datetime

class DealCreate(BaseModel):
    \"\"\"Create new P2P deal.\"\"\"
    listing_id: UUID
    buyer_id: UUID
    seller_id: UUID
    amount: Decimal
    
class DealResponse(BaseModel):
    \"\"\"Deal response.\"\"\"
    id: UUID
    listing_id: UUID
    buyer_id: UUID
    seller_id: UUID
    amount: Decimal
    status: str  # "pending", "paid_by_buyer", "confirmed", "disputed"
    payment_screenshot_url: Optional[str]
    verification_status: Optional[str]
    created_at: datetime
    updated_at: datetime
```

---

## 🗄️ Database Schema Changes

### Migration: Add Payment Verification to Deals

```sql
-- Migration: 2026_02_07_add_payment_verification

CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed', 'disputed');

ALTER TABLE deals ADD COLUMN payment_screenshot_url VARCHAR(500);
ALTER TABLE deals ADD COLUMN verification_status verification_status DEFAULT 'pending';
ALTER TABLE deals ADD COLUMN verification_data JSONB;  -- Extracted payment info
ALTER TABLE deals ADD COLUMN verification_confidence FLOAT CHECK (verification_confidence BETWEEN 0 AND 1);
ALTER TABLE deals ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_deals_verification_status ON deals(verification_status);
CREATE INDEX idx_deals_verified_at ON deals(verified_at);
```

---

## 🔗 Integration Points

### 1. VisionService → Gemini API

```python
import google.generativeai as genai

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')
```

### 2. API → VisionService

```python
from src.domain.services.vision_service import VisionService

vision_service = VisionService()
payment_info = await vision_service.analyze_payment_screenshot(image_data)
```

### 3. Frontend → API

```typescript
const verifyPayment = async (dealId: string, screenshot: File) => {
  const formData = new FormData();
  formData.append('screenshot', screenshot);
  
  const response = await api.post(`/deals/${dealId}/verify-payment`, formData);
  return response.data;
};
```

---

## 🎯 Design Patterns

### 1. Service Layer Pattern

- `VisionService` encapsulates all Gemini API logic
- Domain logic separated from infrastructure

### 2. Repository Pattern

- `DealRepository` for database operations  
- Abstracts SQLAlchemy details

### 3. DTO Pattern

- `PaymentInfo` dataclass for domain data
- Pydantic schemas for API contracts

---

## ⚠️ Error Handling Strategy

### Exception Hierarchy

```python
class VisionServiceError(Exception):
    \"\"\"Base exception for vision service.\"\"\"

class InvalidImageError(VisionServiceError):
    \"\"\"Image is invalid or corrupted.\"\"\"

class PaymentVerificationError(VisionServiceError):
    \"\"\"Could not extract payment data.\"\"\"

class GeminiAPIError(VisionServiceError):
    \"\"\"Gemini API call failed.\"\"\"
```

### Error Responses

```python
# 400 Bad Request
{
  "error": {
    "code": "INVALID_IMAGE",
    "message": "The uploaded file is not a valid image",
    "details": {"format": "unsupported"}
  }
}

# 422 Unprocessable Entity  
{
  "error": {
    "code": "VERIFICATION_FAILED",
    "message": "Could not extract payment information from screenshot",
    "details": {"reason": "low_confidence", "score": 0.45}
  }
}

# 500 Internal Server Error
{
  "error": {
    "code": "GEMINI_API_ERROR",
    "message": "External service temporarily unavailable"
  }
}
```

---

## 🔐 Security Architecture

### 1. File Upload Security

- Size limit: 5MB max
- Type validation: PNG, JPG, JPEG, WebP only
- Content-Type verification
- Magic byte validation

### 2. API Key Management

- Stored in environment variables
- Never exposed to frontend
- Rotation policy: quarterly

### 3. Rate Limiting

- Per user: 10 verifications/hour
- Per IP: 50 verifications/hour
- Global: 1000 verifications/hour

### 4. Data Privacy

- Screenshots encrypted at rest
- Auto-delete after 7 days
- GDPR right-to-deletion support

---

**Next Phase**: Implementation Planning
