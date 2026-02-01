import asyncio
import os
import re
import glob
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.infrastructure.database import async_session_maker
from src.domain.models import GigabyteOffer, User

# Path pattern to find all exported messages files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MESSAGES_PATTERN = os.path.join(BASE_DIR, "data", "messages*.html")

async def get_or_create_user(session: AsyncSession, username: str, user_id: int) -> User:
    stmt = select(User).where(User.user_id == user_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            user_id=user_id,
            username=username[:255] if username else f"user_{user_id}",
            first_name=username[:255] if username else "Unknown",
            trust_score=5.0
        )
        session.add(user)
        try:
            await session.commit()
            await session.refresh(user)
        except Exception as e:
            await session.rollback()
            # If race condition, try fetching again
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            
    return user

def clean_html_text(raw_html):
    """Remove HTML tags like <br> and <a> from text."""
    if not raw_html:
        return ""
    clean = re.sub(r'<br\s*/?>', '\n', raw_html)
    clean = re.sub(r'<[^>]+>', '', clean)
    return clean.strip()

async def parse_and_seed():
    files = glob.glob(MESSAGES_PATTERN)
    if not files:
        print(f"No messages.html files found in {MESSAGES_PATTERN}")
        return

    print(f"Found {len(files)} export files.")

    async with async_session_maker() as session:
        total_offers_count = 0
        
        for file_path in files:
            print(f"Processing file: {file_path}")
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception as e:
                print(f"Error reading file {file_path}: {e}")
                continue

            # We'll split by "message default clearfix" to iterate chunks
            chunks = content.split('class="message default clearfix"')
            file_offers_count = 0
            
            for chunk in chunks[1:]:  # Skip first chunk
                
                # 1. Name
                name_match = re.search(r'class="from_name">\s*(.*?)\s*</div>', chunk, re.DOTALL)
                if not name_match:
                    continue
                username = clean_html_text(name_match.group(1))
                
                # 2. Text
                text_match = re.search(r'class="text">\s*(.*?)\s*</div>', chunk, re.DOTALL)
                if not text_match:
                    continue
                
                raw_text = text_match.group(1)
                text = clean_html_text(raw_text)
                
                # Analyze intent
                if "продам" in text.lower() and ("гб" in text.lower() or "gb" in text.lower()):
                    
                    # Extract GB amount
                    amount_match = re.search(r"(\d+)\s*(гб|gb|г)", text.lower())
                    amount = int(amount_match.group(1)) if amount_match else 5 
                    
                    # Extract Price
                    price_match = re.search(r"(\d{3,4})\s*(т|тг|kzt)?", text.lower())
                    price = int(price_match.group(1)) if price_match else 600
                    
                    if price < 100 or price > 5000: 
                        price = 600
                    
                    # Extract Operator
                    operator = "Other"
                    text_lower = text.lower()
                    if "beeline" in text_lower or "билайн" in text_lower:
                        operator = "Beeline"
                    elif "tele2" in text_lower or "теле2" in text_lower:
                        operator = "Tele2"
                    elif "altel" in text_lower or "алтел" in text_lower:
                        operator = "Altel"
                    elif "izi" in text_lower or "изи" in text_lower:
                        operator = "Izi"
                    elif "kcell" in text_lower or "кселл" in text_lower:
                        operator = "Kcell"
                    elif "activ" in text_lower or "актив" in text_lower:
                        operator = "Activ"
                    
                    # Generate fake ID
                    fake_id = abs(hash(username)) % 1000000000
                    if fake_id == 0: fake_id = 1
                    
                    user = await get_or_create_user(session, username, fake_id)
                    if not user:
                        continue

                    offer = GigabyteOffer(
                        seller_id=user.user_id,
                        operator=operator,
                        amount_gb=amount,
                        price=price,
                        description=text[:500],
                        is_active=True
                    )
                    session.add(offer)
                    file_offers_count += 1
                    total_offers_count += 1
            
            # Commit after each file to keep transaction size reasonable
            try:
                await session.commit()
                print(f"  -> Added {file_offers_count} offers from {os.path.basename(file_path)}")
            except Exception as e:
                await session.rollback()
                print(f"  -> Error committing offers for {file_path}: {e}")

        print(f"\nSuccessfully seeded TOTAL {total_offers_count} offers from history.")

if __name__ == "__main__":
    asyncio.run(parse_and_seed())
