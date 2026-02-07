# 📋 Phase 3: Implementation Plan - Gemini Vision Integration

**Feature**: Payment Screenshot Verification
**Date**: 2026-02-07  
**Status**: Phase 3 Complete
**Estimated Time**: 8-12 hours
**Complexity**: Medium-High

---

## 🎯 Implementation Tasks

### Sprint 1: Backend Foundation (4-5 hours)

#### Task 1.1: Environment Setup (30 min)

- [ ] Install dependencies: `google-generativeai`, `pillow`, `python-multipart`
- [ ] Add `GEMINI_API_KEY` to `.env.example`
- [ ] Update `config.py` with Gemini settings
- [ ] Test Gemini API connection

**Files**:

- `backend/requirements.txt`
- `backend/.env.example`
- `backend/src/config.py`

**Acceptance Criteria**:

- ✅ Dependencies installed
- ✅ Config loads successfully
- ✅ Gemini API test call succeeds

---

#### Task 1.2: Vision Service Implementation (2 hours)

- [ ] Create `backend/src/domain/services/vision_service.py`
- [ ] Implement `PaymentInfo` dataclass
- [ ] Implement `VisionService.analyze_payment_screenshot()`
- [ ] Add image validation logic
- [ ] Create unit tests

**Code Template**:

```python
from dataclasses import dataclass
from decimal import Decimal
import google.generativeai as genai
from PIL import Image
import io

@dataclass
class PaymentInfo:
    amount: Decimal
    currency: str
    recipient: str
    payment_method: str
    confidence_score: float
    # ... other fields

class VisionService:
    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash-exp"):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
    
    async def analyze_payment_screenshot(
        self, 
        image_data: bytes,
        expected_amount: Decimal | None = None
    ) -> PaymentInfo:
        # Validate image
        image = self._validate_image(image_data)
        
        # Create prompt
        prompt = self._build_prompt(expected_amount)
        
        # Call Gemini API
        response = await self.model.generate_content([prompt, image])
        
        # Parse response
        payment_info = self._parse_response(response)
        
        return payment_info
```

**Acceptance Criteria**:

- ✅ Service initializes correctly
- ✅ Can analyze test screenshot
- ✅ Returns structured PaymentInfo
- ✅ Unit tests pass (>80% coverage)

---

#### Task 1.3: Database Migration (1 hour)

- [ ] Create Alembic migration: `add_payment_verification_to_deals`
- [ ] Add verification fields to `deals` table
- [ ] Create indexes
- [ ] Test migration up/down

**Migration Script**:

```python
# migrations/versions/xxxx_add_payment_verification.py

def upgrade():
    # Create enum
    op.execute("CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed', 'disputed')")
    
    # Add columns
    op.add_column('deals', sa.Column('payment_screenshot_url', sa.String(500)))
    op.add_column('deals', sa.Column('verification_status', sa.Enum('verification_status')))
    op.add_column('deals', sa.Column('verification_data', JSONB))
    op.add_column('deals', sa.Column('verification_confidence', sa.Float()))
    op.add_column('deals', sa.Column('verified_at', sa.TIMESTAMP(timezone=True)))
    
    # Add indexes
    op.create_index('idx_deals_verification_status', 'deals', ['verification_status'])

def downgrade():
    # Drop columns and enum
    op.drop_column('deals', 'verified_at')
    # ... etc
```

**Acceptance Criteria**:

- ✅ Migration runs successfully
- ✅ All indexes created
- ✅ Rollback works
- ✅ No data loss

---

#### Task 1.4: Deal Model & Repository (1.5 hours)

- [ ] Create `Deal` SQLAlchemy model
- [ ] Create `DealRepository` with CRUD methods
- [ ] Add relationship to `User` and `Listing` models
- [ ] Write repository tests

**Model Template**:

