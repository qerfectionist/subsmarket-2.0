import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-bg-primary)]">
            {/* Main content */}
            <main className="flex-1 pb-20">
                <Outlet />
            </main>

            {/* Bottom navigation */}
            <BottomNav />
        </div>
    );
}
