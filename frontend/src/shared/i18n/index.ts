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
    market: {
        title: string;
        subtitle: string;
        buy: string;
        sell: string;
        history: string;
        live: string;
        no_offers: string;
        good_deal: string;
        hot: string;
        seller: string;
        buyer: string;
        buy_action: string;
    };
    listing: {
        title: string;
        operator: string;
        amount: string;
        price: string;
        recommended: string;
        warn_operator: string;
        warn_manual: string;
        submit: string;
        publishing: string;
        error_amount_msg: string;
        error_price_msg: string;
        error_create_msg: string;
    };
    deal: {
        title: string;
        status_created: string;
        status_paid: string;
        status_completed: string;
        status_disputed: string;
        payment_pending: string;
        waiting_seller: string;
        deal_completed: string;
        dispute_open: string;
        pay_title: string;
        pay_desc: string;
        upload_receipt: string;
        confirm_title: string;
        confirm_desc: string;
        confirm_action: string;
        dispute_action: string;
        open_dispute: string;
        protection_ends: string;
        status_cancelled: string;
        status_paid_by_buyer: string;
        pay_btn: string;
        confirm_btn: string;
        item_id: string;
        type: string;
        current_status: string;
        confirm_without_receipt: string;
        confirm_fund_received: string;
        buyer_id: string;
        seller_id: string;
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
        market: {
            title: 'GB Маркет',
            subtitle: 'Обмен трафиком мгновенно',
            buy: 'Купить',
            sell: 'Продать',
            history: 'История',
            live: 'Live',
            no_offers: 'Нет предложений...',
            good_deal: 'Выгодная цена!',
            hot: 'HOT',
            seller: 'Продавец',
            buyer: 'Покупатель',
            buy_action: 'Купить',
        },
        listing: {
            title: 'Продать ГБ',
            operator: 'Оператор',
            amount: 'Количество ГБ',
            price: 'Цена (₸)',
            recommended: 'Рекомендуемая цена',
            warn_operator: 'Внимательно выбирайте оператора.',
            warn_manual: 'Сделка проходит в ручном режиме.',
            submit: 'Создать объявление',
            publishing: 'Публикация...',
            error_amount_msg: 'Введите корректный объем ГБ',
            error_price_msg: 'Минимальная цена 100 ₸',
            error_create_msg: 'Ошибка при создании объявления',
        },
        deal: {
            title: 'Детали сделки',
            status_created: 'Создана',
            status_paid: 'Оплачена',
            status_completed: 'Завершена',
            status_disputed: 'Спор',
            payment_pending: 'Ожидает оплаты',
            waiting_seller: 'Ожидает продавца',
            deal_completed: 'Сделка завершена',
            dispute_open: 'Открыт спор',
            pay_title: 'Оплата сделки',
            pay_desc: 'Переведите сумму на карту продавца',
            upload_receipt: 'Загрузить чек',
            confirm_title: 'Подтверждение',
            confirm_desc: 'Проверьте поступление средств',
            confirm_action: 'Подтвердить оплату',
            dispute_action: 'Открыть спор',
            open_dispute: 'Открыть спор',
            protection_ends: 'Защита истекает через',
            status_cancelled: 'Отменена',
            status_paid_by_buyer: 'Оплачена',
            pay_btn: 'Я оплатил',
            confirm_btn: 'Подтвердить получение',
            item_id: 'ID товара',
            type: 'Тип',
            current_status: 'Статус',
            confirm_without_receipt: 'Вы уверены, что хотите отметить как оплаченное без чека?',
            confirm_fund_received: 'Подтверждаете получение средств? Это действие нельзя отменить.',
            buyer_id: 'ID Покупателя',
            seller_id: 'ID Продавца',
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
        market: {
            title: 'GB Маркет',
            subtitle: 'Мобильді трафикті алмасу',
            buy: 'Сатып алу',
            sell: 'Сату',
            history: 'Тарих',
            live: 'Live',
            no_offers: 'Ұсыныстар жоқ...',
            good_deal: 'Тиімді баға!',
            hot: 'HOT',
            seller: 'Сатушы',
            buyer: 'Сатып алушы',
            buy_action: 'Сатып алу',
        },
        listing: {
            title: 'ГБ Сату',
            operator: 'Оператор',
            amount: 'ГБ саны',
            price: 'Бағасы (₸)',
            recommended: 'Ұсынылатын баға',
            warn_operator: 'Операторды мұқият таңдаңыз.',
            warn_manual: 'Мәміле қолмен жүргізіледі.',
            submit: 'Хабарландыру құру',
            publishing: 'Жариялануда...',
            error_amount_msg: 'ГБ санын дұрыс енгізіңіз',
            error_price_msg: 'Ең төменгі баға 100 ₸',
            error_create_msg: 'Хабарландыру құру қатесі',
        },
        deal: {
            title: 'Мәміле мәліметтері',
            status_created: 'Құрылды',
            status_paid: 'Төленді',
            status_completed: 'Аяқталды',
            status_disputed: 'Дау',
            payment_pending: 'Төлем күтілуде',
            waiting_seller: 'Сатушыны күту',
            deal_completed: 'Мәміле аяқталды',
            dispute_open: 'Дау ашық',
            pay_title: 'Мәміле төлемі',
            pay_desc: 'Сатушының картасына аударыңыз',
            upload_receipt: 'Чекті жүктеу',
            confirm_title: 'Растау',
            confirm_desc: 'Ақша түскенін тексеріңіз',
            confirm_action: 'Төлемді растау',
            dispute_action: 'Дау ашу',
            open_dispute: 'Дау ашу',
            protection_ends: 'Қорғау аяқталады',
            status_cancelled: 'Болдырылмады',
            status_paid_by_buyer: 'Төленді',
            pay_btn: 'Мен төледім',
            confirm_btn: 'Алуды растау',
            item_id: 'Тауар ID',
            type: 'Түрі',
            current_status: 'Мәртебе',
            confirm_without_receipt: 'Чексіз төленді деп белгілегіңіз келе ме?',
            confirm_fund_received: 'Ақша түскенін растайсыз ба? Бұл әрекетті болдырмау мүмкін емес.',
            buyer_id: 'Сатып алушы ID',
            seller_id: 'Сатушы ID',
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
