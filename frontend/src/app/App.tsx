import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramProvider } from '@/app/providers/TelegramProvider';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Layout } from '@/shared/ui/Layout';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { muiTheme } from '@/app/muiTheme';
import { routePreloads, warmupCoreData } from '@/app/routePreload';

// Lazy loaded pages
const HomePage = lazy(() => import('@/features/home/pages/HomePage').then(m => ({ default: m.HomePage })));
const OnboardingPage = lazy(() => import('@/features/home/pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const ClubsPage = lazy(() => import('@/features/clubs/pages/ClubsPage').then(m => ({ default: m.ClubsPage })));
const ClubDetailsPage = lazy(() => import('@/features/clubs/pages/ClubDetailsPage').then(m => ({ default: m.ClubDetailsPage })));
const CreateClubPage = lazy(() => import('@/features/clubs/pages/CreateClubPage').then(m => ({ default: m.CreateClubPage })));
const CreateSubscriptionClubPage = lazy(() => import('@/features/clubs/pages/CreateClubPage').then(m => ({ default: m.CreateSubscriptionClubPage })));
const CreateTariffClubPage = lazy(() => import('@/features/clubs/pages/CreateClubPage').then(m => ({ default: m.CreateTariffClubPage })));
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

function PageLoader() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#77736B', fontSize: 14 }}>
            Загрузка...
        </div>
    );
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="onboarding" element={<OnboardingPage />} />
                    <Route path="clubs" element={<ClubsPage />} />
                    <Route path="clubs/create" element={<CreateClubPage />} />
                    <Route path="clubs/create/subscription" element={<CreateSubscriptionClubPage />} />
                    <Route path="clubs/create/tariff" element={<CreateTariffClubPage />} />
                    <Route path="clubs/:id" element={<ClubDetailsPage />} />
                    <Route path="clubs/:id/requests" element={<ClubRequestsPage />} />
                    <Route path="gb-market" element={<GBMarketPage />} />
                    <Route path="gb-market/create" element={<CreateListingPage />} />
                    <Route path="accounts" element={<AccountsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="report" element={<ReportUserPage />} />
                    <Route path="demo" element={<DemoPage />} />
                    <Route path="tools/receipt-analyzer" element={<ReceiptAnalyzerPage />} />
                    <Route path="my-clubs" element={<ClubsPage />} />
                    <Route path="admin/complaints" element={<ComplaintsPage />} />
                    <Route path="admin" element={<AdminPanelPage />} />
                    <Route path="deals" element={<DealsListPage />} />
                    <Route path="deals/:dealId" element={<DealPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

function App() {
    useEffect(() => {
        const timer = window.setTimeout(() => {
            routePreloads.clubs();
            routePreloads.gb();
            routePreloads.profile();
            routePreloads.accounts();
            routePreloads.deals();
            warmupCoreData(queryClient);
        }, 350);

        return () => window.clearTimeout(timer);
    }, []);

    return (
        <ErrorBoundary>
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                <TelegramProvider>
                    <QueryClientProvider client={queryClient}>
                        <BrowserRouter>
                            <AppRoutes />
                        </BrowserRouter>
                    </QueryClientProvider>
                </TelegramProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
