/**
 * API client for SubsMarket backend.
 * Uses Telegram initData for authentication.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get Telegram initData for authentication
 */
function getInitData(): string {
    const initData = window.Telegram?.WebApp?.initData;

    // Mock auth for local development
    if (!initData && import.meta.env.DEV) {
        return 'mock:12345:dev_user';
    }

    return initData || '';
}

/**
 * Typed fetch wrapper with error handling
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': getInitData(),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============================================
// Types
// ============================================

export interface User {
    user_id: number;
    username: string | null;
    first_name: string | null;
    trust_score: number;
    p2p_deals_count: number;
    p2p_success_count: number;
}

export interface Subscription {
    subscription_id: string;
    service_name: string;
    service_name_kk: string | null;
    category: 'digital' | 'telecom';
    icon_url: string | null;
    max_members: number;
    official_price: number | null;
}

export interface Club {
    club_id: string;
    host_id: number;
    subscription: Subscription;
    category: 'digital' | 'telecom';
    price_total: number;
    price_per_member: number;
    max_members: number;
    current_members: number;
    status: 'open' | 'full' | 'frozen' | 'closed';
    description: string | null;
    created_at: string;
}

export interface ClubDetails extends Club {
    host: User;
    login?: string;
    password?: string;
    payment_method: string;
    payment_details: string | null;
    payment_day: number | null;
    rules: string | null;
    telegram_group_link: string | null;
}

export interface CreateClubRequest {
    subscription_id: string;
    price_total: number;
    max_members: number;
    login?: string;
    password?: string;
    payment_method: string;
    payment_details: string;
    payment_day?: number;
    description?: string;
    rules?: string;
}

export interface GigabyteOffer {
    offer_id: string;
    seller_id: number;
    operator: string;
    amount_gb: number;
    price: number;
    description: string | null;
    created_at: string;
    is_active: boolean;
    // seller info might be expanded or separate
}

export interface CreateGigabyteOfferRequest {
    operator: string;
    amount_gb: number;
    price: number;
    description?: string;
}

// ============================================
// API Methods
// ============================================

export const api = {
    // User
    async getMe(): Promise<User> {
        return apiFetch<User>('/users/me');
    },

    // Subscriptions
    async getSubscriptions(): Promise<Subscription[]> {
        return apiFetch<Subscription[]>('/subscriptions');
    },

    // Clubs
    async getClubs(params?: {
        category?: 'digital' | 'telecom';
        status?: 'open' | 'full';
    }): Promise<Club[]> {
        const searchParams = new URLSearchParams();
        if (params?.category) searchParams.set('category', params.category);
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return apiFetch<Club[]>(`/clubs${query ? `?${query}` : ''}`);
    },

    async getClub(clubId: string): Promise<ClubDetails> {
        return apiFetch<ClubDetails>(`/clubs/${clubId}`);
    },

    async createClub(data: CreateClubRequest): Promise<Club> {
        return apiFetch<Club>('/clubs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async joinClub(clubId: string): Promise<void> {
        return apiFetch<void>(`/clubs/${clubId}/join`, {
            method: 'POST',
        });
    },

    async leaveClub(clubId: string): Promise<void> {
        return apiFetch<void>(`/clubs/${clubId}/leave`, {
            method: 'POST',
        });
    },

    // My clubs
    async getMyClubs(): Promise<Club[]> {
        return apiFetch<Club[]>('/users/me/clubs');
    },

    // ============================================
    // GB Market
    // ============================================

    async getGigabyteOffers(params?: { operator?: string }): Promise<GigabyteOffer[]> {
        const searchParams = new URLSearchParams();
        if (params?.operator) searchParams.set('operator', params.operator);

        const query = searchParams.toString();
        return apiFetch<GigabyteOffer[]>(`/gigabytes${query ? `?${query}` : ''}`);
    },

    async createGigabyteOffer(data: CreateGigabyteOfferRequest): Promise<GigabyteOffer> {
        return apiFetch<GigabyteOffer>('/gigabytes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async buyGigabyteOffer(offerId: string): Promise<void> {
        return apiFetch<void>(`/gigabytes/${offerId}/buy`, {
            method: 'POST',
        });
    },
};

export default api;
