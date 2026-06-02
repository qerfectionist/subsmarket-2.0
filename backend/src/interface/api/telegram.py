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


async def _telegram_post(token: str, method: str, payload: dict) -> dict:
    url = f"https://api.telegram.org/bot{token}/{method}"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(url, json=payload)

    try:
        data = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Invalid Telegram response") from exc

    if not response.is_success or not data.get("ok"):
        detail = data.get("description") or f"Telegram {method} failed"
        raise HTTPException(status_code=502, detail=detail)

    return data


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

    data = await _telegram_post(
        settings.telegram_bot_token,
        "savePreparedKeyboardButton",
        payload,
    )

    return {"prepared_id": data["result"]["id"], "request_id": str(request_id)}


@router.get("/group-request/{request_id}")
@limiter.limit("60/minute")
async def resolve_group_request(
    request: Request,
    request_id: int,
    tg_user: Annotated[TelegramUser, Depends(get_current_user)],
) -> dict[str, str | None]:
    """Resolve a shared Telegram group into a join link."""
    settings = get_settings()
    if not settings.telegram_bot_token:
        raise HTTPException(status_code=503, detail="Telegram bot token is not configured")

    updates = await _telegram_post(
        settings.telegram_bot_token,
        "getUpdates",
        {
            "offset": -100,
            "limit": 100,
            "timeout": 0,
            "allowed_updates": ["message"],
        },
    )

    for update in reversed(updates.get("result", [])):
        message = update.get("message") or {}
        sender = message.get("from") or {}
        chat_shared = message.get("chat_shared")
        if not chat_shared:
            continue
        if sender.get("id") != tg_user.id:
            continue
        if chat_shared.get("request_id") != request_id:
            continue

        username = chat_shared.get("username")
        if username:
            return {"status": "ready", "link": f"https://t.me/{username}"}

        chat_id = chat_shared.get("chat_id")
        if not chat_id:
            return {"status": "pending", "link": None}

        invite = await _telegram_post(
            settings.telegram_bot_token,
            "createChatInviteLink",
            {
                "chat_id": chat_id,
                "name": "SubsMarket",
                "creates_join_request": False,
            },
        )
        invite_link = invite.get("result", {}).get("invite_link")
        if not invite_link:
            raise HTTPException(status_code=502, detail="Telegram did not return invite link")

        return {"status": "ready", "link": invite_link}

    return {"status": "pending", "link": None}
