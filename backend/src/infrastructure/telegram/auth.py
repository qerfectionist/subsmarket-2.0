"""Telegram WebApp authentication and validation."""

import hashlib
import hmac
import json
import time
from typing import Optional
from urllib.parse import parse_qs, urlparse

from fastapi import HTTPException, Request, status
from pydantic import BaseModel

from src.config import get_settings


class TelegramUser(BaseModel):
    """Validated Telegram user data."""
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    language_code: Optional[str] = None
    is_premium: Optional[bool] = None
    photo_url: Optional[str] = None


class TelegramInitData(BaseModel):
    """Parsed and validated Telegram InitData."""
    user: TelegramUser
    auth_date: int
    hash: str
    query_id: Optional[str] = None
    chat_instance: Optional[str] = None
    start_param: Optional[str] = None


LOCAL_DEV_HOSTS = {"localhost", "127.0.0.1", "::1"}


def _hostname_from_header(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    parsed = urlparse(value if "://" in value else f"http://{value}")
    return parsed.hostname


def _is_local_dev_request(request: Request) -> bool:
    """Allow mock auth only when the browser/app was opened from a local origin."""
    origin_host = _hostname_from_header(request.headers.get("origin"))
    referer_host = _hostname_from_header(request.headers.get("referer"))
    if origin_host or referer_host:
        return (origin_host in LOCAL_DEV_HOSTS) or (referer_host in LOCAL_DEV_HOSTS)

    host = _hostname_from_header(request.headers.get("host"))
    client_host = request.client.host if request.client else None
    return host in LOCAL_DEV_HOSTS and client_host in LOCAL_DEV_HOSTS


def validate_init_data(init_data: str, bot_token: str) -> TelegramInitData:
    """
    Validate Telegram WebApp initData according to official docs.
    https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    """
    try:
        parsed = parse_qs(init_data, keep_blank_values=True)
        
        # Extract hash
        received_hash = parsed.get("hash", [""])[0]
        if not received_hash:
            raise ValueError("Missing hash")
        
        # Build data-check-string (sorted alphabetically, excluding hash)
        data_check_parts = []
        for key in sorted(parsed.keys()):
            if key != "hash":
                value = parsed[key][0]
                data_check_parts.append(f"{key}={value}")
        
        data_check_string = "\n".join(data_check_parts)
        
        # Create secret key: HMAC-SHA256(bot_token, "WebAppData")
        secret_key = hmac.new(
            b"WebAppData",
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Verify hash
        if not hmac.compare_digest(calculated_hash, received_hash):
            raise ValueError("Invalid hash")
        
        # Check auth_date (not older than 24 hours)
        auth_date = int(parsed.get("auth_date", ["0"])[0])
        if time.time() - auth_date > 86400:  # 24 hours
            raise ValueError("Auth data expired")
        
        # Parse user data
        user_json = parsed.get("user", [""])[0]
        if not user_json:
            raise ValueError("Missing user data")
        
        user_data = json.loads(user_json)
        user = TelegramUser(**user_data)
        
        return TelegramInitData(
            user=user,
            auth_date=auth_date,
            hash=received_hash,
            query_id=parsed.get("query_id", [None])[0],
            chat_instance=parsed.get("chat_instance", [None])[0],
            start_param=parsed.get("start_param", [None])[0],
        )
        
    except Exception as e:
        raise ValueError(f"Invalid init data: {e}")


async def get_current_user(request: Request) -> TelegramUser:
    """
    FastAPI dependency to get current authenticated Telegram user.
    Extracts and validates initData from X-Telegram-Init-Data header.
    """
    settings = get_settings()
    
    # Get initData from header
    init_data = request.headers.get("X-Telegram-Init-Data")
    
    if not init_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Telegram InitData"
        )
    
    # In debug mode, allow mock auth only for local development pages.
    if settings.debug and init_data.startswith("mock:"):
        if not _is_local_dev_request(request):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mock auth is allowed only on localhost",
            )

        # Format: mock:user_id:username
        parts = init_data.split(":")
        if len(parts) < 2 or not parts[1].isdigit():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid mock auth format",
            )

        return TelegramUser(
            id=int(parts[1]),
            first_name="Dev",
            username=parts[2] if len(parts) > 2 else "dev_user",
        )
    
    try:
        validated = validate_init_data(init_data, settings.telegram_bot_token)
        return validated.user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
