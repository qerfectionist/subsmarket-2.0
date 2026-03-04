"""
Trust System API endpoints.

Manages trust scores, complaints, and join requests.
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Body, UploadFile, File
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure import get_db
from src.infrastructure.telegram.auth import get_current_user, TelegramUser
from src.domain.entities.user import User
from src.domain.entities.trust import TrustEvent, Complaint, JoinRequest
from src.domain.entities.club import Club
from src.domain.services.trust_service import TrustService
from src.domain.services.ai_service import AIService


router = APIRouter(prefix="/trust", tags=["trust"])


@router.post("/verify-proof", summary="Verify payment proof with AI")
async def verify_proof(
    file: UploadFile = File(...),
    current_user: TelegramUser = Depends(get_current_user)
):
    """
    AI Analyze payment receipt image.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    content = await file.read()
    
    ai_service = AIService()
    result = await ai_service.analyze_receipt(content)
    
    return result


# === Pydantic Schemas ===

class ComplaintCreateRequest(BaseModel):
    """Request to create a complaint."""
    target_id: int = Field(..., description="User ID of the target")
    deal_id: Optional[uuid.UUID] = Field(None, description="Related deal ID")
    reason: str = Field(..., description="Reason: fraud, non_payment, spam, fake_listing, no_delivery, other")
    description: Optional[str] = Field(None, description="Detailed description")
    evidence_urls: Optional[list[str]] = Field(None, description="URLs to evidence screenshots")


class JoinRequestCreate(BaseModel):
    """Request to join a club."""
    club_id: uuid.UUID
    message: Optional[str] = Field(None, max_length=500)


class JoinRequestAction(BaseModel):
    """Action on a join request."""
    action: str = Field(..., description="approve or reject")


# === Trust Score Endpoints ===

