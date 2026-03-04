import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';
import { MSIcon } from './MSIcon';

// ─── Route config ─────────────────────────────────────────────────────────────

const ROUTES = [
    { key: 'home', path: '/', label: () => t('nav', 'home'), icon: 'home' },
    { key: 'clubs', path: '/clubs', label: () => t('nav', 'clubs'), icon: 'grid_view' },
    { key: 'gb', path: '/gb-market', label: () => t('nav', 'gb_market'), icon: 'storefront' },
    { key: 'profile', path: '/profile', label: () => t('nav', 'profile'), icon: 'person' },
] as const;

function pathToKey(pathname: string): string {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/clubs')) return 'clubs';
    if (pathname.startsWith('/gb-market')) return 'gb';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'home';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const activeKey = pathToKey(location.pathname);

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Floating pill */}
            <div className="mb-3 mx-4 w-full max-w-sm bg-content1 border border-default-100 rounded-2xl shadow-lg flex items-center h-[60px] px-1">
                {ROUTES.map(({ key, path, label, icon }) => {
                    const isActive = activeKey === key;
                    return (
                        <button
                            key={key}
                            onClick={() => {
                                if (!isActive) {
                                    haptic.selection();
                                    navigate(path);
                                }
                            }}
                            className={cn(
                                'relative flex flex-col items-center justify-center flex-1 h-[48px] rounded-xl gap-[2px]',
                                'transition-colors duration-200 active:scale-90 select-none',
                                isActive ? 'text-primary' : 'text-default-400',
                            )}
                        >
                            {/* Soft bg pill on active */}
                            {isActive && (
                                <span className="absolute inset-0 bg-primary/10 rounded-xl animate-in fade-in zoom-in-95 duration-200" />
                            )}

                            {/* Always filled icon — shared MSIcon with filled=true default */}
                            <MSIcon
                                name={icon}
                                size={22}
                                className="relative z-10"
                            />
                            <span className={cn(
                                'relative z-10 text-[10px] leading-none tracking-wide transition-all duration-200',
                                isActive ? 'font-bold' : 'font-medium',
                            )}>
                                {label()}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
