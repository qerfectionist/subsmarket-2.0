import sys
import asyncio
sys.path.append(".")
from src.infrastructure.persistence.database import async_session_maker
from sqlalchemy import select, func
from src.domain.entities.club import Club

async def check():
    async with async_session_maker() as db:
        res = await db.execute(select(func.count(Club.club_id)))
        print("Total clubs:", res.scalar())
        res_host = await db.execute(select(Club.host_id, func.count(Club.club_id)).group_by(Club.host_id))
        for row in res_host:
            print(f"Host {row[0]} has {row[1]} clubs")

asyncio.run(check())
