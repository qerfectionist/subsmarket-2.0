import { NavLink } from 'react-router-dom';
import { useHaptic } from '@/hooks/useHaptic';
import { t } from '@/i18n';

const navItems = [
    { path: '/', label: () => t('nav', 'home'), icon: '🏠' },
    { path: '/clubs', label: () => t('nav', 'clubs'), icon: '👥' },
    { path: '/gb-market', label: () => t('nav', 'gb_market'), icon: '📊' },
    { path: '/profile', label: () => t('nav', 'profile'), icon: '👤' },
];

export function BottomNav() {
    const haptic = useHaptic();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-default)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => haptic.impact('light')}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 px-4 py-2 transition-colors duration-150 ${isActive
                                ? 'text-[var(--color-accent)]'
                                : 'text-[var(--color-text-tertiary)]'
                            }`
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs font-medium">{item.label()}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
