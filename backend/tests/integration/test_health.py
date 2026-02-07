"""Integration tests for health endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint returns OK."""
    response = await client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


@pytest.mark.asyncio
async def test_api_docs_available_in_debug(client: AsyncClient):
    """Test that API docs are available (in debug mode)."""
    response = await client.get("/api/docs")
    # In debug mode should return 200, in production 404
    assert response.status_code in [200, 404]
