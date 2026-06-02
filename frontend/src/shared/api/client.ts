/**
 * API client for SubsMarket backend.
 * Uses Telegram initData for authentication.
 */

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');

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
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'X-Telegram-Init-Data': getInitData(),
        ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Global 401 handler: session expired or invalid Telegram auth
        if (response.status === 401) {
            const tgApp = (window as any).Telegram?.WebApp;
            tgApp?.showAlert?.('Сессия истекла. Пожалуйста, перезапустите приложение.');
            throw new Error('AUTH_EXPIRED');
        }

        const rawError = await response.text().catch(() => '');
        let detail = rawError;
        try {
            const parsed = rawError ? JSON.parse(rawError) : null;
            detail = parsed?.detail || parsed?.message || rawError;
        } catch {
            detail = rawError;
        }
        throw new Error(detail || `HTTP ${response.status}`);
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
    my_status: 'pending' | 'active' | 'approved' | 'left' | 'kicked' | null;
}

export interface CreateClubRequest {
    service_id?: string;         // Catalog slug e.g. 'netflix'
    subscription_id?: string;    // Legacy UUID (optional)
    price_total: number;
    max_members: number;
    payment_method: string;
    payment_details: string;
    payment_day?: number;
    description?: string;
    rules?: string;
    approval_mode?: 'manual' | 'auto';
    min_trust_score?: number;
    telegram_group_link?: string;
}

export interface ClubMember {
    member_id: string;
    user: User;
    status: 'pending' | 'active' | 'approved' | 'left' | 'kicked';
    phone_number: string | null;
    joined_at: string;
    last_payment_at: string | null;
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

// Deals
export interface Deal {
    deal_id: string;
    buyer_id: number;
    seller_id: number;
    offer_type: 'gigabyte' | 'club';
    status: string;
    amount: number;
    created_at: string;
    updated_at: string;
    paid_at?: string;
    dispute_reason?: string;
    proof_screenshot_id?: string;
    gb_offer_id?: string;
    club_id?: string;
}

export interface CreateDealRequest {
    offer_type: 'gigabyte' | 'club' | 'account';
    offer_id: string;
    amount: number;
    quantity_gb?: number;
}

export interface AccountOffer {
    offer_id: string;
    seller_id: number;
    title: string;
    service_category: string;
    price: number;
    description: string;
    created_at: string;
    is_active: boolean;
}

export interface CreateAccountOfferRequest {
    title: string;
    service_category: string;
    price: number;
    description: string;
}

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
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ items: Club[]; total: number; limit: number; offset: number }> {
        const searchParams = new URLSearchParams();
        if (params?.category) searchParams.set('category', params.category);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.search) searchParams.set('search', params.search);
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));

        const query = searchParams.toString();
        return apiFetch<{ items: Club[]; total: number; limit: number; offset: number }>(`/clubs${query ? `?${query}` : ''}`);
    },

    async getMyClubs(): Promise<Club[]> {
        return apiFetch<Club[]>('/clubs/my');
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

    async createTelegramGroupRequest(): Promise<{ prepared_id: string; request_id: string }> {
        return apiFetch<{ prepared_id: string; request_id: string }>('/telegram/prepared-group-request', {
            method: 'POST',
            body: JSON.stringify({}),
        });
    },

    async resolveTelegramGroupRequest(requestId: string): Promise<{ status: 'pending' | 'ready'; link: string | null }> {
        return apiFetch<{ status: 'pending' | 'ready'; link: string | null }>(`/telegram/group-request/${requestId}`);
    },

    async joinClub(clubId: string, phoneNumber?: string): Promise<{ status: string; message: string }> {
        return apiFetch<{ status: string; message: string }>(`/clubs/${clubId}/join`, {
            method: 'POST',
            body: JSON.stringify(phoneNumber ? { phone_number: phoneNumber } : {}),
        });
    },

    async leaveClub(clubId: string): Promise<void> {
        return apiFetch<void>(`/clubs/${clubId}/leave`, {
            method: 'POST',
        });
    },

    async cancelJoinRequest(clubId: string): Promise<{ status: string; message: string }> {
        return apiFetch(`/clubs/${clubId}/join`, { method: 'DELETE' });
    },

    async remindHost(clubId: string): Promise<{ status: string; message: string }> {
        return apiFetch(`/clubs/${clubId}/remind`, { method: 'POST' });
    },

    async getPendingMembers(clubId: string): Promise<ClubMember[]> {
        return apiFetch<ClubMember[]>(`/clubs/${clubId}/pending`);
    },

    async approveMember(clubId: string, memberId: string): Promise<{ status: string; message: string }> {
        return apiFetch(`/clubs/${clubId}/members/${memberId}/approve`, { method: 'POST' });
    },

    async rejectMember(clubId: string, memberId: string): Promise<{ status: string; message: string }> {
        return apiFetch(`/clubs/${clubId}/members/${memberId}/reject`, { method: 'POST' });
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

    // Deals (P2P)
    async createDeal(data: CreateDealRequest): Promise<Deal> {
        return apiFetch<Deal>('/deals', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async getDeal(dealId: string): Promise<Deal> {
        return apiFetch<Deal>(`/deals/${dealId}`);
    },

    async payDeal(dealId: string, proof?: File): Promise<Deal> {
        const options: RequestInit = { method: 'POST' };
        if (proof) {
            const formData = new FormData();
            formData.append('proof', proof);
            options.body = formData;
        }
        return apiFetch<Deal>(`/deals/${dealId}/pay`, options);
    },

    async confirmDeal(dealId: string): Promise<Deal> {
        return apiFetch<Deal>(`/deals/${dealId}/confirm`, {
            method: 'POST',
        });
    },

    async getMyDeals(): Promise<Deal[]> {
        return apiFetch<Deal[]>('/deals/my');
    },

    async openDispute(dealId: string, reason: string): Promise<Deal> {
        return apiFetch<Deal>(`/deals/${dealId}/dispute`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    },

    // Accounts (P2P)
    async createAccountOffer(data: CreateAccountOfferRequest): Promise<AccountOffer> {
        return apiFetch<AccountOffer>('/accounts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async getAccountOffers(category?: string): Promise<AccountOffer[]> {
        const query = category ? `?category=${category}` : '';
        return apiFetch<AccountOffer[]>(`/accounts${query}`);
    },
};

export const client = {
    get: <T>(url: string, config?: any) => {
        const query = config?.params ? '?' + new URLSearchParams(config.params).toString() : '';
        return apiFetch<T>(`${url}${query}`).then(data => ({ data }));
    },
    post: <T>(url: string, data?: any, config?: any) => apiFetch<T>(url, {
        method: 'POST',
        body: JSON.stringify(data),
        ...config
    }).then(data => ({ data })),
};

export default api;