@router.get("/score/{user_id}")
async def get_trust_score(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get trust score and badges for a user.
    """
    query = select(User).where(User.user_id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate badge based on deals and score
    deals = user.p2p_deals_count
    score = float(user.trust_score)
    
    badges = []
    
    # Newbie
    if deals == 0:
        badges.append({"id": "newbie", "name": "Новичок", "icon": "🆕"})
    
    # Verified (10+ deals, 4.5+ score)
    if deals >= 10 and score >= 4.5:
        badges.append({"id": "verified", "name": "Проверенный", "icon": "✅"})
    
    # Experienced (50+ deals)
    if deals >= 50 and score >= 4.5:
        badges.append({"id": "experienced", "name": "Опытный продавец", "icon": "🥉"})
    
    # Gold (100+ deals, 4.8+ score)
    if deals >= 100 and score >= 4.8:
        badges.append({"id": "gold", "name": "Золотой продавец", "icon": "🥇"})
    
    # Platinum (500+ deals, 5.0 score)
    if deals >= 500 and score >= 5.0:
        badges.append({"id": "platinum", "name": "Платиновый продавец", "icon": "💎"})
    
    return {
        "user_id": user_id,
        "trust_score": score,
        "deals_count": deals,
        "success_rate": (
            round(user.p2p_success_count / deals * 100, 1) if deals > 0 else 100.0
        ),
        "scam_reports": user.scam_reports,
        "badges": badges,
        "status": user.status,
        "member_since": user.created_at.isoformat() if user.created_at else None,
    }


@router.get("/score/{user_id}/history")
async def get_trust_history(
    user_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Get trust score change history for a user.
    """
    query = (
        select(TrustEvent)
        .where(TrustEvent.user_id == user_id)
        .order_by(TrustEvent.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    
    result = await db.execute(query)
    events = result.scalars().all()
    
    return {
        "user_id": user_id,
        "events": [
            {
                "event_id": str(e.event_id),
                "event_type": e.event_type,
                "score_change": float(e.score_change),
                "score_before": float(e.score_before),
                "score_after": float(e.score_after),
                "notes": e.notes,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in events
        ],
        "count": len(events),
    }


# === Complaints Endpoints ===

@router.post("/complaints")
async def create_complaint(
    request: ComplaintCreateRequest,
    tg_user: TelegramUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new complaint against a user.
    Reporter is determined from authenticated Telegram user.
    """
    reporter_id = tg_user.id

    # Prevent self-complaint
    if reporter_id == request.target_id:
        raise HTTPException(status_code=400, detail="Cannot file a complaint against yourself")

    # Validate reporter exists
    reporter = await db.get(User, reporter_id)
    if not reporter:
        raise HTTPException(status_code=404, detail="Reporter not found")
    
    # Validate target exists
    target = await db.get(User, request.target_id)
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found")
    
    # Check for duplicate complaint
    existing = await db.execute(
        select(Complaint)
        .where(
            Complaint.reporter_id == reporter_id,
            Complaint.target_id == request.target_id,
            Complaint.status == "pending",
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already have a pending complaint against this user")
    
    # Valid reasons
    valid_reasons = ["fraud", "non_payment", "spam", "fake_listing", "no_delivery", "other"]
    if request.reason not in valid_reasons:
        raise HTTPException(status_code=400, detail=f"Invalid reason. Must be one of: {valid_reasons}")
    
    complaint = Complaint(
        reporter_id=reporter_id,
        target_id=request.target_id,
        deal_id=request.deal_id,
        reason=request.reason,
        description=request.description,
        evidence_urls=request.evidence_urls,
        status="pending",
    )
    
    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)
    
    return {
        "complaint_id": str(complaint.complaint_id),
        "status": "pending",
        "message": "Жалоба отправлена на рассмотрение",
    }


@router.get("/complaints")
async def list_complaints(
    tg_user: TelegramUser = Depends(get_current_user),
    user_id: Optional[int] = Query(None, description="Filter by reporter or target"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    List complaints (filtered by user or status).
    Requires authentication. Regular users can only see their own complaints.
    """
    from src.config import get_settings
    settings = get_settings()
    is_admin = tg_user.id in settings.admin_ids

    query = select(Complaint).order_by(Complaint.created_at.desc())

    # Non-admins can only see complaints they are involved in
    if not is_admin:
        effective_user_id = user_id if user_id == tg_user.id else tg_user.id
        query = query.where(
            (Complaint.reporter_id == effective_user_id) | (Complaint.target_id == effective_user_id)
        )
    elif user_id:
        query = query.where(
            (Complaint.reporter_id == user_id) | (Complaint.target_id == user_id)
        )
    
    if status_filter:
        query = query.where(Complaint.status == status_filter)
    
    query = query.limit(limit).offset(offset)
    
    result = await db.execute(query)
    complaints = result.scalars().all()
    
    return {
        "complaints": [
            {
                "complaint_id": str(c.complaint_id),
                "reporter_id": c.reporter_id,
                "target_id": c.target_id,
                "reason": c.reason,
                "status": c.status,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in complaints
        ],
        "count": len(complaints),
    }


# === Join Requests Endpoints ===

@router.post("/join-requests")
async def create_join_request(
    request: JoinRequestCreate,
    tg_user: TelegramUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a request to join a club.
    User is determined from authenticated Telegram user.
    """
    user_id = tg_user.id

    # Validate user exists
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate club exists
    club = await db.get(Club, request.club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Check if user is already a member or has pending request
    existing = await db.execute(
        select(JoinRequest)
        .where(
            JoinRequest.club_id == request.club_id,
            JoinRequest.user_id == user_id,
            JoinRequest.status == "pending",
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already have a pending request for this club")
    
    join_request = JoinRequest(
        club_id=request.club_id,
        user_id=user_id,
        message=request.message,
        status="pending",
    )
    
    db.add(join_request)
    await db.commit()
    await db.refresh(join_request)
    
    return {
        "request_id": str(join_request.request_id),
        "club_id": str(request.club_id),
        "status": "pending",
        "message": "Заявка отправлена хосту",
    }


@router.get("/join-requests/club/{club_id}")
async def get_club_join_requests(
    club_id: uuid.UUID,
    tg_user: TelegramUser = Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all join requests for a club.
    Only the club host can view join requests.
    """
    # Verify requester is the club host
    club = await db.get(Club, club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    if club.host_id != tg_user.id:
        raise HTTPException(status_code=403, detail="Only the club host can view join requests")

    query = (
        select(JoinRequest)
        .where(JoinRequest.club_id == club_id)
        .order_by(JoinRequest.created_at.desc())
    )
    
    if status_filter:
        query = query.where(JoinRequest.status == status_filter)
    
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    requests = result.scalars().all()
    
    return {
        "club_id": str(club_id),
        "requests": [
            {
                "request_id": str(r.request_id),
                "user_id": r.user_id,
                "message": r.message,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in requests
        ],
        "count": len(requests),
    }


@router.post("/join-requests/{request_id}/action")
async def action_join_request(
    request_id: uuid.UUID,
    action: JoinRequestAction,
    tg_user: TelegramUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Approve or reject a join request.
    Only the club host can perform this action.
    """
    join_request = await db.get(JoinRequest, request_id)
    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    # Verify requester is the club host
    club = await db.get(Club, join_request.club_id)
    if not club or club.host_id != tg_user.id:
        raise HTTPException(status_code=403, detail="Only the club host can manage join requests")

    if join_request.status != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")
    
    if action.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    
    join_request.status = "approved" if action.action == "approve" else "rejected"
    join_request.resolved_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    return {
        "request_id": str(request_id),
        "status": join_request.status,
        "message": (
            "Заявка одобрена" if action.action == "approve" else "Заявка отклонена"
        )
    }


class ComplaintAction(BaseModel):
    """Action on a complaint."""
    action: str = Field(..., description="confirm or reject")
    resolution_notes: Optional[str] = None


@router.post("/complaints/{complaint_id}/resolve")
async def resolve_complaint(
    complaint_id: uuid.UUID,
    action: ComplaintAction,
    tg_user: "TelegramUser" = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Resolve a complaint with a penalty or rejection.
    Only for admins/moderators.
    """
    from src.config import get_settings
    from src.domain.services.trust_service import TrustService
    
    settings = get_settings()
    if tg_user.id not in settings.admin_ids:
         raise HTTPException(status_code=403, detail="Not authorized")

    complaint = await db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if complaint.status != "pending":
        raise HTTPException(status_code=400, detail="Complaint already resolved")
        
    if action.action not in ["confirm", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'confirm' or 'reject'")
        
    complaint.status = "confirmed" if action.action == "confirm" else "rejected"
    complaint.resolution_notes = action.resolution_notes
    complaint.resolved_at = datetime.now(timezone.utc)
    
    if action.action == "confirm":
        # Check if it's the first confirmed complaint for this user
        previous_query = select(func.count(Complaint.complaint_id)).where(
            Complaint.target_id == complaint.target_id,
            Complaint.status == "confirmed"
        )
        count_result = await db.execute(previous_query)
        count = count_result.scalar() or 0
        
        event_type = "repeat_complaint_confirmed" if count > 0 else "first_complaint_confirmed"
        
        await TrustService.update_score(
            db=db,
            user_id=complaint.target_id,
            event_type=event_type,
            notes=f"Complaint resolved: {complaint.reason}. {action.resolution_notes or ''}"
        )
        
        # Increment scam reports if fraud
        if complaint.reason == "fraud":
            target = await db.get(User, complaint.target_id)
            if target:
                target.scam_reports += 1
    
    await db.commit()
    
    return {
        "complaint_id": str(complaint_id),
        "status": complaint.status,
        "message": f"Complaint {complaint.status}",
    }
