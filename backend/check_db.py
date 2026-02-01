import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
from dotenv import load_dotenv

# Load env from .env file
load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
print(f"Checking connection to: {DB_URL}")

async def check_db():
    if not DB_URL:
        print("❌ DATABASE_URL is not set!")
        return

    try:
        # Fix for asyncpg: replace sslmode=require with nothing, as Neon works with default SSL context usually
        # or we might need to pass ssl context.
        # Simple fix: remove query params if they break asyncpg
        clean_url = DB_URL.replace("?sslmode=require", "")
        
        engine = create_async_engine(clean_url)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ Connection successful! DB Version: {version}")
            
            # Check tables
            result = await conn.execute(text("SELECT count(*) FROM subscriptions"))
            count = result.scalar()
            print(f"✅ Subscriptions count: {count}")
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
