import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { t, getLanguage, setLanguage, Language } from '@/shared/i18n';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { Avatar } from '@/shared/ui/Avatar';
import { LoadingScreen } from '@/shared/ui/Spinner';
import { Progress } from '@/shared/ui/Progress';

export function ProfilePage() {
    const haptic = useHaptic();
    const [currentLang, setLang] = useState<Language>(getLanguage());

    const { data: user, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => api.getMe(),
    });

    const handleLanguageChange = (lang: Language) => {
        haptic.selection();
        setLanguage(lang);
        setLang(lang);
        window.location.reload();
    };

    if (isLoading) {
        return <LoadingScreen label={t('common', 'loading')} />;
    }

    return (
        <div className="p-4 pb-28 space-y-6">
            {/* Header */}
            <header className="flex items-center gap-5">
                <Avatar
                    src={(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || undefined}
                    name={user?.first_name || undefined}
                    className="w-20 h-20 text-2xl border-2 border-white/10 shadow-2xl"
                />
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight truncate leading-tight">
                        {user?.first_name || 'User'}
                    </h1>
                    <p className="text-white/40 text-sm font-medium tracking-wide mb-2 truncate">
                        @{user?.username || 'no_username'}
                    </p>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-white/80 text-[10px] font-bold uppercase tracking-widest">
                        PREMIUM MEMBER
                    </div>
                </div>
            </header>

            {/* Trust Score */}
            <div className="glass-card p-6 relative overflow-hidden group">
                <div className="relative z-10">
                    <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">
                        Trust Score
                    </h2>
                    <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-5xl font-black bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent tracking-tighter">
                            {(user as any)?.trust_score || '5.0'}
                        </span>
                        <span className="text-lg font-bold text-white/20">/ 5.0</span>
                    </div>
                    <Progress
                        value={((user as any)?.trust_score || 5) * 20}
                        color="default"
                        size="md"
                        className="bg-white/5"
                        showValueLabel={false}
                    />
                    <p className="text-white/40 text-[10px] font-medium tracking-wide mt-3 uppercase">
                        Excellent Reputation
                    </p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
            </div>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 gap-3">
                <StatCard
                    label={t('home', 'stats_deals')}
                    value={(user as any)?.p2p_deals_count || 0}
                    sub="Total Deals"
                />
                <StatCard
                    label={t('home', 'stats_clubs')}
                    value={0}
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
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
                    {t('profile', 'settings')}
                </h3>
                <div className="glass-card p-1 space-y-1">
                    <MenuButton label={t('profile', 'my_clubs')} sub="Manage your memberships" onClick={() => haptic.impact('light')} />
                    <MenuButton label="Security & Trust" sub="Password, 2FA, Reviews" onClick={() => haptic.impact('light')} />
                    <MenuButton label={t('profile', 'about')} sub="Version, Terms, Support" onClick={() => haptic.impact('light')} />
                </div>
            </section>

            {/* Language */}
            <section className="space-y-3">
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
                    {t('profile', 'language')}
                </h3>
                <div className="glass-card p-1 flex">
                    <LangOption
                        active={currentLang === 'ru'}
                        label="RU"
                        sub="Russian"
                        onClick={() => handleLanguageChange('ru')}
                    />
                    <div className="w-px bg-white/5 my-2" />
                    <LangOption
                        active={currentLang === 'kk'}
                        label="KZ"
                        sub="Kazakh"
                        onClick={() => handleLanguageChange('kk')}
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-8 text-center opacity-20 hover:opacity-40 transition-opacity">
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase">
                    SubsMarket 2.0
                </p>
                <p className="text-[9px] mt-2 font-mono">
                    EST. 2026 • ALMATY
                </p>
            </footer>
        </div>
    );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
    return (
        <div className="glass-card p-5 flex flex-col justify-between min-h-[100px] hover:bg-white/5 transition-colors">
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">{label}</div>
            <div>
                <div className="text-[28px] font-semibold tracking-tight text-white/90 leading-none mb-1">{value}</div>
                <div className="text-[11px] font-medium text-white/50">{sub}</div>
            </div>
        </div>
    );
}

function MenuButton({ label, sub, onClick }: { label: string, sub: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors group text-left active:scale-[0.99]"
        >
            <div>
                <div className="font-semibold text-[15px] tracking-tight text-white/90 mb-0.5">{label}</div>
                <div className="text-[11px] text-white/50 font-medium">{sub}</div>
            </div>
            <span className="text-white/20 group-hover:text-white/60 text-lg transition-colors font-light">›</span>
        </button>
    );
}

function LangOption({ active, label, sub, onClick }: { active: boolean, label: string, sub: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 px-4 rounded-xl transition-all text-center group active:scale-95 ${active
                ? 'bg-white/10 shadow-inner'
                : 'hover:bg-white/5'
                }`}
        >
            <div className={`text-[17px] font-semibold tracking-tight ${active ? 'text-white' : 'text-white/40'}`}>{label}</div>
            <div className={`text-[10px] uppercase tracking-wide font-medium ${active ? 'text-white/60' : 'text-white/20'}`}>{sub}</div>
        </button>
    );
}
