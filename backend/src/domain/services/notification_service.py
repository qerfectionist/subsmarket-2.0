"""Compatibility re-export for moved Telegram notification service."""

from src.infrastructure.telegram.notification_service import NotificationService

__all__ = ["NotificationService"]
