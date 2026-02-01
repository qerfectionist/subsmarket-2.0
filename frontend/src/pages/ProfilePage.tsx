import { t, getLanguage, setLanguage, Language } from '@/i18n';
import { useHaptic } from '@/hooks/useHaptic';
import { useState } from 'react';

export function ProfilePage() {
    const haptic = useHaptic();
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const [language, setLang] = useState<Language>(getLanguage());

    const handleLanguageChange = (lang: Language) => {
        haptic.selection();
        setLanguage(lang);
        setLang(lang);
        // Force re-render by reloading (in production, use state management)
        window.location.reload();
    };

    return (
        <div className="p-4">
            {/* Header */}
            <header className="mb-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-3xl">
                    {user?.photo_url ? (
                        <img
                            src={user.photo_url}
                            alt="Avatar"
                            className="w-full h-full rounded-full"
                        />
                    ) : (
                        '👤'
                    )}
                </div>
                <div>
                    <h1 className="text-xl font-bold">
                        {user?.first_name || 'Guest'} {user?.last_name || ''}
                    </h1>
                    {user?.username && (
                        <p className="text-secondary">@{user.username}</p>
                    )}
                </div>
            </header>

            {/* Stats */}
            <section className="card mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <StatItem value="0" label={t('home', 'stats_clubs')} />
                    <StatItem value="5.0" label={t('home', 'stats_rating')} />
                    <StatItem value="0" label={t('home', 'stats_deals')} />
                </div>
            </section>

            {/* Menu */}
            <section className="rounded-2xl overflow-hidden">
                <a href="/my-clubs" className="list-item">
                    <span className="text-xl">📋</span>
                    <span className="flex-1">{t('profile', 'my_clubs')}</span>
                    <span className="text-secondary">→</span>
                </a>

                <a href="/settings" className="list-item">
                    <span className="text-xl">⚙️</span>
                    <span className="flex-1">{t('profile', 'settings')}</span>
                    <span className="text-secondary">→</span>
                </a>
            </section>

            {/* Language selector */}
            <section className="mt-4">
                <h2 className="text-lg font-semibold mb-3">{t('profile', 'language')}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleLanguageChange('ru')}
                        className={`flex-1 py-3 rounded-xl font-medium transition-colors ${language === 'ru'
                                ? 'bg-[var(--color-accent)] text-white'
                                : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]'
                            }`}
                    >
                        🇷🇺 Русский
                    </button>
                    <button
                        onClick={() => handleLanguageChange('kk')}
                        className={`flex-1 py-3 rounded-xl font-medium transition-colors ${language === 'kk'
                                ? 'bg-[var(--color-accent)] text-white'
                                : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]'
                            }`}
                    >
                        🇰🇿 Қазақша
                    </button>
                </div>
            </section>

            {/* About */}
            <section className="mt-6 text-center text-secondary text-sm">
                <p>SubsMarket v2.0.0</p>
                <p className="mt-1">Made with ❤️ in Kazakhstan</p>
            </section>
        </div>
    );
}

function StatItem({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <div className="text-xl font-bold text-[var(--color-accent)]">{value}</div>
            <div className="text-xs text-tertiary">{label}</div>
        </div>
    );
}
