import asyncio
import os
import sys

# Add backend/src to path so we can import domain.services
backend_src = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/src'))
sys.path.append(backend_src)

from domain.services.ai_service import AIService

async def main():
    if len(sys.argv) < 2:
        print("Usage: python test_vision.py <image_path>")
        return

    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}")
        return

    print(f"Analyzing {image_path}...")
    
    try:
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        service = AIService()
        result = await service.analyze_receipt(image_data)
        
        print("\n--- AI Analysis Result ---")
        for key, value in result.items():
            print(f"{key}: {value}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
