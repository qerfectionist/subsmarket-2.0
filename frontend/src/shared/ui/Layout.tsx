import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            {/* Main content with safe area padding */}
            <main className="flex-1 pb-28 pt-[env(safe-area-inset-top)]">
                <Outlet />
            </main>

            {/* Bottom navigation */}
            <BottomNav />
        </div>
    );
}
