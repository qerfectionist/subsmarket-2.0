import { client } from './client';

export type ServiceCategory = 'entertainment' | 'music' | 'software' | 'educational' | 'gaming' | 'telecom';

export interface PricingService {
    id: string;
    name: string;
    description: string;
    category: ServiceCategory;
    billing_cycle: 'monthly' | 'yearly';
    logo: string | null;
    price_range: {
        min: number;
        max: number;
        recommended: number;
    };
    family_size: number;
    popularity: number;
    is_active: boolean;
}

export interface TelecomOperator {
    operator_id: string;
    name: string;
    logo_url: string | null;
}

export interface PriceValidation {
    is_valid: boolean;
    reason?: string;
    suggested_price?: number;
}

export const pricingApi = {
    /**
     * Get all available pricing services (Netflix, Spotify, etc.)
     */
    getServices: async () => {
        const response = await client.get<{ services: PricingService[] }>('/pricing/services');
        return response.data;
    },

    /**
     * Get all telecom operators for GB Market
     */
    getOperators: async () => {
        const response = await client.get<{ operators: TelecomOperator[] }>('/pricing/operators');
        return response.data;
    },

    /**
     * Validate a price for a specific service
     */
    validateServicePrice: async (serviceId: string, price: number) => {
        const response = await client.get<PriceValidation>(`/pricing/services/${serviceId}/validate`, {
            params: { price }
        });
        return response.data;
    },

    /**
     * Validate a price for a telecom operator (GB Market)
     */
    validateTelecomPrice: async (operatorId: string, price: number) => {
        const response = await client.get<PriceValidation>(`/pricing/telecom/${operatorId}/validate`, {
            params: { price_per_gb: price }
        });
        return response.data;
    }
};
