import asyncio
import os
import sys

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from sqlalchemy import select, func
from src.infrastructure.database import get_async_session
from src.domain.models import Subscription

async def check_subscriptions():
    session = get_async_session()
    async with session as s:
        # Count subscriptions
        stmt = select(func.count(Subscription.subscription_id))
        result = await s.execute(stmt)
        count = result.scalar()
        print(f"Total Subscriptions in DB: {count}")
        
        if count > 0:
            print("Subscription data is SAFE.")
        else:
            print("WARNING: Subscription data is MISSING!")

if __name__ == "__main__":
    asyncio.run(check_subscriptions())
