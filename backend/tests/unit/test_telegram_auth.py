"""Unit tests for Telegram authentication."""

import pytest
from src.infrastructure.telegram.auth import TelegramUser, validate_init_data


class TestTelegramUser:
    """Tests for TelegramUser model."""
    
    def test_create_user_minimal(self):
        """Test creating user with minimal required fields."""
        user = TelegramUser(id=12345, first_name="Test")
        
        assert user.id == 12345
        assert user.first_name == "Test"
        assert user.last_name is None
        assert user.username is None
    
    def test_create_user_full(self):
        """Test creating user with all fields."""
        user = TelegramUser(
            id=12345,
            first_name="Test",
            last_name="User",
            username="testuser",
            language_code="ru",
            is_premium=True,
            photo_url="https://example.com/photo.jpg"
        )
        
        assert user.id == 12345
        assert user.first_name == "Test"
        assert user.last_name == "User"
        assert user.username == "testuser"
        assert user.language_code == "ru"
        assert user.is_premium is True


class TestValidateInitData:
    """Tests for initData validation."""
    
    def test_invalid_hash_raises(self):
        """Test that invalid hash raises ValueError."""
        invalid_data = "user=%7B%22id%22%3A12345%7D&auth_date=1234567890&hash=invalidhash"
        
        with pytest.raises(ValueError, match="Invalid"):
            validate_init_data(invalid_data, "test_bot_token")
    
    def test_missing_hash_raises(self):
        """Test that missing hash raises ValueError."""
        invalid_data = "user=%7B%22id%22%3A12345%7D&auth_date=1234567890"
        
        with pytest.raises(ValueError, match="Missing hash"):
            validate_init_data(invalid_data, "test_bot_token")
    
    def test_missing_user_raises(self):
        """Test that missing user data raises ValueError."""
        invalid_data = "auth_date=1234567890&hash=somehash"
        
        with pytest.raises(ValueError):
            validate_init_data(invalid_data, "test_bot_token")
