from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

import pytest

from src.application.services.club_service import ClubService
from src.domain.entities.audit import AuditLog
from src.domain.entities.club import Club
from src.domain.entities.subscription import Subscription
from src.interface.schemas.schemas import ClubCreate


class _FakeScalarResult:
    def first(self):
        return None


class _FakeResult:
    def scalar(self):
        return 0

    def scalars(self):
        return _FakeScalarResult()


class _FakeAsyncSession:
    def __init__(self):
        self.added = []
        self.committed = False
        self.rolled_back = False

    async def execute(self, _statement):
        return _FakeResult()

    def add(self, obj):
        self.added.append(obj)

    async def flush(self):
        subscription = next((obj for obj in self.added if isinstance(obj, Subscription)), None)

        for obj in self.added:
            if isinstance(obj, Subscription) and obj.subscription_id is None:
                obj.subscription_id = uuid4()
            if isinstance(obj, Club):
                if obj.club_id is None:
                    obj.club_id = uuid4()
                if obj.created_at is None:
                    obj.created_at = datetime.now(timezone.utc)
                if obj.subscription is None:
                    obj.subscription = subscription

    async def refresh(self, obj, _attrs=None):
        if isinstance(obj, Club) and obj.subscription is None:
            obj.subscription = next((item for item in self.added if isinstance(item, Subscription)), None)

    async def commit(self):
        self.committed = True

    async def rollback(self):
        self.rolled_back = True


@pytest.mark.asyncio
async def test_create_club_writes_club_created_audit_log(monkeypatch):
    session = _FakeAsyncSession()
    service = ClubService(session)
    user_id = 123456
    list_item = object()

    async def fake_get_club_list_item(_club):
        return list_item

    monkeypatch.setattr(service, "get_club_list_item", fake_get_club_list_item)

    result = await service.create_club(
        ClubCreate(
            service_id="youtube_premium",
            price_total=Decimal("1000"),
            max_members=4,
            payment_details="+7 777 000 00 00",
            telegram_group_link="https://t.me/test_group",
        ),
        user_id=user_id,
    )

    club = next(obj for obj in session.added if isinstance(obj, Club))
    audit_log = next(
        obj for obj in session.added
        if isinstance(obj, AuditLog) and obj.event_type == "club_created"
    )
    assert result is list_item
    assert club.telegram_group_link == "https://t.me/test_group"
    assert audit_log.actor_id == user_id
    assert audit_log.to_status == "open"
    assert session.committed is True
    assert session.rolled_back is False
