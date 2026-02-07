# 📜 SubsMarket: Текстовые строки и i18n
>
> Готовые тексты для интерфейса (русский)
> Дата: 2026-02-06

---

## 🏠 Главный экран

```yaml
home:
  greeting: "Привет, {name}!"
  search_placeholder: "Поиск семьи..."
  popular_services: "🔥 Популярные сервисы"
  new_clubs: "📢 Новые семьи"
  no_results: "Ничего не найдено"
  try_different_filters: "Попробуйте изменить фильтры"
```

---

## 📋 Клубы

```yaml
clubs:
  # Карточка
  card:
    price_per_month: "{price} ₸/мес"
    price_per_year: "{price} ₸/год"
    spots: "{current}/{max} мест"
    free_spots: "{count} свободных мест"
    no_spots: "Мест нет"
    payment_day: "Оплата {day} числа"
    region: "Регион: {region}"
  
  # Детальная страница
  detail:
    owner: "👤 Владелец семьи"
    member_since: "На платформе с {date}"
    description: "ℹ️ Описание"
    members: "👥 Участники ({current}/{max})"
    member_host: "{name} (хост)"
    spot_free: "Свободно"
    
  # Важные предупреждения
  warnings:
    title: "⚠️ Важно"
    pay_after_join: "Платите только ПОСЛЕ вступления в семью"
    verify_recipient: "Проверьте имя получателя в Kaspi"
    monthly_recommended: "Рекомендуем помесячную оплату для снижения рисков"
  
  # Кнопки
  buttons:
    join: "Подать заявку"
    write: "💬 Написать"
    manage: "Управление"
    
  # Статусы заявок
  request_status:
    pending: "Ожидает рассмотрения"
    approved: "Одобрено"
    rejected: "Отклонено"
    
  # Создание
  create:
    title: "Создание семьи"
    step: "({current}/{total})"
    select_service: "Выберите сервис"
    settings: "Настройка"
    payment: "Реквизиты для оплаты"
    
    # Поля формы
    price_label: "Цена за участника"
    price_hint: "💡 Рекомендованная: {min}-{max}₸"
    max_members: "Максимум участников"
    payment_day: "День оплаты"
    payment_day_hint: "числа каждого месяца"
    region: "Регион подписки"
    description: "Описание (опционально)"
    bank: "Банк"
    phone: "Номер телефона"
    phone_hint: "✅ Участники увидят для оплаты"
    recipient_name: "Имя получателя"
    recipient_hint: "💡 Для проверки участниками"
    
    # Превью
    preview: "Предпросмотр"
    
    # Кнопки
    next: "Далее →"
    create: "Создать семью"
    
  # Успех
  success:
    created: "🎉 Семья создана!"
    share: "Поделитесь ссылкой, чтобы привлечь участников"
```

---

## 💰 Маркетплейс

```yaml
market:
  title: "💰 Маркетплейс ГБ"
  create_listing: "Продать ГБ"
  
  # Карточка
  card:
    gb_price: "{gb} ГБ × {price}₸ = {total}₸"
    time_ago: "{time} назад"
    buy: "Купить"
    
  # Создание объявления
  create:
    title: "Продать ГБ"
    operator: "Оператор"
    volume: "Объём"
    volume_unit: "ГБ"
    price_per_gb: "Цена за 1 ГБ"
    price_hint: "💡 Рекомендованная: {min}-{max}₸"
    total: "Итого: {gb} ГБ × {price}₸ = {total}₸"
    publish: "Опубликовать"
    
  # Статусы
  status:
    active: "Активно"
    reserved: "Зарезервировано"
    sold: "Продано"
    expired: "Истекло"
    
  # Фильтры
  filters:
    all: "Все"
    min_gb: "Мин. ГБ"
    max_price: "Макс. цена"
```

---

## 👤 Профиль

```yaml
profile:
  title: "👤 Мой профиль"
  
  # Статистика
  stats:
    deals: "Сделок"
    clubs: "Семьи"
    listings: "Объявл."
    
  # Секции
  sections:
    my_clubs_host: "🏠 Мои семьи (как хост)"
    my_clubs_member: "👥 Я участник"
    my_listings: "💰 Мои объявления ({count} активных)"
    payment_details: "💳 Мои реквизиты"
    
  # Кнопки
  buttons:
    edit: "Изменить"
    settings: "Настройки"
    
  # Trust
  trust:
    rating: "⭐ {score} ({deals} сделок)"
    deals_count: "{count} сделок"
```

---

## 🏷️ Бейджи

```yaml
badges:
  newbie: "🆕 Новичок"
  verified: "✅ Проверенный"
  experienced: "🥉 Опытный продавец"
  gold: "🥇 Золотой продавец"
  platinum: "💎 Платиновый продавец"
  fast_responder: "⚡ Быстро отвечает"
  top_weekly: "🔥 Топ недели"
  
  # Подсказки
  hints:
    newbie: "0 сделок"
    verified: "10+ сделок, рейтинг ≥ 4.5"
    experienced: "50+ сделок, рейтинг ≥ 4.5"
    gold: "100+ сделок, рейтинг ≥ 4.8"
    platinum: "500+ сделок, рейтинг = 5.0"
    fast_responder: "Среднее время ответа < 1 час"
```

