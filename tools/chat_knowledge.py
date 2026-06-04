from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


DEFAULT_EXPORT_DIR = Path(r"C:\Users\qerfe\Downloads\Telegram Desktop\ChatExport_2026-05-29")
DEFAULT_OUTPUT_DIR = Path("data/knowledge")

SERVICE_PATTERNS: dict[str, list[str]] = {
    "ChatGPT": [r"\bchat\s*gpt\b", r"\bchatgpt\b", r"\bgpt\b", r"\bopenai\b", r"чат\s*джи?пити", r"чат\s*gpt"],
    "Claude": [r"\bclaude\b", r"клод"],
    "Grok": [r"\bgrok\b", r"грок"],
    "Gemini / Google AI": [r"\bgemini\b", r"google\s+ai", r"джемини"],
    "Google One": [r"google\s+one", r"гугл\s+one"],
    "Perplexity": [r"\bperplexity\b"],
    "Cursor": [r"\bcursor\b"],
    "Midjourney": [r"\bmidjourney\b"],
    "Canva": [r"\bcanva\b", r"канва"],
    "CapCut": [r"\bcapcut\b", r"капкат"],
    "Adobe": [r"\badobe\b"],
    "Figma": [r"\bfigma\b"],
    "Freepik": [r"\bfreepik\b"],
    "Envato": [r"\benvato\b"],
    "YouTube Premium": [r"\byoutube\b", r"ютуб", r"ютюб"],
    "Spotify": [r"\bspotify\b", r"спотиф"],
    "Apple Music": [r"apple\s+music", r"эпл\s+music"],
    "Yandex Plus": [r"yandex\s+plus", r"яндекс\s+плюс", r"яндекс\+"],
    "Yandex Music": [r"яндекс\s+музык", r"yandex\s+music"],
    "Netflix": [r"\bnetflix\b", r"нетфликс"],
    "Kinopoisk": [r"кинопоиск", r"\bkinopoisk\b"],
    "IVI": [r"\bivi\b", r"\bиви\b"],
    "MEGOGO": [r"\bmegogo\b", r"мегого"],
    "Crunchyroll": [r"\bcrunchyroll\b"],
    "Microsoft 365": [r"microsoft\s*365", r"\boffice\s*365\b", r"майкрософт\s*365"],
    "iCloud+": [r"\bicloud\b", r"айклауд"],
    "Telegram Premium": [r"telegram\s+premium", r"телеграм\s+premium", r"тг\s+premium"],
    "Discord Nitro": [r"discord\s+nitro", r"дискорд\s+nitro"],
    "X Premium": [r"\bx\s+premium\b", r"twitter\s+premium", r"твиттер"],
    "Duolingo": [r"\bduolingo\b", r"дуолинго"],
    "Coursera": [r"\bcoursera\b", r"курсера"],
    "Udemy": [r"\budemy\b"],
    "VPN": [r"\bvpn\b", r"\bnordvpn\b", r"\bsurfshark\b"],
    "Beeline": [r"\bbeeline\b", r"билайн"],
    "Tele2": [r"\btele2\b", r"теле2"],
    "Activ": [r"\bactiv\b", r"актив"],
    "Altel": [r"\baltel\b", r"алтел"],
    "Kcell": [r"\bkcell\b", r"кселл"],
}

TOPIC_PATTERNS: dict[str, list[str]] = {
    "accounts": [
        r"аккаунт", r"активац", r"инвайт", r"промокод", r"логин", r"парол", r"общий доступ",
        r"готовый аккаунт", r"личн\w+\s+аккаунт", r"на ваш аккаунт",
    ],
    "family_subscriptions": [
        r"семь", r"семейк", r"подписк", r"мест[ао]", r"вступ", r"добав", r"участник",
    ],
    "family_tariffs": [
        r"тариф", r"семейн\w+\s+тариф", r"оператор", r"минут", r"безлимит",
    ],
    "gb_market": [
        r"\bгб\b", r"гигабайт", r"трафик", r"продам\s+\d+\s*гб", r"куплю\s+\d+\s*гб",
    ],
    "risk_scam": [
        r"скам", r"мошен", r"обман", r"кинул", r"предоплат", r"бан", r"слет", r"удалил",
        r"баланс", r"карта", r"возврат", r"заблок",
    ],
}

PRICE_RE = re.compile(
    r"(?<!\w)(?:от\s*)?\d[\d\s.,]{0,10}\s*(?:₸|тг|тенге|kzt|\$|usd|eur|€|руб|₽)(?!\w)",
    re.IGNORECASE,
)
MENTION_RE = re.compile(r"(?<!\w)@[A-Za-z0-9_]{3,32}")


