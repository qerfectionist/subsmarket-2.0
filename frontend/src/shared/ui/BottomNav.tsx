import { NavLink } from 'react-router-dom';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { t } from '@/shared/i18n';

// Simple SVG Icons for Navigation
const Icons = {
    Home: ({ isActive }: { isActive?: boolean }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" stroke={isActive ? "black" : "currentColor"} strokeWidth={isActive ? "2" : "2"} />
        </svg>
    ),
    Clubs: ({ isActive }: { isActive?: boolean }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
    ),
    Market: ({ isActive }: { isActive?: boolean }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    ),
    Profile: ({ isActive }: { isActive?: boolean }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
};

const navItems = [
    { path: '/', label: () => t('nav', 'home'), Icon: Icons.Home },
    { path: '/clubs', label: () => t('nav', 'clubs'), Icon: Icons.Clubs },
    { path: '/gb-market', label: () => 'Market', Icon: Icons.Market },
    { path: '/profile', label: () => t('nav', 'profile'), Icon: Icons.Profile },
];

export function BottomNav() {
    const haptic = useHaptic();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--color-separator)] z-[100]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex justify-around items-center h-[52px]">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => haptic.selection()}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 active:scale-95 ${isActive
                                ? 'text-white'
                                : 'text-white/40 hover:text-white/60'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.Icon isActive={isActive} />
                                <span className={`text-[10px] font-medium leading-none mt-1 tracking-wide ${isActive ? 'font-bold' : ''}`}>
                                    {item.label()}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