---

## 🔔 Уведомления

```yaml
notifications:
  # Напоминания об оплате
  payment:
    reminder_3days: "📅 Через 3 дня оплата за {service}. Сумма: {amount}₸"
    reminder_today: "⏰ Сегодня оплата за {service}! Сумма: {amount}₸. Kaspi: {phone}"
    
  # Заявки
  requests:
    new: "📩 Новая заявка на вступление в {club} от {user}"
    approved: "✅ Ваша заявка в {club} одобрена!"
    rejected: "❌ Ваша заявка в {club} отклонена"
    
  # Сделки
  transactions:
    completed: "✅ Сделка завершена! Ваш рейтинг: ⭐ {score}"
    buyer_confirmed: "👍 Покупатель подтвердил получение"
    seller_confirmed: "👍 Продавец подтвердил отправку"
    
  # Модерация
  moderation:
    complaint_received: "⚠️ На вас подана жалоба. Подробности в профиле"
    complaint_resolved: "✅ Жалоба рассмотрена. Решение: {outcome}"
```

---

## ⚠️ Ошибки и предупреждения

```yaml
errors:
  # Общие
  generic: "Что-то пошло не так. Попробуйте позже"
  network: "Нет подключения к интернету"
  server: "Сервер недоступен"
  
  # Валидация
  validation:
    required: "Обязательное поле"
    invalid_phone: "Неверный формат номера"
    price_too_low: "Цена слишком низкая"
    price_too_high: "Цена слишком высокая"
    min_gb: "Минимум {min} ГБ"
    
  # Лимиты
  limits:
    max_clubs: "Достигнут лимит клубов. Оформите подписку"
    max_listings: "Достигнут лимит объявлений"
    cooldown: "Подождите {seconds} секунд"
    
  # Trust
  trust:
    low_rating: "Ваш рейтинг слишком низкий для этого действия"
    account_too_new: "Аккаунт слишком новый. Подождите {days} дней"

warnings:
  # Подтверждения
  confirm_delete: "Вы уверены? Это действие нельзя отменить"
  confirm_kick: "Исключить {user} из семьи?"
  
  # Рекомендации
  price_above_market: "⚠️ Цена выше рыночной ({recommended}₸)"
  price_below_market: "⚠️ Цена подозрительно низкая"
```

---

## 🎯 CTA и кнопки

```yaml
buttons:
  # Основные
  submit: "Отправить"
  save: "Сохранить"
  cancel: "Отмена"
  close: "Закрыть"
  back: "Назад"
  next: "Далее"
  done: "Готово"
  
  # Действия
  create: "Создать"
  edit: "Редактировать"
  delete: "Удалить"
  share: "Поделиться"
  copy: "Копировать"
  
  # Специфичные
  join_club: "Подать заявку"
  leave_club: "Покинуть семью"
  approve: "Одобрить"
  reject: "Отклонить"
  kick: "Исключить"
  confirm_payment: "Оплатил"
  confirm_received: "Получил"
  confirm_sent: "Отправил"
  report: "Пожаловаться"
```

---

## 📊 Пустые состояния

```yaml
empty_states:
  no_clubs: 
    title: "Нет семей"
    description: "Создайте свою семью или найдите существующую"
    action: "Найти семью"
    
  no_listings:
    title: "Нет объявлений"
    description: "Пока никто не продаёт ГБ по этому оператору"
    action: "Создать объявление"
    
  no_requests:
    title: "Нет заявок"
    description: "Когда кто-то захочет вступить в вашу семью, заявка появится здесь"
    
  no_transactions:
    title: "Нет сделок"
    description: "Ваша история сделок пуста"
```

---

## 🌍 Регионы

```yaml
regions:
  KZ: "🇰🇿 Казахстан"
  RU: "🇷🇺 Россия"
  TR: "🇹🇷 Турция"
  PL: "🇵🇱 Польша"
  UA: "🇺🇦 Украина"
  US: "🇺🇸 США"
  EU: "🇪🇺 Европа"
  GLOBAL: "🌍 Весь мир"
```

---

## 📱 Операторы

```yaml
operators:
  altel: "Алтел"
  activ: "Актив"
  tele2: "Теле2"
  beeline: "Билайн"
```

---

## ⏰ Время

```yaml
time:
  just_now: "только что"
  minutes_ago: "{count} мин. назад"
  hours_ago: "{count} ч. назад"
  days_ago: "{count} дн. назад"
  today: "сегодня"
  yesterday: "вчера"
  
  months:
    - "января"
    - "февраля"
    - "марта"
    - "апреля"
    - "мая"
    - "июня"
    - "июля"
    - "августа"
    - "сентября"
    - "октября"
    - "ноября"
    - "декабря"
```
