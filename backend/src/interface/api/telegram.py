"""Telegram helper API routes."""

import secrets
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request

from src.config import get_settings
from src.infrastructure.telegram.auth import TelegramUser, get_current_user
from src.security import limiter

router = APIRouter(prefix="/telegram", tags=["telegram"])


def _group_admin_rights() -> dict[str, bool]:
    return {
        "can_manage_chat": True,
        "can_delete_messages": False,
        "can_manage_video_chats": False,
        "can_restrict_members": False,
        "can_promote_members": False,
        "can_change_info": False,
        "can_invite_users": True,
        "can_post_stories": False,
        "can_edit_stories": False,
        "can_delete_stories": False,
        "can_pin_messages": False,
        "can_manage_topics": False,
    }


@router.post("/prepared-group-request")
@limiter.limit("20/hour")
async def create_prepared_group_request(
    request: Request,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
) -> dict[str, str]:
    """Create a prepared keyboard button id for Telegram.WebApp.requestChat."""
    settings = get_settings()
    if not settings.telegram_bot_token:
        raise HTTPException(status_code=503, detail="Telegram bot token is not configured")

    request_id = secrets.randbelow(2_000_000_000)
    rights = _group_admin_rights()
    payload = {
        "user_id": tg_user.id,
        "button": {
            "text": "Создать или выбрать группу",
            "request_chat": {
                "request_id": request_id,
                "chat_is_channel": False,
                "chat_is_created": True,
                "user_administrator_rights": rights,
                "bot_administrator_rights": rights,
                "request_title": True,
                "request_username": True,
                "request_photo": False,
            },
        },
    }

    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/savePreparedKeyboardButton"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, json=payload)

    data = response.json()
    if not response.is_success or not data.get("ok"):
        detail = data.get("description") or "Failed to create Telegram request"
        raise HTTPException(status_code=502, detail=detail)

    return {"request_id": data["result"]["id"]}
