/**
 * Internationalization (i18n) for SubsMarket
 * Supports: Russian (ru), Kazakh (kk)
 */

type Language = 'ru' | 'kk';

type TranslationKeys = {
    common: {
        loading: string;
        error: string;
        back: string;
        save: string;
        cancel: string;
        confirm: string;
        retry: string;
        close: string;
        search: string;
        empty: string;
        soon: string;
    };
    nav: {
        home: string;
        clubs: string;
        gb_market: string;
        profile: string;
    };
    home: {
        greeting: string;
        subtitle: string;
        subscriptions: string;
        subscriptions_desc: string;
        telecom: string;
        telecom_desc: string;
        gb_market: string;
        gb_market_desc: string;
        accounts: string;
        accounts_desc: string;
        stats_title: string;
        stats_clubs: string;
        stats_rating: string;
        stats_deals: string;
    };
    clubs: {
        title: string;
        subtitle: string;
        filter_all: string;
        filter_digital: string;
        filter_telecom: string;
        create_club: string;
        empty: string;
        members: string;
        per_month: string;
        join: string;
        full: string;
        frozen: string;
    };
    club_details: {
        host: string;
        price: string;
        payment_day: string;
        payment_method: string;
        credentials: string;
        login: string;
        password: string;
        rules: string;
        telegram_group: string;
        leave_club: string;
        confirm_leave: string;
    };
    create_club: {
        title: string;
        select_service: string;
        total_price: string;
        max_members: string;
        price_per_person: string;
        credentials_title: string;
        credentials_hint: string;
        payment_method: string;
        payment_details: string;
        payment_day: string;
        description: string;
        rules: string;
        submit: string;
    };
    profile: {
        title: string;
        my_clubs: string;
        settings: string;
        language: string;
        about: string;
        logout: string;
    };
};

