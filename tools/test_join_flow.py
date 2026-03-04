# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Тест flow: вступление в клуб + одобрение хостом
================================================
Запуск: python tools/test_join_flow.py
"""
import requests
import json

BASE = "http://localhost:8000/api/v1"

# ─── Пользователи ───────────────────────────────────────────────────────────
HOST_INIT    = "mock:95277:host_user"    # реальный хост (club host_id=95277)
VISITOR_INIT = "mock:99001:new_visitor"  # новый пользователь хочет вступить

def h(init_data: str) -> dict:
    return {"X-Telegram-Init-Data": init_data}

def sep(title: str):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print('='*50)

# ─── 1. Найти открытый телеком клуб ─────────────────────────────────────────
sep("1. Список клубов")
clubs = requests.get(f"{BASE}/clubs?status=open", headers=h(HOST_INIT)).json()
telecom = [c for c in clubs if c["category"] == "telecom"]
if not telecom:
    print("❌ Нет открытых телеком клубов — создайте через /admin")
    exit(1)

club = telecom[0]
club_id = club["club_id"]
print(f"✅ Клуб: {club['subscription']['service_name']}")
print(f"   ID: {club_id}")
print(f"   Хост ID: {club['host_id']}")
print(f"   Участников: {club['current_members']}/{club['max_members']}")

# ─── 2. Посетитель подаёт заявку ─────────────────────────────────────────────
sep("2. Посетитель (99001) вступает")
join_resp = requests.post(
    f"{BASE}/clubs/{club_id}/join",
    headers=h(VISITOR_INIT),
    json={"phone_number": "+7 777 999 00 01"}  # нужен для телеком
).json()
print(json.dumps(join_resp, ensure_ascii=False, indent=2))

# ─── 3. Хост смотрит заявки ──────────────────────────────────────────────────
sep("3. Хост (95277) смотрит список заявок")
pending = requests.get(
    f"{BASE}/clubs/{club_id}/pending",
    headers=h(HOST_INIT)
).json()

if isinstance(pending, dict) and "detail" in pending:
    print(f"❌ Ошибка: {pending['detail']}")
    exit(1)

print(f"📋 Заявок: {len(pending)}")
for p in pending:
    u = p["user"]
    print(f"\n  👤 {u.get('first_name') or u.get('username') or 'Пользователь'}")
    print(f"     Рейтинг: {u['trust_score']} | Сделок: {u['p2p_deals_count']}")
    print(f"     Телефон: {p.get('phone_number', 'нет')}")
    print(f"     member_id: {p['member_id']}")

if not pending:
    print("⚠️  Заявок нет — возможно пользователь уже в клубе или уже одобрен")
    exit(0)

# ─── 4. Хост принимает первую заявку ─────────────────────────────────────────
sep("4. Хост одобряет первую заявку")
member_id = pending[0]["member_id"]
approve_resp = requests.post(
    f"{BASE}/clubs/{club_id}/members/{member_id}/approve",
    headers=h(HOST_INIT)
).json()
print(json.dumps(approve_resp, ensure_ascii=False, indent=2))

# ─── 5. Проверяем что заявок больше нет ──────────────────────────────────────
sep("5. Проверяем pending после одобрения")
pending2 = requests.get(f"{BASE}/clubs/{club_id}/pending", headers=h(HOST_INIT)).json()
print(f"Заявок осталось: {len(pending2)}")

# ─── 6. Проверяем что пользователь теперь active ─────────────────────────────
sep("6. Члены клуба")
members = requests.get(f"{BASE}/clubs/{club_id}/members", headers=h(HOST_INIT)).json()
for m in members:
    u = m["user"]
    name = u.get('first_name') or u.get('username') or f"#{u['user_id']}"
    print(f"  {m['status']:10} | {name} | trust={u['trust_score']}")

sep("✅ ГОТОВО")
print("Flow работает! Теперь проверьте через браузер:")
print(f"   1. Откройте клуб как организатор")
print(f"   2. Нажмите 'Заявки на вступление'")
print(f"   3. Увидите карточку нового участника")
