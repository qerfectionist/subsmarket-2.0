/**
 * Static service catalog — used as fallback when pricing API is unavailable.
 * Data matches backend/data/pricing_database.json
 */

export interface CatalogService {
    id: string;
    name: string;
    logo: string;
    category: string;
    familySize: number;
    billingCycle: 'monthly' | 'yearly';
    priceRange: { min: number; max: number; recommended: number };
}

export interface ServiceCategory {
    key: string;
    label: string;
    icon: string;
}

// ─── Categories ──────────────────────────────────────────────
export const SERVICE_CATEGORIES: ServiceCategory[] = [
    { key: 'all', label: 'Все', icon: '🔥' },
    { key: 'video', label: 'Видео', icon: '📺' },
    { key: 'music', label: 'Музыка', icon: '🎵' },
    { key: 'cloud', label: 'Облако & AI', icon: '☁️' },
    { key: 'education', label: 'Обучение', icon: '🎓' },
    { key: 'telecom', label: 'Связь', icon: '📡' },
];

// ─── Services ────────────────────────────────────────────────
export const STATIC_SERVICES: CatalogService[] = [
    // ── Видео ──
    {
        id: 'youtube_premium',
        name: 'YouTube Premium',
        logo: 'youtube',
        category: 'video',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 800, max: 1200, recommended: 1000 },
    },
    {
        id: 'netflix',
        name: 'Netflix',
        logo: 'netflix',
        category: 'video',
        familySize: 5,
        billingCycle: 'monthly',
        priceRange: { min: 1200, max: 2000, recommended: 1500 },
    },
    {
        id: 'yandex_plus',
        name: 'Яндекс Плюс',
        logo: 'yandex',
        category: 'video',
        familySize: 4,
        billingCycle: 'yearly',
        priceRange: { min: 2000, max: 4000, recommended: 3000 },
    },
    {
        id: 'kinopoisk',
        name: 'Кинопоиск',
        logo: 'kinopoisk',
        category: 'video',
        familySize: 4,
        billingCycle: 'monthly',
        priceRange: { min: 500, max: 800, recommended: 600 },
    },
    {
        id: 'ivi',
        name: 'IVI',
        logo: 'ivi',
        category: 'video',
        familySize: 5,
        billingCycle: 'monthly',
        priceRange: { min: 400, max: 700, recommended: 500 },
    },
    {
        id: 'megogo',
        name: 'MEGOGO',
        logo: 'megogo',
        category: 'video',
        familySize: 5,
        billingCycle: 'monthly',
        priceRange: { min: 500, max: 800, recommended: 600 },
    },
    {
        id: 'crunchyroll',
        name: 'Crunchyroll',
        logo: 'crunchyroll',
        category: 'video',
        familySize: 4,
        billingCycle: 'monthly',
        priceRange: { min: 600, max: 1000, recommended: 800 },
    },

    // ── Музыка ──
    {
        id: 'spotify',
        name: 'Spotify',
        logo: 'spotify',
        category: 'music',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 600, max: 1000, recommended: 800 },
    },
    {
        id: 'apple_music',
        name: 'Apple Music',
        logo: 'apple',
        category: 'music',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 800, max: 1200, recommended: 1000 },
    },

    // ── Облако & AI ──
    {
        id: 'microsoft_365',
        name: 'Microsoft 365',
        logo: 'microsoft',
        category: 'cloud',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 600, max: 1000, recommended: 750 },
    },
    {
        id: 'google_one_2tb',
        name: 'Google One 2TB',
        logo: 'google',
        category: 'cloud',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 400, max: 600, recommended: 500 },
    },
    {
        id: 'google_one_ai_premium',
        name: 'Google AI Premium',
        logo: 'google',
        category: 'cloud',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 2500, max: 3500, recommended: 3000 },
    },
    {
        id: 'yandex_360',
        name: 'Яндекс 360',
        logo: 'yandex',
        category: 'cloud',
        familySize: 1,
        billingCycle: 'yearly',
        priceRange: { min: 3500, max: 4500, recommended: 4100 },
    },
    {
        id: 'icloud_plus',
        name: 'iCloud+',
        logo: 'apple',
        category: 'cloud',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 300, max: 500, recommended: 400 },
    },

    // ── Обучение ──
    {
        id: 'duolingo_family',
        name: 'Duolingo Family',
        logo: 'duolingo',
        category: 'education',
        familySize: 6,
        billingCycle: 'yearly',
        priceRange: { min: 2400, max: 4200, recommended: 4000 },
    },
    {
        id: 'headspace',
        name: 'Headspace',
        logo: 'headspace',
        category: 'education',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 500, max: 800, recommended: 600 },
    },

    // ── Семейные тарифы связи ──
    {
        id: 'activ',
        name: 'Activ Family',
        logo: 'activ',
        category: 'telecom',
        familySize: 10,
        billingCycle: 'monthly',
        priceRange: { min: 1000, max: 3000, recommended: 2500 },
    },
    {
        id: 'kcell',
        name: 'Kcell Family',
        logo: 'kcell',
        category: 'telecom',
        familySize: 10,
        billingCycle: 'monthly',
        priceRange: { min: 1000, max: 3000, recommended: 2500 },
    },
    {
        id: 'beeline',
        name: 'Beeline Family',
        logo: 'beeline',
        category: 'telecom',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 1500, max: 3500, recommended: 2500 },
    },
    {
        id: 'tele2',
        name: 'Tele2 Family',
        logo: 'tele2',
        category: 'telecom',
        familySize: 6,
        billingCycle: 'monthly',
        priceRange: { min: 1500, max: 3000, recommended: 2500 },
    },
];

