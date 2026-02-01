import { t } from '@/i18n';

export function HomePage() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

    return (
        <div className="p-4">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold">
                    {t('home', 'greeting')}{user?.first_name ? `, ${user.first_name}` : ''}! 👋
                </h1>
                <p className="text-secondary mt-1">
                    {t('home', 'subtitle')}
                </p>
            </header>

            {/* Action Hub */}
            <section className="grid grid-cols-2 gap-3 mb-6">
                <ActionCard
                    emoji="📺"
                    title={t('home', 'subscriptions')}
                    subtitle={t('home', 'subscriptions_desc')}
                    href="/clubs?type=digital"
                />
                <ActionCard
                    emoji="📱"
                    title={t('home', 'telecom')}
                    subtitle={t('home', 'telecom_desc')}
                    href="/clubs?type=telecom"
                />
                <ActionCard
                    emoji="📊"
                    title={t('home', 'gb_market')}
                    subtitle={t('home', 'gb_market_desc')}
                    href="/gb-market"
                />
                <ActionCard
                    emoji="🔐"
                    title={t('home', 'accounts')}
                    subtitle={t('home', 'accounts_desc')}
                    disabled
                />
            </section>

            {/* Stats */}
            <section className="card">
                <h2 className="text-lg font-semibold mb-3">{t('home', 'stats_title')}</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <StatItem value="0" label={t('home', 'stats_clubs')} />
                    <StatItem value="5.0" label={t('home', 'stats_rating')} />
                    <StatItem value="0" label={t('home', 'stats_deals')} />
                </div>
            </section>
        </div>
    );
}

function ActionCard({
    emoji,
    title,
    subtitle,
    href,
    disabled
}: {
    emoji: string;
    title: string;
    subtitle: string;
    href?: string;
    disabled?: boolean;
}) {
    const content = (
        <>
            <span className="text-3xl mb-2">{emoji}</span>
            <span className="font-semibold">{title}</span>
            <span className="text-xs text-secondary">{subtitle}</span>
        </>
    );

    if (disabled) {
        return (
            <div className="card flex flex-col items-center text-center opacity-50 cursor-not-allowed">
                {content}
            </div>
        );
    }

    return (
        <a
            href={href}
            className="card flex flex-col items-center text-center hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
            {content}
        </a>
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
