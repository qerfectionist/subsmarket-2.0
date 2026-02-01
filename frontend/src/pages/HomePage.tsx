export function HomePage() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

    return (
        <div className="p-4">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold">
                    Привет{user?.first_name ? `, ${user.first_name}` : ''}! 👋
                </h1>
                <p className="text-secondary mt-1">
                    Твоя площадка для подписок и гигабайтов
                </p>
            </header>

            {/* Action Hub */}
            <section className="grid grid-cols-2 gap-3 mb-6">
                <ActionCard
                    emoji="📺"
                    title="Подписки"
                    subtitle="Netflix, Spotify, YouTube"
                    href="/clubs?type=digital"
                />
                <ActionCard
                    emoji="📱"
                    title="Связь"
                    subtitle="Beeline, Tele2, Altel"
                    href="/clubs?type=telecom"
                />
                <ActionCard
                    emoji="📊"
                    title="GB Маркет"
                    subtitle="Купить и продать ГБ"
                    href="/gb-market"
                />
                <ActionCard
                    emoji="🔐"
                    title="Аккаунты"
                    subtitle="Скоро"
                    disabled
                />
            </section>

            {/* Stats placeholder */}
            <section className="card">
                <h2 className="text-lg font-semibold mb-3">Твоя статистика</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <StatItem value="0" label="Клубов" />
                    <StatItem value="5.0" label="Рейтинг" />
                    <StatItem value="0" label="Сделок" />
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
            <div className="text-xl font-bold text-accent">{value}</div>
            <div className="text-xs text-tertiary">{label}</div>
        </div>
    );
}
