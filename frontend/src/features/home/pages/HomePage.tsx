import { t } from '@/shared/i18n';

import { Link } from 'react-router-dom';

export function HomePage() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

    return (
        <div className="p-4 space-y-6 pb-28">
            {/* Header */}
            <header>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">Welcome Back</div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                    {user?.first_name || 'User'}
                </h1>
                <p className="text-white/60 mt-1 text-sm tracking-wide">
                    {t('home', 'subtitle')}
                </p>
            </header>

            {/* Action Hub */}
            <section className="grid grid-cols-2 gap-4"> {/* Increased gap */}
                <Link to="/clubs?type=digital" className="block h-full group">
                    <div className="glass-card p-6 h-full transition-all active:scale-[0.98] group-hover:bg-white/5 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl mb-4 font-bold border border-blue-500/10">S</div>
                            <h3 className="font-semibold text-[17px] leading-tight mb-1 tracking-tight">{t('home', 'subscriptions')}</h3>
                        </div>
                        <p className="text-[11px] text-white/50 font-medium leading-relaxed mt-2 line-clamp-2">
                            {t('home', 'subscriptions_desc')}
                        </p>
                    </div>
                </Link>

                <Link to="/clubs?type=telecom" className="block h-full group">
                    <div className="glass-card p-6 h-full transition-all active:scale-[0.98] group-hover:bg-white/5 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl mb-4 font-bold border border-purple-500/10">T</div>
                            <h3 className="font-semibold text-[17px] leading-tight mb-1 tracking-tight">{t('home', 'telecom')}</h3>
                        </div>
                        <p className="text-[11px] text-white/50 font-medium leading-relaxed mt-2 line-clamp-2">
                            {t('home', 'telecom_desc')}
                        </p>
                    </div>
                </Link>

                <Link to="/gb-market" className="block h-full col-span-2 group"> {/* Full width for Market */}
                    <div className="glass-card p-6 h-full transition-all active:scale-[0.98] group-hover:bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/10">G</div>
                            <div>
                                <h3 className="font-semibold text-[17px] leading-tight tracking-tight">{t('home', 'gb_market')}</h3>
                                <p className="text-[13px] text-white/50 font-medium leading-relaxed mt-0.5">
                                    {t('home', 'gb_market_desc')}
                                </p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-colors">
                            →
                        </div>
                    </div>
                </Link>

                <div className="block h-full opacity-40 cursor-not-allowed col-span-2">
                    <div className="glass-card p-4 h-full bg-white/5 border-dashed border-white/10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-500/10 text-gray-400 flex items-center justify-center text-lg font-bold border border-gray-500/10">A</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base text-white/60 tracking-tight">{t('home', 'accounts')}</h3>
                                <span className="text-[9px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <div className="glass-card p-5">
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/10">
                    <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold tracking-tight">0</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-medium">{t('home', 'stats_clubs')}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold tracking-tight">5.0</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-medium">{t('home', 'stats_rating')}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold tracking-tight">0</div>
                        <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-medium">{t('home', 'stats_deals')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}


