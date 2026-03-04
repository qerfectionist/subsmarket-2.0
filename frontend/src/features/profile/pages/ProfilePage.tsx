import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { useTrustScore, useTrustHistory } from '@/shared/api/trust';
import { t, getLanguage, setLanguage, Language } from '@/shared/i18n';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { Avatar } from '@/shared/ui/Avatar';
import { LoadingScreen } from '@/shared/ui/Spinner';
import { Progress, Card, CardBody, Button, Chip } from '@heroui/react';
import { TrustBadge } from '@/shared/ui/TrustBadge';
import { TrustHistoryModal } from '@/shared/ui/TrustHistoryModal';
import { cn } from '@/shared/lib/utils';

export function ProfilePage() {
    const haptic = useHaptic();
    const [currentLang, setLang] = useState<Language>(getLanguage());
    const [showTrustHistory, setShowTrustHistory] = useState(false);

    const { data: user, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => api.getMe(),
    });

    const { data: trustData } = useTrustScore(user?.user_id || 0);

    const { data: trustHistoryData, isLoading: isHistoryLoading } = useTrustHistory(
        user?.user_id || 0
    );

    const handleLanguageChange = (lang: Language) => {
        haptic.selection();
        setLanguage(lang);
        setLang(lang);
        window.location.reload();
    };

    if (isLoading) {
        return <LoadingScreen label={t('common', 'loading')} />;
    }

    const score = Number(trustData?.trust_score ?? (user as any)?.trust_score ?? 5.0);
    const dealsCount = Number(trustData?.deals_count ?? (user as any)?.p2p_deals_count ?? 0);

    let reputationLabel = 'Требует внимания';
    if (score >= 4.5) reputationLabel = 'Отличная репутация';
    else if (score >= 3.5) reputationLabel = 'Хорошая репутация';
    else if (score >= 2.0) reputationLabel = 'Средняя репутация';

    return (
        <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-28">
            <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-6">
                {/* Header */}
                <header className="flex items-center gap-5 pt-2">
                    <Avatar
                        src={(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || undefined}
                        name={user?.first_name || undefined}
                        className="w-20 h-20 text-2xl shadow-md border border-default-100"
                    />
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight truncate leading-tight text-foreground">
                            {user?.first_name || 'User'}
                        </h1>
                        <p className="text-default-400 text-sm font-medium tracking-wide mb-2 truncate">
                            @{user?.username || 'no_username'}
                        </p>
                        <TrustBadge
                            trustScore={score}
                            dealsCount={dealsCount}
                            size="md"
                            showDeals={true}
                        />
                    </div>
                </header>

                {/* Trust Score Card */}
                <Card shadow="sm" className="overflow-hidden" isPressable onPress={() => {
                    haptic.impact('light');
                    setShowTrustHistory(!showTrustHistory);
                }}>
                    <CardBody className="p-6 relative">
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <h2 className="text-[10px] font-bold text-default-400 uppercase tracking-widest">
                                Trust Score
                            </h2>
                            <span className="text-xs text-primary font-medium hover:underline transition-all">
                                История ›
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-4 relative z-10">
                            <span className="text-5xl font-black text-foreground tracking-tighter">
                                {score.toFixed(1)}
                            </span>
                            <span className="text-lg font-bold text-default-300">/ 5.0</span>
                        </div>

                        <Progress
                            value={score * 20}
                            color={score >= 4.5 ? 'success' : score >= 3.0 ? 'primary' : 'warning'}
                            size="md"
                            className="bg-default-100 mb-4"
                            classNames={{
                                indicator: "transition-all ease-in-out duration-500",
                            }}
                            showValueLabel={false}
                            aria-label="Trust Score"
                        />

                        {/* Badges */}
                        {trustData?.badges && trustData.badges.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {trustData.badges.map((badge) => (
                                    <Chip
                                        key={badge.id}
                                        size="sm"
                                        variant="flat"
                                        color="default"
                                        className="text-xs font-medium"
                                        startContent={<span className="ml-1">{badge.icon}</span>}
                                    >
                                        {badge.name}
                                    </Chip>
                                ))}
                            </div>
                        )}

                        {/* Status warning */}
                        {score < 3.0 && (
                            <div className="mt-4 px-3 py-2 bg-warning/20 border border-warning/30 rounded-lg">
                                <p className="text-warning-600 text-xs font-semibold">⚠️ Низкий рейтинг</p>
                            </div>
                        )}

                        <p className="text-default-400 text-[10px] font-bold tracking-widest mt-4 uppercase">
                            {reputationLabel}
                        </p>
                    </CardBody>
                </Card>

                {/* Stats Grid */}
                <section className="grid grid-cols-2 gap-3">
                    <StatCard
                        label={t('home', 'stats_deals')}
                        value={(user as any)?.p2p_deals_count || 0}
                        sub="Total Deals"
                    />
                    <StatCard
                        label={t('home', 'stats_clubs')}
                        value={(user as any)?.clubs_count || 0}
                        sub="Active Clubs"
                    />
                    <StatCard
                        label="Volume"
                        value={(user as any)?.p2p_total_volume_gb || 0}
                        sub="GB Traded"
                    />
                    <StatCard
                        label="Success"
                        value={`${((user as any)?.p2p_success_count || 0)}%`}
                        sub="Rate"
                    />
                </section>

                {/* Menu */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-bold text-default-400 uppercase tracking-widest ml-1">
                        {t('profile', 'settings')}
                    </h3>
                    <Card shadow="sm" className="p-1">
                        <MenuButton label={t('profile', 'my_clubs')} sub="Manage your memberships" onClick={() => haptic.impact('light')} />
                        <MenuButton label="Security & Trust" sub="Password, 2FA, Reviews" onClick={() => haptic.impact('light')} />
                        <MenuButton label={t('profile', 'about')} sub="Version, Terms, Support" onClick={() => haptic.impact('light')} />
                    </Card>
                </section>

                {/* Language */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-bold text-default-400 uppercase tracking-widest ml-1">
                        {t('profile', 'language')}
                    </h3>
                    <Card shadow="sm" className="p-1 flex-row">
                        <LangOption
                            active={currentLang === 'ru'}
                            label="RU"
                            sub="Russian"
                            onClick={() => handleLanguageChange('ru')}
                        />
                        <div className="w-px bg-default-100 my-2" />
                        <LangOption
                            active={currentLang === 'kk'}
                            label="KZ"
                            sub="Kazakh"
                            onClick={() => handleLanguageChange('kk')}
                        />
                    </Card>
                </section>

                {/* Footer */}
                <footer className="pt-8 text-center text-default-300">
                    <p className="text-[9px] font-bold tracking-[0.3em] uppercase">
                        SubsMarket 2.0
                    </p>
                    <p className="text-[9px] mt-2 font-mono uppercase tracking-widest">
                        EST. 2026 • ALMATY
                    </p>
                </footer>

                {/* Trust History Modal */}
                <TrustHistoryModal
                    isOpen={showTrustHistory}
                    onClose={() => setShowTrustHistory(false)}
                    events={trustHistoryData?.events || []}
                    isLoading={isHistoryLoading}
                />
            </main>
        </div>
    );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
    return (
        <Card shadow="sm">
            <CardBody className="p-4 flex flex-col justify-between min-h-[100px]">
                <div className="text-[10px] font-bold text-default-400 uppercase tracking-widest mb-2">{label}</div>
                <div>
                    <div className="text-2xl font-bold tracking-tight text-foreground leading-none mb-1">{value}</div>
                    <div className="text-[10px] font-medium text-default-400 uppercase tracking-wider">{sub}</div>
                </div>
            </CardBody>
        </Card>
    );
}

function MenuButton({ label, sub, onClick }: { label: string, sub: string, onClick: () => void }) {
    return (
        <Button
            onPress={onClick}
            variant="light"
            className="w-full px-4 h-16 flex items-center justify-between rounded-xl data-[hover=true]:bg-default-100 text-left"
            fullWidth
            endContent={<span className="text-default-300 text-xl font-light">›</span>}
        >
            <div className="flex flex-col flex-1 truncate items-start">
                <div className="font-semibold text-sm tracking-tight text-foreground">{label}</div>
                <div className="text-xs text-default-400 font-medium">{sub}</div>
            </div>
        </Button>
    );
}

function LangOption({ active, label, sub, onClick }: { active: boolean, label: string, sub: string, onClick: () => void }) {
    return (
        <Button
            onPress={onClick}
            variant={active ? "flat" : "light"}
            color={active ? "primary" : "default"}
            className={cn(
                "flex-1 h-16 flex-col justify-center rounded-xl",
                active ? "bg-primary/10" : ""
            )}
        >
            <div className={cn("text-base font-bold tracking-tight", active ? "text-primary" : "text-foreground")}>{label}</div>
            <div className={cn("text-[9px] uppercase tracking-widest font-bold", active ? "text-primary/70" : "text-default-400")}>{sub}</div>
        </Button>
    );
}
