"""API routes package."""

from fastapi import APIRouter

from src.api.clubs import router as clubs_router
from src.api.subscriptions import router as subscriptions_router
from src.api.users import router as users_router

# Main API router
api_router = APIRouter(prefix="/api/v1")

# Include all routers
api_router.include_router(users_router)
api_router.include_router(subscriptions_router)
api_router.include_router(clubs_router)

__all__ = ["api_router"]
