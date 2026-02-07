import { client } from './client';

export interface TrustScore {
    user_id: number;
    trust_score: number;
    deals_count: number;
    success_rate: number;
    badges: Array<{
        id: string;
        name: string;
        icon: string;
    }>;
    status: string;
    member_since: string;
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
    status: 'pending' | 'confirmed' | 'rejected';
    created_at: string;
}

export const trustApi = {
    getScore: (userId: number) =>
        client.get<TrustScore>(`/trust/score/${userId}`).then(r => r.data),

    createComplaint: (data: ComplaintCreate, reporterId: number) =>
        client.post(`/trust/complaints?reporter_id=${reporterId}`, data).then(r => r.data),

    listComplaints: (status?: string) =>
        client.get<{ complaints: Complaint[] }>(`/trust/complaints`, { params: { status } }).then(r => r.data),

    resolveComplaint: (complaintId: string, action: 'confirm' | 'reject', notes?: string) =>
        client.post(`/trust/complaints/${complaintId}/resolve`, {
            action,
            resolution_notes: notes
        }).then(r => r.data),
};
