"""Seed script + data for initial subscriptions."""

import asyncio
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain import Subscription
from src.infrastructure.database import async_session_maker, engine


# Subscription seed data
SUBSCRIPTIONS = [
    # Digital subscriptions
    {
        "service_name": "Netflix Premium",
        "service_name_kk": "Netflix Premium",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
        "max_members": 5,
        "official_price": Decimal("5990"),
    },
    {
        "service_name": "Spotify Family",
        "service_name_kk": "Spotify Family",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
        "max_members": 6,
        "official_price": Decimal("4290"),
    },
    {
        "service_name": "YouTube Premium",
        "service_name_kk": "YouTube Premium",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
        "max_members": 6,
        "official_price": Decimal("5290"),
    },
    {
        "service_name": "Apple Music",
        "service_name_kk": "Apple Music",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Apple_Music_icon.svg",
        "max_members": 6,
        "official_price": Decimal("4490"),
    },
    {
        "service_name": "Яндекс Плюс",
        "service_name_kk": "Яндекс Плюс",
        "category": "digital",
        "icon_url": None,
        "max_members": 4,
        "official_price": Decimal("2990"),
    },
    {
        "service_name": "iCloud+ 2TB",
        "service_name_kk": "iCloud+ 2TB",
        "category": "digital",
        "icon_url": None,
        "max_members": 6,
        "official_price": Decimal("4290"),
    },
    {
        "service_name": "ChatGPT Plus",
        "service_name_kk": "ChatGPT Plus",
        "category": "digital",
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        "max_members": 1,
        "official_price": Decimal("8900"),
    },
    {
        "service_name": "Canva Pro",
        "service_name_kk": "Canva Pro",
        "category": "digital",
        "icon_url": None,
        "max_members": 5,
        "official_price": Decimal("5990"),
    },
    {
        "service_name": "Disney+",
        "service_name_kk": "Disney+",
        "category": "digital",
        "icon_url": None,
        "max_members": 4,
        "official_price": Decimal("4490"),
    },
    # Telecom family plans
    {
        "service_name": "Beeline Семья",
        "service_name_kk": "Beeline Отбасы",
        "category": "telecom",
        "icon_url": None,
        "max_members": 5,
        "official_price": Decimal("7990"),
    },
    {
        "service_name": "Tele2 Семья",
        "service_name_kk": "Tele2 Отбасы",
        "category": "telecom",
        "icon_url": None,
        "max_members": 4,
        "official_price": Decimal("6990"),
    },
    {
        "service_name": "Altel Семья",
        "service_name_kk": "Altel Отбасы",
        "category": "telecom",
        "icon_url": None,
        "max_members": 5,
        "official_price": Decimal("8990"),
    },
    {
        "service_name": "Kcell Семья",
        "service_name_kk": "Kcell Отбасы",
        "category": "telecom",
        "icon_url": None,
        "max_members": 4,
        "official_price": Decimal("5990"),
    },
]


async def seed_subscriptions(db: AsyncSession) -> None:
    """Seed subscriptions table with initial data."""
    
    for sub_data in SUBSCRIPTIONS:
        sub = Subscription(
            subscription_id=uuid4(),
            **sub_data,
            is_active=True,
        )
        db.add(sub)
    
    await db.commit()
    print(f"✅ Seeded {len(SUBSCRIPTIONS)} subscriptions")


async def run_seed():
    """Run the seed script."""
    print("🌱 Starting seed...")
    
    async with async_session_maker() as db:
        # Check if already seeded
        result = await db.execute(text("SELECT COUNT(*) FROM subscriptions"))
        count = result.scalar()
        
        if count and count > 0:
            print(f"⚠️  Database already has {count} subscriptions. Skipping seed.")
            return
        
        await seed_subscriptions(db)
    
    print("✅ Seed complete!")


if __name__ == "__main__":
    asyncio.run(run_seed())
