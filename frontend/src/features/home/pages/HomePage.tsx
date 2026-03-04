import { t } from '@/shared/i18n';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { Card, CardBody, Skeleton } from '@heroui/react';
import { MSIcon } from '@/shared/ui/MSIcon';

export function HomePage() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

    const { data: profile, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => api.getMe(),
    });

    const clubCount = (profile as any)?.clubs_count ?? 0;
    const trustScore = (profile as any)?.trust_score ?? 5.0;
    const dealsCount = (profile as any)?.p2p_deals_count ?? 0;

    return (
        <div className="flex flex-col min-h-[100dvh] bg-background text-foreground pb-28">
            <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-6">
                {/* Header */}
                <header className="pt-2">
                    <div className="text-[10px] text-default-400 uppercase tracking-[0.25em] font-bold mb-2 flex items-center gap-2">
                        <span className="inline-block w-1 h-1 rounded-full bg-success animate-pulse" />
                        Welcome Back
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight leading-none text-foreground">
                        {user?.first_name || 'User'}
                    </h1>
                    <p className="text-default-500 mt-1.5 text-xs font-medium tracking-wide">
                        {t('home', 'subtitle')}
                    </p>
                </header>

                {/* Action Hub */}
                <section className="grid grid-cols-2 gap-3">
                    <Card as={Link} to="/clubs?type=digital" isPressable shadow="sm" className="h-full">
                        <CardBody className="p-4 flex flex-col justify-between min-h-[140px]">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                                <MSIcon name="grid_view" size={22} filled />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base leading-tight mb-1 text-foreground">{t('home', 'subscriptions')}</h3>
                                <p className="text-xs text-default-500 font-medium leading-relaxed line-clamp-2">
                                    {t('home', 'subscriptions_desc')}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card as={Link} to="/clubs?type=telecom" isPressable shadow="sm" className="h-full">
                        <CardBody className="p-4 flex flex-col justify-between min-h-[140px]">
                            <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3">
                                <MSIcon name="wifi" size={22} filled />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base leading-tight mb-1 text-foreground">{t('home', 'telecom')}</h3>
                                <p className="text-xs text-default-500 font-medium leading-relaxed line-clamp-2">
                                    {t('home', 'telecom_desc')}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card as={Link} to="/gb-market" isPressable shadow="sm" className="col-span-2">
                        <CardBody className="p-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-success/10 text-success flex items-center justify-center">
                                    <MSIcon name="storefront" size={22} filled />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base leading-tight text-foreground">{t('home', 'gb_market')}</h3>
                                    <p className="text-xs text-default-500 font-medium mt-0.5">
                                        {t('home', 'gb_market_desc')}
                                    </p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center text-default-400">
                                <MSIcon name="chevron_right" size={16} />
                            </div>
                        </CardBody>
                    </Card>

                    {/* Coming Soon */}
                    <Card className="col-span-2 bg-content2/50 border-dashed border-1 border-default-200 opacity-60">
                        <CardBody className="p-4 flex flex-row items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-default-200/50 text-default-400 flex items-center justify-center">
                                <MSIcon name="person_add" size={18} filled />
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                                <h3 className="font-semibold text-sm text-default-500 tracking-tight">{t('home', 'accounts')}</h3>
                                <span className="text-[10px] bg-default-200 text-default-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    Soon
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                </section>

                {/* Stats */}
                <Card shadow="sm">
                    {isLoading ? (
                        <CardBody className="p-5 grid grid-cols-3 gap-4 text-center divide-x divide-default-100">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <Skeleton className="h-7 w-12 rounded-lg" />
                                    <Skeleton className="h-3 w-16 rounded" />
                                </div>
                            ))}
                        </CardBody>
                    ) : (
                        <CardBody className="p-5 grid grid-cols-3 gap-4 text-center divide-x divide-default-100">
                            <div className="flex flex-col gap-1">
                                <div className="text-2xl font-bold tracking-tight tabular-nums text-foreground">{clubCount}</div>
                                <div className="text-[10px] text-default-400 uppercase tracking-widest font-medium">{t('home', 'stats_clubs')}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
                                    {typeof trustScore === 'number' ? trustScore.toFixed(1) : trustScore}
                                </div>
                                <div className="text-[10px] text-default-400 uppercase tracking-widest font-medium">{t('home', 'stats_rating')}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="text-2xl font-bold tracking-tight tabular-nums text-foreground">{dealsCount}</div>
                                <div className="text-[10px] text-default-400 uppercase tracking-widest font-medium">{t('home', 'stats_deals')}</div>
                            </div>
                        </CardBody>
                    )}
                </Card>
            </main>
        </div>
    );
}

export default HomePage;
