"""Security utilities: rate limiting, anti-spam, encryption."""

from slowapi import Limiter
from slowapi.util import get_remote_address

# ─── Rate Limiter ───
# WARNING: This in-memory limiter is INEFFECTIVE on Vercel Serverless Functions
# because each invocation may run in a different ephemeral container.
# For production, switch to an external store backend:
#   pip install slowapi[redis]
#   limiter = Limiter(key_func=get_remote_address, storage_uri="redis://...")
# or use Upstash Redis (free tier) via:
#   limiter = Limiter(key_func=get_remote_address, storage_uri=os.getenv("UPSTASH_REDIS_URL"))
#
# For Docker / long-running process deployments, in-memory works fine.
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
