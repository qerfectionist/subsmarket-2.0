# 🎨 SubsMarket Design System (iOS 2026)

Строгая дизайн-система, основанная на Apple Human Interface Guidelines и спецификациях Telegram Mini Apps.
Приоритет: Ясность, Функциональность, Нативность.

---

## 1. Фундаментальные принципы (Core Principles)

*   **Content First:** Интерфейс отступает на второй план, подчеркивая контент.
*   **Touch-First:** Все интерактивные элементы имеют размер не менее **44x44pt**.
*   **System Native:** Шрифты, скругления и физика анимаций соответствуют платформе (iOS).
*   **Zero Noise:** Никаких декоративных градиентов, теней или эмодзи, если они не несут смысловой нагрузки.

---

## 2. Типографика (Typography)

Используется системный шрифт (`-apple-system`, `SF Pro`).

| Style | Size (pt) | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Large Title** | 34 | Bold | 41 | 0.37 | Заголовки страниц |
| **Title 1** | 28 | Bold | 34 | 0.36 | Секции |
| **Title 2** | 22 | Bold | 28 | 0.35 | Карточки |
| **Headline** | 17 | Semibold | 22 | -0.41 | Важный текст |
| **Body** | 17 | Regular | 22 | -0.41 | Основной контент |
| **Callout** | 16 | Regular | 21 | -0.32 | Подсказки |
| **Subhead** | 15 | Regular | 20 | -0.24 | Подзаголовки |
| **Footnote** | 13 | Regular | 18 | -0.08 | Дисклеймеры |
| **Caption 1** | 12 | Regular | 16 | 0 | Мелкие подписи |

---

## 3. Цветовая палитра (Color System)

Цвета жестко привязаны к теме Telegram (`var(--tg-theme-...)`).

### Semantic Colors
*   **Primary Background:** `#000000` (Dark) / `#FFFFFF` (Light) — `bg-primary`
*   **Secondary Background:** `#1C1C1E` (Dark) / `#F2F2F7` (Light) — `bg-secondary` (Grouped Content)
*   **Tertiary Background:** `#2C2C2E` (Dark) / `#FFFFFF` (Light) — `bg-tertiary` (Inputs, Items)
*   **Accent:** `#007AFF` (Blue) — Интерактивные элементы.
*   **Success:** `#34C759` (Green)
*   **Warning:** `#FFCC00` (Yellow)
*   **Error:** `#FF3B30` (Red)

### Text Colors
*   **Primary:** `#FFFFFF` (Dark) — Основной текст.
*   **Secondary:** `#8E8E93` (Gray) — Второстепенный текст.
*   **Tertiary:** `#636366` — Неактивный текст.

---

## 4. Компоненты (Components)

### Cards (Grouped Style)
*   **Radius:** 20px (iPhone X+ curvature).
*   **Padding:** 16px.
*   **Background:** `bg-secondary`.
*   **Border:** Отсутствует (контраст за счет фона).

### Lists (Settings Style)
*   Элементы списка разделены линией (Separator) с отступом `16px` слева.
*   Высота строки: мин. 44px.
*   Активное состояние: затемнение фона.

### Buttons
*   **Height:** 50px (Large), 44px (Regular).
*   **Radius:** 14px (Continuous curvature).
*   **Feedback:** `transform: scale(0.96)` при нажатии + Haptic Impact (Light).

### Inputs
*   **Height:** 44px.
*   **Background:** `bg-tertiary`.
*   **Radius:** 12px.
*   **Focus:** Цвет акцента в рамке или курсоре.

---

## 5. Layout & Spacing

*   **Margins:** 16px (Compact), 20px (Regular).
*   **Spacing System:** 4px grid (4, 8, 12, 16, 24, 32).
*   **Safe Area:** Обязательный учет `env(safe-area-inset-bottom)`.

---

## 6. Haptics (Тактильный отклик)

*   **Selection:** При скролле пикеров или переключении табов.
*   **Impact (Light):** При нажатии на любую кнопку.
*   **Impact (Medium/Heavy):** При важных действиях (Покупка, Удаление).
*   **Notification:** Только при результате (Успех/Ошибка).