const translations: Record<Language, TranslationKeys> = {
    ru: {
        common: {
            loading: 'Загрузка...',
            error: 'Ошибка',
            back: 'Назад',
            save: 'Сохранить',
            cancel: 'Отмена',
            confirm: 'Подтвердить',
            retry: 'Повторить',
            close: 'Закрыть',
            search: 'Поиск...',
            empty: 'Ничего не найдено',
            soon: 'Скоро',
        },
        nav: {
            home: 'Главная',
            clubs: 'Клубы',
            gb_market: 'GB',
            profile: 'Профиль',
        },
        home: {
            greeting: 'Привет',
            subtitle: 'Твоя площадка для подписок и гигабайтов',
            subscriptions: 'Подписки',
            subscriptions_desc: 'Netflix, Spotify, YouTube',
            telecom: 'Связь',
            telecom_desc: 'Beeline, Tele2, Altel',
            gb_market: 'GB Маркет',
            gb_market_desc: 'Купить и продать ГБ',
            accounts: 'Аккаунты',
            accounts_desc: 'Скоро',
            stats_title: 'Твоя статистика',
            stats_clubs: 'Клубов',
            stats_rating: 'Рейтинг',
            stats_deals: 'Сделок',
        },
        clubs: {
            title: 'Клубы',
            subtitle: 'Семейные подписки дешевле',
            filter_all: 'Все',
            filter_digital: 'Цифровые',
            filter_telecom: 'Связь',
            create_club: 'Создать клуб',
            empty: 'Клубы не найдены',
            members: 'участников',
            per_month: '₸/мес',
            join: 'Вступить',
            full: 'Полный',
            frozen: 'Заморожен',
        },
        club_details: {
            host: 'Организатор',
            price: 'Стоимость',
            payment_day: 'День оплаты',
            payment_method: 'Способ оплаты',
            credentials: 'Данные для входа',
            login: 'Логин',
            password: 'Пароль',
            rules: 'Правила',
            telegram_group: 'Чат клуба',
            leave_club: 'Покинуть клуб',
            confirm_leave: 'Вы уверены, что хотите покинуть клуб?',
        },
        create_club: {
            title: 'Новый клуб',
            select_service: 'Выберите сервис',
            total_price: 'Общая стоимость',
            max_members: 'Макс. участников',
            price_per_person: 'с человека',
            credentials_title: 'Данные аккаунта',
            credentials_hint: 'Будут видны только оплатившим',
            payment_method: 'Способ оплаты',
            payment_details: 'Реквизиты (номер Kaspi)',
            payment_day: 'День оплаты (1-31)',
            description: 'Описание',
            rules: 'Правила клуба',
            submit: 'Создать клуб',
        },
        profile: {
            title: 'Профиль',
            my_clubs: 'Мои клубы',
            settings: 'Настройки',
            language: 'Язык',
            about: 'О приложении',
            logout: 'Выйти',
        },
    },
    kk: {
        common: {
            loading: 'Жүктелуде...',
            error: 'Қате',
            back: 'Артқа',
            save: 'Сақтау',
            cancel: 'Болдырмау',
            confirm: 'Растау',
            retry: 'Қайталау',
            close: 'Жабу',
            search: 'Іздеу...',
            empty: 'Ештеңе табылмады',
            soon: 'Жақында',
        },
        nav: {
            home: 'Басты',
            clubs: 'Клубтар',
            gb_market: 'GB',
            profile: 'Профиль',
        },
        home: {
            greeting: 'Сәлем',
            subtitle: 'Жазылымдар мен гигабайттарға арналған алаң',
            subscriptions: 'Жазылымдар',
            subscriptions_desc: 'Netflix, Spotify, YouTube',
            telecom: 'Байланыс',
            telecom_desc: 'Beeline, Tele2, Altel',
            gb_market: 'GB Маркет',
            gb_market_desc: 'ГБ сатып алу және сату',
            accounts: 'Аккаунттар',
            accounts_desc: 'Жақында',
            stats_title: 'Сіздің статистика',
            stats_clubs: 'Клубтар',
            stats_rating: 'Рейтинг',
            stats_deals: 'Мәмілелер',
        },
        clubs: {
            title: 'Клубтар',
            subtitle: 'Отбасылық жазылымдар арзанырақ',
            filter_all: 'Барлығы',
            filter_digital: 'Цифрлық',
            filter_telecom: 'Байланыс',
            create_club: 'Клуб құру',
            empty: 'Клубтар табылмады',
            members: 'қатысушылар',
            per_month: '₸/ай',
            join: 'Қосылу',
            full: 'Толық',
            frozen: 'Тоқтатылған',
        },
        club_details: {
            host: 'Ұйымдастырушы',
            price: 'Құны',
            payment_day: 'Төлем күні',
            payment_method: 'Төлем әдісі',
            credentials: 'Кіру деректері',
            login: 'Логин',
            password: 'Құпия сөз',
            rules: 'Ережелер',
            telegram_group: 'Клуб чаты',
            leave_club: 'Клубтан шығу',
            confirm_leave: 'Клубтан шыққыңыз келетініне сенімдісіз бе?',
        },
        create_club: {
            title: 'Жаңа клуб',
            select_service: 'Сервисті таңдаңыз',
            total_price: 'Жалпы құны',
            max_members: 'Макс. қатысушылар',
            price_per_person: 'адамнан',
            credentials_title: 'Аккаунт деректері',
            credentials_hint: 'Тек төлегендерге көрінеді',
            payment_method: 'Төлем әдісі',
            payment_details: 'Деректемелер (Kaspi нөмірі)',
            payment_day: 'Төлем күні (1-31)',
            description: 'Сипаттама',
            rules: 'Клуб ережелері',
            submit: 'Клуб құру',
        },
        profile: {
            title: 'Профиль',
            my_clubs: 'Менің клубтарым',
            settings: 'Баптаулар',
            language: 'Тіл',
            about: 'Қолданба туралы',
            logout: 'Шығу',
        },
    },
};

/**
 * Get user's preferred language from Telegram or browser
 */
function detectLanguage(): Language {
    // Check Telegram language
    const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
    if (tgLang === 'kk') return 'kk';

    // Check browser language
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang === 'kk') return 'kk';

    // Default to Russian
    return 'ru';
}

// Current language state
let currentLanguage: Language = detectLanguage();

/**
 * Get translation for a key path
 */
export function t<
    S extends keyof TranslationKeys,
    K extends keyof TranslationKeys[S]
>(section: S, key: K): string {
    return translations[currentLanguage][section][key] as string;
}

/**
 * Get current language
 */
export function getLanguage(): Language {
    return currentLanguage;
}

/**
 * Set current language
 */
export function setLanguage(lang: Language): void {
    currentLanguage = lang;
    localStorage.setItem('lang', lang);
}

/**
 * Initialize language from storage
 */
export function initLanguage(): void {
    const stored = localStorage.getItem('lang') as Language | null;
    if (stored && (stored === 'ru' || stored === 'kk')) {
        currentLanguage = stored;
    }
}

// Initialize on load
initLanguage();

export type { Language, TranslationKeys };
