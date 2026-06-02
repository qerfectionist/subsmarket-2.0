import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

const HIDE_NAV_PATTERNS = ['/clubs/create', '/gb-market/sell'];
const HIDE_NAV_EXACT = ['/onboarding'];

export function Layout() {
    const { pathname } = useLocation();
    const showNav = !HIDE_NAV_EXACT.includes(pathname) && !HIDE_NAV_PATTERNS.some(p => pathname.startsWith(p));

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F4EF] text-[#111111]">
            <main className={`flex-1 pt-[env(safe-area-inset-top)] ${showNav ? 'pb-[calc(84px+env(safe-area-inset-bottom))]' : 'pb-0'} relative`}>
                <Outlet />
            </main>

            {showNav && <BottomNav />}
        </div>
    );
}
