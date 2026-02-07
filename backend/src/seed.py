"""Seed script + data for initial subscriptions."""

import asyncio
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.entities.subscription import Subscription
from src.infrastructure.persistence.database import async_session_maker, engine


# Subscription seed data based on Market Intelligence analysis
SUBSCRIPTIONS = [
    # --- Digital subscriptions ---
    {
        "service_name": "Yandex Plus",
        "service_name_kk": "Yandex Plus",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Yandex_Plus_logo.svg/1200px-Yandex_Plus_logo.svg.png",
        "max_members": 4,
        "official_price": Decimal("3800"), # Market anchor price (yearly usually, but used as base reference)
    },
    {
        "service_name": "YouTube Premium",
        "service_name_kk": "YouTube Premium",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
        "max_members": 6,
        "official_price": Decimal("5400"), # 900 * 6 members approx
    },
    {
        "service_name": "Spotify Premium",
        "service_name_kk": "Spotify Premium",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
        "max_members": 6,
        "official_price": Decimal("4200"), # 700 * 6 members approx
    },
    {
        "service_name": "Netflix Premium",
        "service_name_kk": "Netflix Premium",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
        "max_members": 4, # Usually 4 screens
        "official_price": Decimal("4800"), # ~1200 * 4
    },
    {
        "service_name": "Duolingo Super",
        "service_name_kk": "Duolingo Super",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Duolingo_Owl.svg/1200px-Duolingo_Owl.svg.png",
        "max_members": 6,
        "official_price": Decimal("4200"), # Market anchor price (yearly)
    },
    {
        "service_name": "Duolingo Max",
        "service_name_kk": "Duolingo Max",
        "category": "digital",
        "icon_url": None, # Using placeholder in UI
        "max_members": 6,
        "official_price": Decimal("8400"), # Market anchor price (yearly)
    },
    {
        "service_name": "Apple Music",
        "service_name_kk": "Apple Music",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Apple_Music_icon.svg",
        "max_members": 6,
        "official_price": Decimal("4500"),
    },
    {
        "service_name": "ChatGPT Plus",
        "service_name_kk": "ChatGPT Plus",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        "max_members": 1, # Usually shared account, not family
        "official_price": Decimal("9000"),
    },
    
    # --- Telecom family plans ---
    {
        "service_name": "Tele2 (Выгодно вместе)",
        "service_name_kk": "Tele2 (Тиімді бірге)",
        "category": "telecom",
        "icon_url": None,
        "max_members": 4, # Approx slots
        "official_price": Decimal("10000"), # Base for sharing, usually ~2500 per person
    },
    {
        "service_name": "Altel 5G",
        "service_name_kk": "Altel 5G",
        "category": "telecom",
        "icon_url": None,
        "max_members": 4,
        "official_price": Decimal("10800"), # ~2700 per person
    },
    {
        "service_name": "Beeline Семья",
        "service_name_kk": "Beeline Отбасы",
        "category": "telecom",
        "icon_url": None,
        "max_members": 5,
        "official_price": Decimal("18000"), # ~3600 per person
    },
    {
        "service_name": "Activ/Kcell",
        "service_name_kk": "Activ/Kcell",
        "category": "telecom",
        "icon_url": None,
        "max_members": 4,
        "official_price": Decimal("8000"),
    },
]


async def seed_subscriptions(db: AsyncSession) -> None:
    """Seed subscriptions table with initial data."""
    
    # Clear existing to ensure fresh market data
    await db.execute(text("TRUNCATE TABLE subscriptions CASCADE"))
    
    for sub_data in SUBSCRIPTIONS:
        sub = Subscription(
            subscription_id=uuid4(),
            **sub_data,
            is_active=True,
        )
        db.add(sub)
    
    await db.commit()
    print(f"Seeded {len(SUBSCRIPTIONS)} subscriptions with Market Intelligence data")


async def run_seed():
    """Run the seed script."""
    # Force UTF-8 for Windows console if needed, or just remove emojis for safety
    print("Starting seed...") 
    
    async with async_session_maker() as db:
        await seed_subscriptions(db)
    
    print("Seed complete!")


if __name__ == "__main__":
    asyncio.run(run_seed())
