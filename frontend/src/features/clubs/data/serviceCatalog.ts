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
};
