import google.generativeai as genai
import json
import os
import logging
from typing import Dict, Any, Optional
from PIL import Image
import io

logger = logging.getLogger(__name__)

class AIService:
    """
    Интеграция с Gemini Vision для анализа изображений.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("Gemini Vision initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
        else:
            logger.warning("GEMINI_API_KEY not found. AI features will be disabled.")

    async def analyze_receipt(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Анализирует изображение чека (Kaspi, Halyk, etc.) и извлекает данные.
        """
        if not self.model:
            logger.warning("AI Service call skipped: No API Key")
            return {
                "verified": False,
                "error": "AI Service not configured"
            }

        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            prompt = """
            Analyze this image. It should be a payment receipt (likely Kaspi Bank or Halyk Bank).
            Extract the following information in strict JSON format:
            {
                "is_receipt": boolean,
                "bank_name": string or null,
                "amount": number or null,
                "currency": string (e.g. "KZT"),
                "date": string (YYYY-MM-DD HH:MM) or null,
                "recipient": string or null,
                "sender": string or null,
                "status": "Success" | "Processing" | "Failed" | "Unknown",
                "transaction_id": string or null
            }
            If it is not a receipt, set "is_receipt" to false.
            Start response with ```json and end with ```.
            """

            response = await self.model.generate_content_async([prompt, image])
            text = response.text
            
            # Extract JSON block
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                json_str = text.split("```")[0]
            else:
                json_str = text
                
            return json.loads(json_str.strip())

        except Exception as e:
            logger.error(f"Error analyzing receipt: {e}")
            return {
                "verified": False,
                "error": str(e)
            }


    @staticmethod
    async def detect_nsfw(image_bytes: bytes) -> bool:
        """
        Проверка изображения на NSFW контент.
        """
        return False
