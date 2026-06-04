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
        "icon_url": "https://avatars.mds.yandex.net/get-dialogs/1544331/0cb1b0cb54f9a0d33e70/orig",
        "max_members": 4,
        "official_price": Decimal("3800"), # Market anchor price (yearly usually, but used as base reference)
    },
    {
        "service_name": "YouTube Premium",
        "service_name_kk": "YouTube Premium",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png",
        "max_members": 6,
        "official_price": Decimal("5400"), # 900 * 6 members approx
    },
    {
        "service_name": "Spotify Premium",
        "service_name_kk": "Spotify Premium",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1024px-Spotify_logo_without_text.svg.png",
        "max_members": 6,
        "official_price": Decimal("4200"), # 700 * 6 members approx
    },
    {
        "service_name": "Netflix Premium",
        "service_name_kk": "Netflix Premium",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1024px-Netflix_2015_logo.svg.png",
        "max_members": 4, # Usually 4 screens
        "official_price": Decimal("4800"), # ~1200 * 4
    },
    {
        "service_name": "Duolingo Super",
        "service_name_kk": "Duolingo Super",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Duolingo_Owl.svg/1024px-Duolingo_Owl.svg.png",
        "max_members": 6,
        "official_price": Decimal("4200"), # Market anchor price (yearly)
    },
    {
        "service_name": "Duolingo Max",
        "service_name_kk": "Duolingo Max",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Duolingo_Owl.svg/1024px-Duolingo_Owl.svg.png",
        "max_members": 6,
        "official_price": Decimal("8400"), # Market anchor price (yearly)
    },
    {
        "service_name": "Apple Music",
        "service_name_kk": "Apple Music",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/1024px-Apple_Music_icon.svg.png",
        "max_members": 6,
        "official_price": Decimal("4500"),
    },
    {
        "service_name": "ChatGPT Plus",
        "service_name_kk": "ChatGPT Plus",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png",
        "max_members": 1, # Usually shared account, not family
        "official_price": Decimal("9000"),
    },
    
    # --- Telecom family plans ---
    {
        "service_name": "Tele2 (Выгодно вместе)",
        "service_name_kk": "Tele2 (Тиімді бірге)",
        "category": "telecom",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Tele2_logo_2014.svg/1024px-Tele2_logo_2014.svg.png",
        "max_members": 4, # Approx slots
        "official_price": Decimal("10000"), # Base for sharing, usually ~2500 per person
    },
    {
        "service_name": "Altel 5G",
        "service_name_kk": "Altel 5G",
        "category": "telecom",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Altel_logo.svg/1024px-Altel_logo.svg.png",
        "max_members": 4,
        "official_price": Decimal("10800"), # ~2700 per person
    },
    {
        "service_name": "Beeline Семья",
        "service_name_kk": "Beeline Отбасы",
        "category": "telecom",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Beeline_logo_ru.svg/1024px-Beeline_logo_ru.svg.png",
        "max_members": 5,
        "official_price": Decimal("18000"), # ~3600 per person
    },
    {
        "service_name": "Activ/Kcell",
        "service_name_kk": "Activ/Kcell",
        "category": "telecom",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Kcell_Logo.svg/1024px-Kcell_Logo.svg.png",
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
