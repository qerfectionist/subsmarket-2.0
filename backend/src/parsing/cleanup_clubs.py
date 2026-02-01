import asyncio
import sys
import os

# Adjust path to find src
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import delete
from src.infrastructure.database import async_session_maker
from src.domain.models import Club

async def cleanup_clubs():
    async with async_session_maker() as session:
        print("Cleaning up fake clubs...")
        stmt = delete(Club)
        result = await session.execute(stmt)
        await session.commit()
        print(f"Successfully deleted {result.rowcount} clubs.")

if __name__ == "__main__":
    asyncio.run(cleanup_clubs())
