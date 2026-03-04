import asyncio
import os
import sys

# Add backend to path to import models
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import select
from dotenv import load_dotenv

from src.domain.entities.user import User

load_dotenv(os.path.join("backend", ".env"))

DB_URL = os.getenv("DATABASE_URL")

async def check_trust_scores():
    if not DB_URL:
        print("❌ DATABASE_URL is not set")
        return

    clean_url = DB_URL.replace("?sslmode=require", "")
    engine = create_async_engine(clean_url)

    print("\n🔍 Checking top users by Trust Score...\n")
    print(f"{'ID':<10} {'Username':<20} {'Trust Score':<12} {'Deals':<8} {'Status':<10}")
    print("-" * 65)

    async with engine.connect() as conn:
        # Select users
        stmt = select(User).order_by(User.trust_score.desc()).limit(10)
        result = await conn.execute(stmt)
        users = result.fetchall()

        if not users:
            print("No users found.")
        
        for user in users:
            # Note: user is a Row object, access by column index or name
            # Columns order matches User definition usually, but let's be safe
            # Assuming columns: user_id, username, ..., trust_score, ...
            # Let's try to map by knowing the schema or just printing raw row
            
            # Better way: execute(select(User)) returns User objects if using session, 
            # but with engine.connect() it returns Row.
            # Let's use clean attribute access if possible or index.
            
            # Let's try to infer from typical positions or print row keys
            pass
            
            # Actually, let's use a session to get objects
            pass

    # Re-doing with Session for easier object access
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.asyncio import AsyncSession
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(User).order_by(User.trust_score.desc()).limit(10))
        users = result.scalars().all()
        
        for u in users:
            status_icon = "✅" if u.status == "active" else "⛔"
            print(f"{u.user_id:<10} {u.username or 'NoName':<20} {u.trust_score:<12} {u.p2p_deals_count:<8} {status_icon} {u.status}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_trust_scores())
