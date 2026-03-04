"""Security utilities: rate limiting, anti-spam, encryption."""

from slowapi import Limiter
from slowapi.util import get_remote_address

# ─── Rate Limiter ───
# Shared instance used across all API routers
limiter = Limiter(key_func=get_remote_address)


# ─── Anti-Spam Limits ───
# Centralized rate limit definitions
RATE_LIMITS = {
    'create_club': '5/hour',
    'join_club': '10/hour',
    'create_offer': '10/hour',
    'create_deal': '5/hour',
    'pay_deal': '3/minute',
    'file_upload': '10/hour',
}
