# 🔍 Phase 1: Discovery - Gemini Vision Integration

**Feature**: Payment Screenshot Verification using Gemini Vision API
**Date**: 2026-02-07
**Status**: Phase 1 Complete

---

## 📚 Current Codebase Analysis

### Architecture Overview

- **Pattern**: DDD (Domain Driven Design)
- **Backend**: FastAPI + Pydantic v2 + SQLAlchemy
- **Frontend**: React 19 + TypeScript + Vite + HeroUI
- **Database**: Neon PostgreSQL 17

### Relevant Files Identified

#### Backend Structure

```
backend/src/
├── api/
│   ├── clubs.py          # Club management endpoints
│   ├── gigabytes.py      # GB marketplace endpoints
│   ├── users.py        # User management
│   └── schemas.py        # Pydantic schemas
├── domain/
│   ├── models.py         # SQLAlchemy models
│   ├── enums.py          # Status enums
│   └── entities/         # Business entities
├── infrastructure/
│   └── telegram/         # Telegram WebApp auth
└── config.py             # Environment config
```

#### Key Endpoints (from clubs.py)

1. `POST /clubs` - Create club
2. `POST /clubs/{id}/join` - Join request
3. `GET /clubs/{id}/members` - View members
4. `DELETE /clubs/{id}/leave` - Leave club

### Business Rules (from PROJECT_MASTER.md)

- **No Escrow**: Platform NEVER handles money
- **P2P Model**: Buyer pays → Seller delivers → Both confirm
- **Trust System**: Rating changes based on transaction success
- **Payment Method**: Bank transfer (Kaspi, Halyk, Jusan)

---

## 🎯 Integration Points

### Need to create:

1. **Domain Service**: `vision_service.py`
   - Gemini Vision API client
   - Screenshot analysis logic
   - Payment info extraction

2. **API Endpoint**: `POST /deals/{id}/verify-payment`
   - Accept screenshot upload
   - Call vision service
   - Update deal status
   - Trigger trust score update

3. **Database Schema**: Add to existing models
   - `payment_screenshot_url` field
   - `verification_status` enum
   - `verified_at` timestamp

4. **Frontend Component**: `PaymentUpload.tsx`
   - File upload UI
   - Preview
   - Verification status display

---

## 📦 Dependencies Needed

### Backend

```python
google-generativeai>=0.3.0  # Gemini SDK
pillow>=10.0.0              # Image processing
python-multipart>=0.0.6     # File upload handling
```

### Environment Variables

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp  # Vision-capable model
```

---

## 🔗 Data Flow

```
[User uploads screenshot] 
    ↓
[Frontend: PaymentUpload.tsx]
    ↓ POST /deals/{id}/verify-payment
[Backend: deals.py]
    ↓
[Domain: vision_service.py]
    ↓ analyze_payment_screenshot()
[Gemini Vision API]
    ↓ Extract: amount, recipient, status
[vision_service.py returns PaymentInfo]
    ↓
[deals.py: update deal status]
    ↓
[Trust Service: update scores if successful]
    ↓
[Response: verification result]
```

---

## ⚠️ Security Considerations

1. **File Upload Validation**:
   - Max size: 5MB
   - Allowed formats: PNG, JPG, JPEG, WebP
   - Virus scanning (optional)

2. **API Key Protection**:
   - Store in environment variables
   - Never expose in frontend
   - Rotate keys regularly

3. **Rate Limiting**:
   - Limit verification requests per user
   - Prevent API quota abuse

4. **Data Privacy**:
   - Screenshots stored temporarily
   - Auto-delete after 7 days
   - GDPR compliance

---

## 📊 Success Metrics

- **Accuracy**: 95%+ correct payment info extraction
- **Speed**: < 3 seconds verification time
- **Reliability**: 99%+ uptime
- **Cost**: < $0.01 per verification

---

**Next Phase**: Architecture Design
