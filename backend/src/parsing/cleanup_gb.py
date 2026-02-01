import asyncio
import sys
import os

# Adjust path to find src
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import delete
from src.infrastructure.database import async_session_maker
from src.domain.models import GigabyteOffer

async def cleanup_gb():
    async with async_session_maker() as session:
        print("Cleaning up fake GB offers...")
        stmt = delete(GigabyteOffer)
        result = await session.execute(stmt)
        await session.commit()
        print(f"Successfully deleted {result.rowcount} GB offers.")

if __name__ == "__main__":
    asyncio.run(cleanup_gb())
