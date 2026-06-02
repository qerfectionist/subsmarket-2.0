"""API routes package."""

from fastapi import APIRouter

from src.interface.api.clubs import router as clubs_router
from src.interface.api.subscriptions import router as subscriptions_router
from src.interface.api.users import router as users_router
from src.interface.api.gigabytes import router as gigabytes_router
from src.interface.api.deals import router as deals_router
from src.interface.api.accounts import router as accounts_router
from src.interface.api.pricing import router as pricing_router
from src.interface.api.trust import router as trust_router
from src.interface.api.telegram import router as telegram_router

# Main API router
api_router = APIRouter(prefix="/api/v1")

# Include all routers
api_router.include_router(users_router)
api_router.include_router(subscriptions_router)
api_router.include_router(clubs_router)
api_router.include_router(gigabytes_router)
api_router.include_router(deals_router)
api_router.include_router(accounts_router)
api_router.include_router(pricing_router)
api_router.include_router(trust_router)
api_router.include_router(telegram_router)

__all__ = ["api_router"]
