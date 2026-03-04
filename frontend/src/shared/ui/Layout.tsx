import { Outlet, useLocation, Link } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { MSIcon } from '@/shared/ui/MSIcon';

/** Routes where BottomNav is hidden (pages with their own bottom action bar) */
const HIDE_NAV_PATTERNS = ['/clubs/create', '/gb-market/sell'];

export function Layout() {
    const { pathname } = useLocation();
    const showNav = !HIDE_NAV_PATTERNS.some(p => pathname.startsWith(p));

    // Admin button is only shown if not on admin page
    const showAdminBtn = !pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            {/* Main content with safe area padding */}
            <main className={`flex-1 pt-[env(safe-area-inset-top)] ${showNav ? 'pb-28' : 'pb-0'} relative`}>
                <Outlet />
            </main>

            {/* Floating Admin Button */}
            {showAdminBtn && (
                <Link
                    to="/admin"
                    className="fixed right-4 z-50 flex items-center justify-center w-12 h-12 bg-danger text-white rounded-full shadow-lg shadow-danger/40 active:scale-95 transition-transform"
                    style={{ bottom: showNav ? 'calc(5rem + 16px)' : '2rem' }}
                >
                    <MSIcon name="admin_panel_settings" size={24} filled />
                </Link>
            )}

            {/* Bottom navigation — hidden on creation pages */}
            {showNav && <BottomNav />}
        </div>
    );
}
