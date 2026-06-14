import type { QueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api';

export const routePreloads = {
    home: () => import('@/features/home/pages/HomePage'),
    my: () => import('@/features/home/pages/MyHubPage'),
    subscriptions: () => import('@/features/clubs/pages/CategoryClubsPage'),
    tariffs: () => import('@/features/clubs/pages/CategoryClubsPage'),
    gigabytes: () => import('@/features/market/pages/GBMarketPage'),
    requests: () => import('@/features/requests/pages/RequestsHubPage'),
    market: () => import('@/features/clubs/pages/ClubsPage'),
    clubs: () => import('@/features/clubs/pages/ClubsPage'),
    gb: () => import('@/features/market/pages/GBMarketPage'),
    profile: () => import('@/features/profile/pages/ProfilePage'),
    accounts: () => import('@/features/market/pages/AccountsPage'),
    deals: () => import('@/features/deals/pages/DealsListPage'),
};

export function preloadTab(value: string) {
    const preload = routePreloads[value as keyof typeof routePreloads];
    preload?.();
}

export function warmupCoreData(queryClient: QueryClient) {
    queryClient.prefetchQuery({
        queryKey: ['clubs', 'all', ''],
        queryFn: () => api.getClubs(),
        staleTime: 2 * 60 * 1000,
    });

    queryClient.prefetchQuery({
        queryKey: ['gb-offers', null],
        queryFn: () => api.getGigabyteOffers(),
        staleTime: 2 * 60 * 1000,
    });

    queryClient.prefetchQuery({
        queryKey: ['account-offers'],
        queryFn: () => api.getAccountOffers(),
        staleTime: 2 * 60 * 1000,
    });
}
