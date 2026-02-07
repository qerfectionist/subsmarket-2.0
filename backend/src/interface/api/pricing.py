"""
Pricing API endpoints.

Provides price benchmarks, telecom operators, and price validation.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure import get_db
from src.domain.entities.pricing import PricingService, TelecomOperator

router = APIRouter(prefix="/pricing", tags=["pricing"])


@router.get("/services")
async def get_pricing_services(
    category: Optional[str] = Query(None, description="Filter by category: streaming, cloud, education"),
    active_only: bool = Query(True, description="Only return active services"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all pricing services with market benchmarks.
    
    Returns a list of services with price ranges based on market analysis.
    """
    query = select(PricingService)
    
    if category:
        query = query.where(PricingService.category == category)
    
    if active_only:
        query = query.where(PricingService.is_active == True)  # noqa: E712
    
    query = query.order_by(PricingService.popularity.desc())
    
    result = await db.execute(query)
    services = result.scalars().all()
    
    return {
        "services": [
            {
                "id": s.service_id,
                "category": s.category,
                "name": s.name,
                "name_kk": s.name_kk,
                "logo": s.logo,
                "family_size": s.family_size,
                "billing_cycle": s.billing_cycle,
                "price_range": {
                    "min": s.price_min,
                    "max": s.price_max,
                    "recommended": s.price_recommended,
                },
                "regions": s.regions,
                "region_restriction": s.region_restriction,
                "notes": s.notes,
                "popularity": s.popularity,
            }
            for s in services
        ],
        "count": len(services),
    }


@router.get("/services/{service_id}")
async def get_pricing_service(
    service_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get details for a specific pricing service."""
    query = select(PricingService).where(PricingService.service_id == service_id)
    result = await db.execute(query)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail=f"Service {service_id} not found")
    
    return {
        "id": service.service_id,
        "category": service.category,
        "name": service.name,
        "name_kk": service.name_kk,
        "logo": service.logo,
        "family_size": service.family_size,
        "billing_cycle": service.billing_cycle,
        "price_range": {
            "min": service.price_min,
            "max": service.price_max,
            "recommended": service.price_recommended,
        },
        "regions": service.regions,
        "region_restriction": service.region_restriction,
        "notes": service.notes,
        "popularity": service.popularity,
    }


@router.get("/services/{service_id}/validate")
async def validate_price(
    service_id: str,
    price: int = Query(..., description="Price to validate in KZT"),
    db: AsyncSession = Depends(get_db),
):
    """
    Validate if a price is within market range.
    
    Returns:
    - is_fair: Price is within normal market range
    - is_suspicious: Price is suspiciously low (potential scam)
    - is_overpriced: Price is above market range
    """
    query = select(PricingService).where(PricingService.service_id == service_id)
    result = await db.execute(query)
    service = result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail=f"Service {service_id} not found")
    
    is_fair = service.price_min <= price <= service.price_max
    is_suspicious = price < service.price_min * 0.5
    is_overpriced = price > service.price_max * 1.2
    
    return {
        "service_id": service_id,
        "price": price,
        "market_range": {
            "min": service.price_min,
            "max": service.price_max,
            "recommended": service.price_recommended,
        },
        "validation": {
            "is_fair": is_fair,
            "is_suspicious": is_suspicious,
            "is_overpriced": is_overpriced,
        },
        "message": (
            "⚠️ Подозрительно низкая цена" if is_suspicious
            else "❌ Цена выше рыночной" if is_overpriced
            else "✅ Цена в пределах нормы" if is_fair
            else "⚠️ Цена ниже рекомендуемой"
        ),
    }


@router.get("/telecom")
async def get_telecom_operators(
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all telecom operators with GB pricing benchmarks.
    """
    query = select(TelecomOperator)
    
    if active_only:
        query = query.where(TelecomOperator.is_active == True)  # noqa: E712
    
    query = query.order_by(TelecomOperator.popularity.desc())
    
    result = await db.execute(query)
    operators = result.scalars().all()
    
    return {
        "operators": [
            {
                "id": op.operator_id,
                "name": op.name,
                "logo": op.logo,
                "gb_price_range": {
                    "min": op.gb_price_min,
                    "max": op.gb_price_max,
                    "recommended": op.gb_price_recommended,
                },
                "gb_min_volume": op.gb_min_volume,
                "popularity": op.popularity,
            }
            for op in operators
        ],
        "count": len(operators),
    }


@router.get("/telecom/{operator_id}/validate")
async def validate_gb_price(
    operator_id: str,
    price_per_gb: int = Query(..., description="Price per GB to validate in KZT"),
    db: AsyncSession = Depends(get_db),
):
    """
    Validate if a GB price is within market range for an operator.
    """
    query = select(TelecomOperator).where(TelecomOperator.operator_id == operator_id)
    result = await db.execute(query)
    operator = result.scalar_one_or_none()
    
    if not operator:
        raise HTTPException(status_code=404, detail=f"Operator {operator_id} not found")
    
    is_fair = operator.is_price_fair(price_per_gb)
    is_suspicious = price_per_gb < operator.gb_price_min * 0.5
    is_overpriced = price_per_gb > operator.gb_price_max * 1.3
    
    return {
        "operator_id": operator_id,
        "price_per_gb": price_per_gb,
        "market_range": {
            "min": operator.gb_price_min,
            "max": operator.gb_price_max,
            "recommended": operator.gb_price_recommended,
        },
        "validation": {
            "is_fair": is_fair,
            "is_suspicious": is_suspicious,
            "is_overpriced": is_overpriced,
        },
        "message": (
            "⚠️ Подозрительно низкая цена" if is_suspicious
            else "❌ Цена выше рыночной" if is_overpriced
            else "✅ Цена в пределах нормы" if is_fair
            else "⚠️ Цена ниже рекомендуемой"
        ),
    }


@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """
    Get all service categories with counts.
    """
    query = select(PricingService.category).distinct()
    result = await db.execute(query)
    categories = result.scalars().all()
    
    category_info = {
        "streaming": {"label": "Стриминг", "icon": "📺"},
        "cloud": {"label": "Облако и AI", "icon": "☁️"},
        "education": {"label": "Образование", "icon": "🎓"},
        "telecom": {"label": "Телеком", "icon": "📱"},
    }
    
    return {
        "categories": [
            {
                "id": cat,
                "label": category_info.get(cat, {}).get("label", cat),
                "icon": category_info.get(cat, {}).get("icon", "📦"),
            }
            for cat in categories
        ]
    }
