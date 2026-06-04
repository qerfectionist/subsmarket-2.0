from typing import List, Optional, Union, Dict
import logging
import os
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.error import TelegramError

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Сервис для отправки уведомлений в Telegram.
    """
    
    def __init__(self, bot: Optional[Bot] = None):
        """
        Initialize the notification service, optionally injecting a bot instance for testing.
        """
        if bot:
            self._bot = bot
        else:
            token = os.getenv("TELEGRAM_BOT_TOKEN")
            if token and token != "test":
                self._bot = Bot(token=token)
            else:
                self._bot = None
                logger.warning("TELEGRAM_BOT_TOKEN not set or invalid. Notifications disabled.")

    def get_bot(self) -> Optional[Bot]:
        return self._bot

    async def send_to_user(self, user_id: int, message: str, buttons: Optional[List[List[Dict[str, str]]]] = None):
        """
        Отправляет сообщение пользователю.
        buttons format: [[{"text": "Button 1", "url": "..."}]]
        Use {"web_app": "..."} for Telegram Mini App buttons.
        """
        bot = self.get_bot()
        if not bot:
            return

        reply_markup = None
        if buttons:
            keyboard = []
            for row in buttons:
                keyboard_row = []
                for btn in row:
                    if "web_app" in btn:
                        keyboard_row.append(InlineKeyboardButton(text=btn["text"], web_app=WebAppInfo(url=btn["web_app"])))
                    elif "url" in btn:
                        keyboard_row.append(InlineKeyboardButton(text=btn["text"], url=btn["url"]))
                    elif "callback_data" in btn:
                        keyboard_row.append(InlineKeyboardButton(text=btn["text"], callback_data=btn["callback_data"]))
                keyboard.append(keyboard_row)
            reply_markup = InlineKeyboardMarkup(keyboard)

        try:
            await bot.send_message(chat_id=user_id, text=message, reply_markup=reply_markup, parse_mode="HTML")
            logger.info(f"Notification sent to {user_id}")
        except TelegramError as e:
            logger.error(f"Failed to send notification to {user_id}: {e}")

    async def notify_admins(self, message: str, category: str = "info"):
        """
        Отправляет уведомление в админский чат.
        """
        admin_chat_id = os.getenv("ADMIN_CHAT_ID")
        if not admin_chat_id:
            logger.warning("ADMIN_CHAT_ID not set. Admin notifications disabled.")
            return

        icon = "ℹ️"
        if category == "alert": icon = "🚨"
        elif category == "success": icon = "✅"
        elif category == "error": icon = "❌"

        formatted_message = f"{icon} <b>Admin Notification</b>\n\n{message}"
        
        await self.send_to_user(int(admin_chat_id), formatted_message)


    @staticmethod
    def format_trust_update(score_change: float, event_type: str, new_score: float) -> str:
        """
        Форматирует сообщение об изменении Trust Score.
        """
        trend = "📈 Рейтинг вырос" if score_change > 0 else "📉 Рейтинг снизился"
        return (
            f"{trend} на {abs(score_change):.1f}!\n"
            f"Текущий рейтинг: {new_score:.2f}\n"
            f"Причина: {event_type}"
        )
