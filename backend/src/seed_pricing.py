"""
Seed script to load pricing_database.json into Neon PostgreSQL.

Usage:
    python -m src.seed_pricing
"""
import json
import asyncio
from pathlib import Path
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.config import get_settings


# Path to pricing database JSON (project_root/data/)
PRICING_DB_PATH = Path(__file__).parent.parent.parent / "data" / "pricing_database.json"


async def load_pricing_data(session: AsyncSession) -> dict[str, int]:
    """Load pricing services and telecom operators from JSON into database."""
    
    with open(PRICING_DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    stats = {
        "pricing_services": 0,
        "telecom_operators": 0,
    }
    
    categories = data.get("categories", {})
    
    # Process streaming, cloud, education categories
    for category_key in ["streaming", "cloud", "education"]:
        category = categories.get(category_key, {})
        services = category.get("services", [])
        
        for service in services:
            price_range = service.get("price_range", {})
            regions = service.get("regions", [])
            
            await session.execute(
                text("""
                    INSERT INTO pricing_services (
                        service_id, category, name, name_kk, logo,
                        family_size, billing_cycle,
                        price_min, price_max, price_recommended,
                        regions, region_restriction, notes, popularity, is_active
                    ) VALUES (
                        :service_id, :category, :name, :name_kk, :logo,
                        :family_size, :billing_cycle,
                        :price_min, :price_max, :price_recommended,
                        :regions, :region_restriction, :notes, :popularity, true
                    )
                    ON CONFLICT (service_id) DO UPDATE SET
                        category = EXCLUDED.category,
                        name = EXCLUDED.name,
                        logo = EXCLUDED.logo,
                        family_size = EXCLUDED.family_size,
                        billing_cycle = EXCLUDED.billing_cycle,
                        price_min = EXCLUDED.price_min,
                        price_max = EXCLUDED.price_max,
                        price_recommended = EXCLUDED.price_recommended,
                        regions = EXCLUDED.regions,
                        region_restriction = EXCLUDED.region_restriction,
                        notes = EXCLUDED.notes,
                        popularity = EXCLUDED.popularity,
                        updated_at = NOW()
                """),
                {
                    "service_id": service["id"],
                    "category": category_key,
                    "name": service["name"],
                    "name_kk": None,  # Can be added later for Kazakh localization
                    "logo": service.get("logo"),
                    "family_size": service.get("family_size", 6),
                    "billing_cycle": service.get("billing_cycle", "monthly"),
                    "price_min": price_range.get("min", 0),
                    "price_max": price_range.get("max", 0),
                    "price_recommended": price_range.get("recommended", 0),
                    "regions": regions,
                    "region_restriction": service.get("region_restriction", False),
                    "notes": service.get("notes"),
                    "popularity": service.get("popularity", 50),
                }
            )
            stats["pricing_services"] += 1
    
    # Process telecom operators
    telecom = categories.get("telecom", {})
    operators = telecom.get("operators", [])
    
    for operator in operators:
        gb_price = operator.get("gb_price_per_unit", {})
        
        await session.execute(
            text("""
                INSERT INTO telecom_operators (
                    operator_id, name, logo,
                    gb_price_min, gb_price_max, gb_price_recommended,
                    gb_min_volume, popularity, is_active
                ) VALUES (
                    :operator_id, :name, :logo,
                    :gb_price_min, :gb_price_max, :gb_price_recommended,
                    :gb_min_volume, :popularity, true
                )
                ON CONFLICT (operator_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    logo = EXCLUDED.logo,
                    gb_price_min = EXCLUDED.gb_price_min,
                    gb_price_max = EXCLUDED.gb_price_max,
                    gb_price_recommended = EXCLUDED.gb_price_recommended,
                    gb_min_volume = EXCLUDED.gb_min_volume,
                    popularity = EXCLUDED.popularity
            """),
            {
                "operator_id": operator["id"],
                "name": operator["name"],
                "logo": operator.get("logo"),
                "gb_price_min": gb_price.get("min", 80),
                "gb_price_max": gb_price.get("max", 150),
                "gb_price_recommended": gb_price.get("recommended", 100),
                "gb_min_volume": operator.get("gb_min_volume", 5),
                "popularity": operator.get("popularity", 50),
            }
        )
        stats["telecom_operators"] += 1
    
    await session.commit()
    return stats


async def main():
    """Main entry point for seeding pricing data."""
    print("[SEED] SubsMarket Pricing Data Seeder")
    print("=" * 50)
    
    settings = get_settings()
    
    # Create async engine - ensure asyncpg dialect and SSL settings
    db_url = settings.database_url
    if "postgresql://" in db_url and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    
    # asyncpg doesn't support sslmode, use ssl instead
    if "sslmode=require" in db_url:
        db_url = db_url.replace("sslmode=require", "ssl=require")
    
    engine = create_async_engine(db_url, echo=False)
    
    async_session = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    try:
        async with async_session() as session:
            print(f"[INFO] Loading from: {PRICING_DB_PATH}")
            stats = await load_pricing_data(session)
            
            print("\n[OK] Seeding completed!")
            print(f"     Pricing services loaded: {stats['pricing_services']}")
            print(f"     Telecom operators loaded: {stats['telecom_operators']}")
            
    except FileNotFoundError:
        print(f"[ERROR] File not found: {PRICING_DB_PATH}")
    except Exception as e:
        print(f"[ERROR] {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
