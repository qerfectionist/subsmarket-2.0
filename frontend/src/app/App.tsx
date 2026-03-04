import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramProvider } from '@/app/providers/TelegramProvider';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Layout } from '@/shared/ui/Layout';
import { HeroUIProvider } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

// Lazy loaded pages for code splitting
const HomePage = lazy(() => import('@/features/home/pages/HomePage').then(m => ({ default: m.HomePage })));
const ClubsPage = lazy(() => import('@/features/clubs/pages/ClubsPage').then(m => ({ default: m.ClubsPage })));
const ClubDetailsPage = lazy(() => import('@/features/clubs/pages/ClubDetailsPage').then(m => ({ default: m.ClubDetailsPage })));
const CreateClubPage = lazy(() => import('@/features/clubs/pages/CreateClubPage').then(m => ({ default: m.CreateClubPage })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ReportUserPage = lazy(() => import('@/features/profile/pages/ReportUserPage').then(m => ({ default: m.ReportUserPage })));
const DemoPage = lazy(() => import('@/features/home/pages/DemoPage').then(m => ({ default: m.DemoPage })));
const GBMarketPage = lazy(() => import('@/features/market/pages/GBMarketPage').then(m => ({ default: m.GBMarketPage })));
const AccountsPage = lazy(() => import('@/features/market/pages/AccountsPage').then(m => ({ default: m.AccountsPage })));
const ComplaintsPage = lazy(() => import('@/pages/Admin/ComplaintsPage').then(m => ({ default: m.ComplaintsPage })));
const CreateListingPage = lazy(() => import('@/features/market/pages/CreateListingPage'));
const ReceiptAnalyzerPage = lazy(() => import('@/features/tools/pages/ReceiptAnalyzerPage'));
const DealPage = lazy(() => import('@/features/deals/pages/DealPage'));
const DealsListPage = lazy(() => import('@/features/deals/pages/DealsListPage'));
const AdminPanelPage = lazy(() => import('@/pages/Admin/AdminPanelPage'));
const ClubRequestsPage = lazy(() => import('@/features/clubs/pages/ClubRequestsPage').then(m => ({ default: m.ClubRequestsPage })));


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

function AppRoutes() {
    const navigate = useNavigate();

    return (
        <HeroUIProvider navigate={navigate} useHref={(href) => href}>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="clubs" element={<ClubsPage />} />
                        <Route path="clubs/create" element={<CreateClubPage />} />
                        <Route path="clubs/:id" element={<ClubDetailsPage />} />
                        <Route path="clubs/:id/requests" element={<ClubRequestsPage />} />
                        <Route path="gb-market" element={<GBMarketPage />} />
                        <Route path="gb-market/create" element={<CreateListingPage />} />
                        <Route path="accounts" element={<AccountsPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="report" element={<ReportUserPage />} />
                        <Route path="demo" element={<DemoPage />} />
                        <Route path="tools/receipt-analyzer" element={<ReceiptAnalyzerPage />} />
                        <Route path="my-clubs" element={<ClubsPage />} /> {/* Reuse with filter */}
                        <Route path="admin/complaints" element={<ComplaintsPage />} />
                        <Route path="admin" element={<AdminPanelPage />} />
                        {/* Deals */}
                        <Route path="deals" element={<DealsListPage />} />
                        <Route path="deals/:dealId" element={<DealPage />} />
                    </Route>
                </Routes>
            </Suspense>
        </HeroUIProvider>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <div className="dark bg-background text-foreground min-h-screen font-sans antialiased">
                <TelegramProvider>
                    <QueryClientProvider client={queryClient}>
                        <BrowserRouter>
                            <AppRoutes />
                        </BrowserRouter>
                    </QueryClientProvider>
                </TelegramProvider>
            </div>
        </ErrorBoundary>
    );
}

export default App;
