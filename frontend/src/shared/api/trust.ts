/**
 * Trust System API
 * 
 * API client and TanStack Query hooks for Trust System
 * Following PROJECT_MASTER architecture guidelines
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client, apiFetch } from './client';

// === Types ===

export interface TrustScore {
    user_id: number;
    trust_score: number;
    deals_count: number;
    success_rate: number;
    scam_reports?: number;
    badges: Array<{
        id: string;
        name: string;
        icon: string;
    }>;
    status: string;
    member_since: string | null;
}

export interface TrustEvent {
    event_id: string;
    event_type: string;
    score_change: number;
    score_before: number;
    score_after: number;
    notes: string | null;
    created_at: string | null;
}

export interface TrustHistory {
    user_id: number;
    events: TrustEvent[];
    count: number;
}

export interface ComplaintCreate {
    target_id: number;
    deal_id?: string;
    reason: string;
    description?: string;
    evidence_urls?: string[];
}

export interface Complaint {
    complaint_id: string;
    reporter_id: number;
    target_id: number;
    reason: string;
    description?: string;
    evidence_urls?: string[];
    status: 'pending' | 'confirmed' | 'rejected';
    created_at: string;
}

export interface ComplaintsList {
    complaints: Complaint[];
    count: number;
}

// === Query Keys ===

export const trustKeys = {
    all: ['trust'] as const,
    score: (userId: number) => [...trustKeys.all, 'score', userId] as const,
    history: (userId: number) => [...trustKeys.all, 'history', userId] as const,
    complaints: (filters?: { userId?: number; status?: string }) =>
        [...trustKeys.all, 'complaints', filters] as const,
};

// === TanStack Query Hooks ===

/**
 * Get user's trust score and badges
 */
export function useTrustScore(userId: number) {
    return useQuery({
        queryKey: trustKeys.score(userId),
        queryFn: () => trustApi.getScore(userId),
        enabled: userId > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes (PROJECT_MASTER: cache user profiles)
    });
}

/**
 * Get user's trust score history
 */
export function useTrustHistory(userId: number, limit = 20) {
    return useQuery({
        queryKey: trustKeys.history(userId),
        queryFn: () => apiFetch<TrustHistory>(`/trust/score/${userId}/history?limit=${limit}`),
        enabled: userId > 0,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Get complaints list
 */
export function useComplaints(filters?: { userId?: number; status?: string }) {
    return useQuery({
        queryKey: trustKeys.complaints(filters),
        queryFn: () => trustApi.listComplaints(filters?.status),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Create a new complaint
 */
export function useCreateComplaint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data, reporterId }: { data: ComplaintCreate; reporterId: number }) =>
            trustApi.createComplaint(data, reporterId),
        onSuccess: () => {
            // Invalidate complaints list
            queryClient.invalidateQueries({ queryKey: trustKeys.complaints() });
        },
    });
}

/**
 * Resolve complaint (admin only)
 */
export function useResolveComplaint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            complaintId,
            action,
            notes
        }: {
            complaintId: string;
            action: 'confirm' | 'reject';
            notes?: string;
        }) => trustApi.resolveComplaint(complaintId, action, notes),
        onSuccess: () => {
            // Invalidate complaints list
            queryClient.invalidateQueries({ queryKey: trustKeys.complaints() });
        },
    });
}

// === API Object ===

export const trustApi = {
    getScore: (userId: number) =>
        client.get<TrustScore>(`/trust/score/${userId}`).then(r => r.data),

    getHistory: async (userId: number) => {
        const { data } = await client.get<TrustHistory>(`/trust/score/${userId}/history`);
        return data;
    },

    verifyProof: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await client.post<any>('/trust/verify-proof', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    },

    createComplaint: (data: ComplaintCreate, reporterId: number) =>
        client.post(`/trust/complaints?reporter_id=${reporterId}`, data).then(r => r.data),

    listComplaints: (status?: string) =>
        client.get<ComplaintsList>(`/trust/complaints`, { params: { status } }).then(r => r.data),

    resolveComplaint: (complaintId: string, action: 'confirm' | 'reject', notes?: string) =>
        client.post(`/trust/complaints/${complaintId}/resolve`, {
            action,
            resolution_notes: notes
        }).then(r => r.data),
};
