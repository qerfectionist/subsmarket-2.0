import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramProvider } from '@/app/providers/TelegramProvider';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Layout } from '@/shared/ui/Layout';

// Lazy loaded pages for code splitting
const HomePage = lazy(() => import('@/features/home/pages/HomePage').then(m => ({ default: m.HomePage })));
const ClubsPage = lazy(() => import('@/features/clubs/pages/ClubsPage').then(m => ({ default: m.ClubsPage })));
const ClubDetailsPage = lazy(() => import('@/features/clubs/pages/ClubDetailsPage').then(m => ({ default: m.ClubDetailsPage })));
const CreateClubPage = lazy(() => import('@/features/clubs/pages/CreateClubPage').then(m => ({ default: m.CreateClubPage })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const DemoPage = lazy(() => import('@/features/home/pages/DemoPage').then(m => ({ default: m.DemoPage })));
const GBMarketPage = lazy(() => import('@/features/market/pages/GBMarketPage').then(m => ({ default: m.GBMarketPage })));
const AccountsPage = lazy(() => import('@/features/market/pages/AccountsPage').then(m => ({ default: m.AccountsPage })));
const ComplaintsPage = lazy(() => import('@/pages/Admin/ComplaintsPage').then(m => ({ default: m.ComplaintsPage })));

// Loading fallback component
function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-secondary">Загрузка...</div>
        </div>
    );
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {
    return (
        <ErrorBoundary>
            <TelegramProvider>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/" element={<Layout />}>
                                    <Route index element={<HomePage />} />
                                    <Route path="clubs" element={<ClubsPage />} />
                                    <Route path="clubs/create" element={<CreateClubPage />} />
                                    <Route path="clubs/:id" element={<ClubDetailsPage />} />
                                    <Route path="gb-market" element={<GBMarketPage />} />
                                    <Route path="accounts" element={<AccountsPage />} />
                                    <Route path="profile" element={<ProfilePage />} />
                                    <Route path="demo" element={<DemoPage />} />
                                    <Route path="my-clubs" element={<ClubsPage />} /> {/* Reuse with filter */}
                                    <Route path="admin/complaints" element={<ComplaintsPage />} />
                                </Route>
                            </Routes>
                        </Suspense>
                    </BrowserRouter>
                </QueryClientProvider>
            </TelegramProvider>
        </ErrorBoundary>
    );
}

export default App;