```python
# backend/src/domain/models.py

class Deal(Base):
    __tablename__ = "deals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    listing_id = Column(UUID, ForeignKey("listings.id"))
    buyer_id = Column(UUID, ForeignKey("users.id"))
    seller_id = Column(UUID, ForeignKey("users.id"))
    amount = Column(Numeric(10, 2))
    status = Column(Enum(DealStatus))
    payment_screenshot_url = Column(String(500))
    verification_status = Column(Enum(VerificationStatus))
    verification_data = Column(JSONB)
    verification_confidence = Column(Float)
    verified_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**Acceptance Criteria**:

- ✅ Model defined correctly
- ✅ Relationships work
- ✅ Repository CRUD operations work
- ✅ Tests pass

---

#### Task 1.5: API Endpoints (1 hour)

- [ ] Create `backend/src/api/deals.py`
- [ ] Implement `POST /deals/{id}/verify-payment`
- [ ] Implement file upload handling
- [ ] Add request/response schemas
- [ ] Add API tests

**Endpoint Template**:

```python
@router.post("/{deal_id}/verify-payment")
async def verify_payment(
    deal_id: UUID,
    screenshot: UploadFile,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # 1. Validate deal exists and user is buyer
    deal = await deal_repo.get(deal_id)
    if not deal or deal.buyer_id != tg_user.user_id:
        raise HTTPException(403, "Forbidden")
    
    # 2. Validate file
    if screenshot.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Invalid file type")
    
    # 3. Read image data
    image_data = await screenshot.read()
    
    # 4. Call vision service
    payment_info = await vision_service.analyze_payment_screenshot(
        image_data, 
        expected_amount=deal.amount
    )
    
    # 5. Update deal
    deal.verification_status = "verified" if payment_info.confidence_score > 0.8 else "failed"
    deal.verification_data = asdict(payment_info)
    deal.verified_at = datetime.now(UTC)
    await db.commit()
    
    return {"status": "success", "data": payment_info}
```

**Acceptance Criteria**:

- ✅ Endpoint accepts file upload
- ✅ Calls vision service correctly
- ✅ Updates deal status
- ✅ Returns proper response
- ✅ API tests pass

---

### Sprint 2: Frontend Integration (3-4 hours)

#### Task 2.1: API Client (30 min)

- [ ] Create `frontend/src/features/deals/api/dealsApi.ts`
- [ ] Implement `verifyPayment()` function
- [ ] Add TypeScript types
- [ ] Add error handling

**Code Template**:

```typescript
import { client } from '@/shared/api/client';

export interface PaymentVerificationResponse {
  verification_id: string;
  is_verified: boolean;
  extracted_data: {
    amount: number;
    currency: string;
    recipient: string;
    confidence_score: number;
  };
  message: string;
  verified_at: string;
}

export const dealsApi = {
  verifyPayment: async (dealId: string, screenshot: File): Promise<PaymentVerificationResponse> => {
    const formData = new FormData();
    formData.append('screenshot', screenshot);
    
    const response = await client.post(`/deals/${dealId}/verify-payment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
};
```

**Acceptance Criteria**:

- ✅ API function works
- ✅ Types are correct
- ✅ Error handling implemented

---

#### Task 2.2: Payment Upload Component (2 hours)

- [ ] Create `PaymentUpload.tsx`
- [ ] Implement file picker
- [ ] Add image preview
- [ ] Add upload progress
- [ ] Add success/error states

**Component Template**:

```typescript
import { FC, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { FileUpload } from '@/shared/ui/FileUpload';
import { dealsApi } from '../api/dealsApi';

interface PaymentUploadProps {
  dealId: string;
  onSuccess: () => void;
}

export const PaymentUpload: FC<PaymentUploadProps> = ({ dealId, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const result = await dealsApi.verifyPayment(dealId, selectedFile);
      
      if (result.is_verified) {
        onSuccess();
      } else {
        setError('Verification failed. Please check your screenshot.');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-4">
      <FileUpload
        accept="image/png,image/jpeg,image/webp"
        onChange={setSelectedFile}
        maxSize={5 * 1024 * 1024} // 5MB
      />
      
      {selectedFile && (
        <div className="preview">
          <img 
            src={URL.createObjectURL(selectedFile)} 
            alt="Screenshot preview"
            className="max-w-full h-auto rounded"
          />
        </div>
      )}
      
      <Button 
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        loading={isUploading}
      >
        {isUploading ? 'Verifying...' : 'Upload Payment'}
      </Button>
      
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};
```

**Acceptance Criteria**:

- ✅ File picker works
- ✅ Preview displays correctly
- ✅ Upload triggers verification
- ✅ Loading state shows
- ✅ Error handling works

---

#### Task 2.3: Verification Status Component (1 hour)

- [ ] Create `VerificationStatus.tsx`
- [ ] Design status UI (pending/verified/failed)
- [ ] Add extracted data display
- [ ] Add retry button for failed verifications

**Acceptance Criteria**:

- ✅ Shows correct status
- ✅ Displays extracted data
- ✅ Retry button works

---

#### Task 2.4: Integration with Deal Flow (30 min)

- [ ] Add upload step to deal creation flow
- [ ] Update deal detail page
- [ ] Add verification badge to deal list

**Acceptance Criteria**:

- ✅ Upload integrated into flow
- ✅ Status visible on detail page
- ✅ Badge shows in list

---

### Sprint 3: Testing & Polish (1-2 hours)

#### Task 3.1: End-to-End Testing (1 hour)

- [ ] Test complete flow: upload → verify → update status
- [ ] Test with real screenshots (Kaspi, Halyk, Jusan)
- [ ] Test edge cases (corrupted image, wrong format)
- [ ] Performance testing (response time)

**Test Scenarios**:

1. ✅ Valid Kaspi screenshot → Success
2. ✅ Valid Halyk screenshot → Success
3. ✅ Invalid format (PDF) → Error
4. ✅ Corrupted image → Error
5. ✅ Wrong amount → Verification fails

**Acceptance Criteria**:

- ✅ All scenarios pass
- ✅ < 3 sec response time
- ✅ > 90% accuracy

---

#### Task 3.2: Security Review (30 min)

- [ ] Review file upload security
- [ ] Test rate limiting
- [ ] Check API key protection
- [ ] Verify error messages don't leak sensitive info

**Security Checklist**:

- ✅ File size limited
- ✅ File type validated
- ✅ Rate limiting active
- ✅ API key in env only
- ✅ Error messages safe

---

#### Task 3.3: Documentation (30 min)

- [ ] Update API documentation
- [ ] Add code comments
- [ ] Create user guide
- [ ] Update PROJECT_MEMORY.md

**Documentation**:

- ✅ API docs updated
- ✅ Inline comments added
- ✅ User guide created
- ✅ Memory updated

---

## 🚧 Potential Blockers

| Blocker | Impact | Mitigation |
|---------|--------|------------|
| Gemini API rate limits | High | Implement caching, batch requests |
| Low accuracy on some banks | Medium | Fine-tune prompt, add fallback manual review |
| File upload size limits | Low | Compress images on client side |
| Slow response time | Medium | Optimize image size, use faster model |

---

## 📊 Success Criteria

### Functional

- ✅ Users can upload payment screenshots
- ✅ System extracts payment info accurately (>90%)
- ✅ Deal status updates automatically
- ✅ Trust scores updated on verification

### Non-Functional

- ✅ Response time < 3 seconds
- ✅ 99% uptime
- ✅ Cost < $0.01 per verification
- ✅ Security vulnerabilities = 0

---

## 📅 Timeline

| Sprint | Tasks | Estimated Time | Deadline |
|--------|-------|----------------|----------|
| Sprint 1 | Backend (Tasks 1.1-1.5) | 4-5 hours | Day 1 |
| Sprint 2 | Frontend (Tasks 2.1-2.4) | 3-4 hours | Day 1-2 |
| Sprint 3 | Testing & Polish (Tasks 3.1-3.3) | 1-2 hours | Day 2 |
| **Total** | | **8-12 hours** | **2 days** |

---

**Next Phase**: Implementation (Sprint 1 Start)
**First Task**: Task 1.1 - Environment Setup
