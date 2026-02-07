import os
import re
from datetime import datetime

# Configuration
DATA_DIR = r"c:\Users\qerfe\Documents\subsmarket 2.0\data\split_100"
OUTPUT_FILE = r"c:\Users\qerfe\Documents\subsmarket 2.0\data\chat_analysis.md"
START_INDEX = 17
END_INDEX = 100

# Regex patterns
DATE_PATTERN = re.compile(r"\[(\d{2}\.\d{2}\.\d{4}) (\d{2}:\d{2}:\d{2})")
KEYWORDS = {
    "Netflix": ["netflix", "нетфликс"],
    "YouTube": ["youtube", "ютуб", "премиум"],
    "Spotify": ["spotify", "спотифай"],
    "Yandex": ["yandex", "яндекс", "плюс"],
    "ChatGPT": ["chatgpt", "gpt", "гпт"],
    "Tele2": ["tele2", "теле2"],
    "Beeline": ["beeline", "билайн"],
    "Activ": ["activ", "актив"],
    "Altel": ["altel", "алтел"],
    "Scam/Warning": ["мошенник", "кидок", "бан", "scam", "обман", "осторожно"],
    "Prices": [r"\d{3,5}\s?тг", r"\d{3,5}\s?kzt"]
}

def analyze_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.readlines()

    if not content:
        return None

    # Extract date range
    start_date = None
    end_date = None
    
    topics_count = {k: 0 for k in KEYWORDS}
    prices_found = []

    for line in content:
        # Date match
        m = DATE_PATTERN.search(line)
        if m:
            current_date_str = m.group(1)
            if not start_date:
                start_date = current_date_str
            end_date = current_date_str

        # Keyword matching
        lower_line = line.lower()
        for topic, patterns in KEYWORDS.items():
            if topic == "Prices":
                # Price extraction is specific
                for p in patterns:
                    prices = re.findall(p, lower_line)
                    prices_found.extend(prices)
            else:
                for p in patterns:
                    if p in lower_line:
                        topics_count[topic] += 1
                        break

    # Get top 3 topics
    sorted_topics = sorted(topics_count.items(), key=lambda item: item[1], reverse=True)
    top_topics = [f"{t[0]} ({t[1]})" for t in sorted_topics if t[1] > 0][:5]
    
    # Common prices (just raw sample)
    common_prices = list(set(prices_found))[:5] # Just take a few unique samples

    return {
        "start": start_date,
        "end": end_date,
        "topics": top_topics,
        "prices": common_prices
    }

def main():
    print(f"Starting analysis from part_{START_INDEX} to part_{END_INDEX}...")
    
    with open(OUTPUT_FILE, 'a', encoding='utf-8') as out:
        out.write("\n\n## ЧАСТЬ 2 (Автоматический анализ part_17 - part_100)\n\n")
        out.write("| Файл | Даты | Топ тем | Примеры цен |\n")
        out.write("|---|---|---|---|\n")

        for i in range(START_INDEX, END_INDEX + 1):
            filename = f"part_{i:03d}_of_100.txt"
            filepath = os.path.join(DATA_DIR, filename)
            
            if not os.path.exists(filepath):
                print(f"File not found: {filename}")
                continue

            try:
                data = analyze_file(filepath)
                if data:
                    row = f"| {filename} | {data['start']} - {data['end']} | {', '.join(data['topics'])} | {', '.join(data['prices'])} |\n"
                    out.write(row)
                    print(f"Processed {filename}")
                else:
                    print(f"Empty or unreadable: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

    print("Analysis complete.")

if __name__ == "__main__":
    main()