def html_files(export_dir: Path) -> list[Path]:
    def sort_key(path: Path) -> int:
        match = re.search(r"messages(\d*)\.html$", path.name)
        if not match:
            return 10**9
        return int(match.group(1) or "1")

    return sorted(export_dir.glob("messages*.html"), key=sort_key)


def clean_text(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def match_any(text_lower: str, patterns: list[str]) -> bool:
    return any(re.search(pattern, text_lower, re.IGNORECASE) for pattern in patterns)


def detect_services(text: str) -> list[str]:
    text_lower = text.lower()
    return [name for name, patterns in SERVICE_PATTERNS.items() if match_any(text_lower, patterns)]


def detect_topics(text: str) -> list[str]:
    text_lower = text.lower()
    return [name for name, patterns in TOPIC_PATTERNS.items() if match_any(text_lower, patterns)]


def extract_messages_from_file(path: Path) -> list[dict[str, Any]]:
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
    records: list[dict[str, Any]] = []
    current_day: str | None = None

    for message in soup.select("div.message"):
        classes = set(message.get("class", []))
        body = message.select_one("div.body")

        if "service" in classes:
            details = clean_text(message.get_text("\n", strip=True))
            if re.search(r"\d{4}$", details) or re.search(r"\d{1,2}\s+\w+\s+\d{4}", details):
                current_day = details
            continue

        text_node = message.select_one("div.text")
        if not text_node:
            text_node = message.select_one("div.media_wrap")
        if not text_node:
            continue

        text = clean_text(text_node.get_text("\n", strip=True))
        if not text:
            continue

        date_node = message.select_one("div.date")
        from_node = message.select_one("div.from_name")
        links = [a.get("href") for a in text_node.select("a[href]") if a.get("href")]
        mentions = sorted(set(MENTION_RE.findall(text)))
        prices = sorted(set(match.group(0).strip() for match in PRICE_RE.finditer(text)))
        services = detect_services(text)
        topics = detect_topics(text)

        records.append(
            {
                "record_id": f"{path.stem}:{message.get('id', '')}",
                "source_file": path.name,
                "message_id": message.get("id"),
                "day": current_day,
                "date": date_node.get("title") if date_node else None,
                "time": clean_text(date_node.get_text(" ", strip=True)) if date_node else None,
                "author": clean_text(from_node.get_text(" ", strip=True)) if from_node else None,
                "text": text,
                "links": links,
                "mentions": mentions,
                "prices": prices,
                "services": services,
                "topics": topics,
            }
        )

    return records


def build_index(export_dir: Path, output_dir: Path) -> None:
    files = html_files(export_dir)
    if not files:
        raise SystemExit(f"No messages*.html files found in {export_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)

    service_counts: Counter[str] = Counter()
    topic_counts: Counter[str] = Counter()
    author_counts: Counter[str] = Counter()
    service_samples: dict[str, list[dict[str, Any]]] = defaultdict(list)
    topic_samples: dict[str, list[dict[str, Any]]] = defaultdict(list)
    total_messages = 0

    messages_path = output_dir / "messages.jsonl"
    with messages_path.open("w", encoding="utf-8") as out:
        for file in files:
            records = extract_messages_from_file(file)
            for record in records:
                total_messages += 1
                if record["author"]:
                    author_counts[record["author"]] += 1
                for service in record["services"]:
                    service_counts[service] += 1
                    if len(service_samples[service]) < 8:
                        service_samples[service].append(sample_record(record))
                for topic in record["topics"]:
                    topic_counts[topic] += 1
                    if len(topic_samples[topic]) < 8:
                        topic_samples[topic].append(sample_record(record))
                out.write(json.dumps(record, ensure_ascii=False) + "\n")

    service_mentions = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_dir": str(export_dir),
        "html_files": len(files),
        "messages": total_messages,
        "services": {
            service: {"count": count, "samples": service_samples.get(service, [])}
            for service, count in service_counts.most_common()
        },
    }
    (output_dir / "service_mentions.json").write_text(
        json.dumps(service_mentions, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    topic_mentions = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "topics": {
            topic: {"count": count, "samples": topic_samples.get(topic, [])}
            for topic, count in topic_counts.most_common()
        },
    }
    (output_dir / "topic_mentions.json").write_text(
        json.dumps(topic_mentions, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    write_markdown_summary(
        output_dir=output_dir,
        export_dir=export_dir,
        files_count=len(files),
        total_messages=total_messages,
        service_counts=service_counts,
        topic_counts=topic_counts,
        author_counts=author_counts,
        service_samples=service_samples,
        topic_samples=topic_samples,
    )


def sample_record(record: dict[str, Any]) -> dict[str, Any]:
    text = record["text"].replace("\n", " ")
    if len(text) > 260:
        text = text[:257] + "..."
    return {
        "record_id": record["record_id"],
        "date": record["date"] or record["day"],
        "author": record["author"],
        "prices": record["prices"][:5],
        "text": text,
    }


def write_markdown_summary(
    output_dir: Path,
    export_dir: Path,
    files_count: int,
    total_messages: int,
    service_counts: Counter[str],
    topic_counts: Counter[str],
    author_counts: Counter[str],
    service_samples: dict[str, list[dict[str, Any]]],
    topic_samples: dict[str, list[dict[str, Any]]],
) -> None:
    lines: list[str] = [
        "# Telegram Chat Knowledge Base",
        "",
        f"- Source: `{export_dir}`",
        f"- HTML files: {files_count}",
        f"- Parsed messages: {total_messages}",
        f"- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "## Top Services",
        "",
    ]

    for service, count in service_counts.most_common(30):
        lines.append(f"- **{service}**: {count}")

    lines.extend(["", "## Topics", ""])
    for topic, count in topic_counts.most_common():
        lines.append(f"- **{topic}**: {count}")

    lines.extend(["", "## Active Authors", ""])
    for author, count in author_counts.most_common(25):
        lines.append(f"- **{author}**: {count}")

    lines.extend(["", "## Service Samples", ""])
    for service, _ in service_counts.most_common(15):
        lines.append(f"### {service}")
        for sample in service_samples.get(service, [])[:5]:
            price = f" | prices: {', '.join(sample['prices'])}" if sample["prices"] else ""
            lines.append(f"- `{sample['record_id']}` {sample['date'] or ''} {sample['author'] or ''}{price}: {sample['text']}")
        lines.append("")

    lines.extend(["", "## Topic Samples", ""])
    for topic, _ in topic_counts.most_common():
        lines.append(f"### {topic}")
        for sample in topic_samples.get(topic, [])[:5]:
            price = f" | prices: {', '.join(sample['prices'])}" if sample["prices"] else ""
            lines.append(f"- `{sample['record_id']}` {sample['date'] or ''} {sample['author'] or ''}{price}: {sample['text']}")
        lines.append("")

    (output_dir / "summary.md").write_text("\n".join(lines), encoding="utf-8")


def search_index(output_dir: Path, query: str, limit: int) -> list[dict[str, Any]]:
    messages_path = output_dir / "messages.jsonl"
    if not messages_path.exists():
        raise SystemExit(f"Missing {messages_path}. Run build first.")

    terms = [term.lower() for term in re.findall(r"\w+", query, flags=re.UNICODE) if len(term) >= 2]
    if not terms:
        raise SystemExit("Query must contain at least one searchable word.")

    scored: list[tuple[int, dict[str, Any]]] = []
    with messages_path.open("r", encoding="utf-8") as src:
        for line in src:
            record = json.loads(line)
            haystack = " ".join(
                [
                    record.get("text") or "",
                    record.get("author") or "",
                    " ".join(record.get("services") or []),
                    " ".join(record.get("topics") or []),
                ]
            ).lower()
            score = sum(haystack.count(term) for term in terms)
            if score:
                scored.append((score, record))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [record for _, record in scored[:limit]]


def main() -> None:
    parser = argparse.ArgumentParser(description="Build and search local knowledge from Telegram HTML export.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    build_parser = subparsers.add_parser("build")
    build_parser.add_argument("--export-dir", type=Path, default=DEFAULT_EXPORT_DIR)
    build_parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)

    search_parser = subparsers.add_parser("search")
    search_parser.add_argument("query")
    search_parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    search_parser.add_argument("--limit", type=int, default=10)

    args = parser.parse_args()
    if args.command == "build":
        build_index(args.export_dir, args.output_dir)
        print(f"Built knowledge base in {args.output_dir}")
    elif args.command == "search":
        for record in search_index(args.output_dir, args.query, args.limit):
            text = record["text"].replace("\n", " ")
            if len(text) > 420:
                text = text[:417] + "..."
            print(f"[{record['record_id']}] {record.get('date') or record.get('day') or ''} {record.get('author') or ''}")
            print(text)
            if record.get("prices"):
                print("prices:", ", ".join(record["prices"]))
            if record.get("services"):
                print("services:", ", ".join(record["services"]))
            print()


if __name__ == "__main__":
    main()