// ─── Service Logo Colors ─────────────────────────────────────
/** Brand-inspired gradient colors for service logos */
export const SERVICE_COLORS: Record<string, string> = {
    youtube: '#FF0000',
    netflix: '#E50914',
    yandex: '#FFCC00',
    kinopoisk: '#FF6600',
    ivi: '#00B4FF',
    megogo: '#1DB954',
    crunchyroll: '#F47521',
    spotify: '#1DB954',
    apple: '#A2AAAD',
    microsoft: '#00A4EF',
    google: '#4285F4',
    duolingo: '#58CC02',
    headspace: '#F47D31',
    activ: '#00A651',
    kcell: '#652D90',
    beeline: '#FFD400',
    tele2: '#111111',
};

export const SERVICE_ICONS: Record<string, string> = {
    youtube: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=256',
    netflix: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=256',
    kinopoisk: 'https://www.google.com/s2/favicons?domain=kinopoisk.ru&sz=256',
    spotify: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=256',
    apple: 'https://www.google.com/s2/favicons?domain=apple.com&sz=256',
    ivi: 'https://www.google.com/s2/favicons?domain=ivi.ru&sz=256',
    megogo: 'https://www.google.com/s2/favicons?domain=megogo.net&sz=256',
    crunchyroll: 'https://www.google.com/s2/favicons?domain=crunchyroll.com&sz=256',
    yandex: 'https://www.google.com/s2/favicons?domain=yandex.ru&sz=256',
    microsoft: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=256',
    google: 'https://www.google.com/s2/favicons?domain=google.com&sz=256',
    duolingo: 'https://www.google.com/s2/favicons?domain=duolingo.com&sz=256',
    headspace: 'https://www.google.com/s2/favicons?domain=headspace.com&sz=256',
    activ: 'https://www.google.com/s2/favicons?domain=activ.kz&sz=256',
    kcell: 'https://www.google.com/s2/favicons?domain=kcell.kz&sz=256',
    beeline: 'https://www.google.com/s2/favicons?domain=beeline.kz&sz=256',
    tele2: 'https://www.google.com/s2/favicons?domain=tele2.kz&sz=256',
};
