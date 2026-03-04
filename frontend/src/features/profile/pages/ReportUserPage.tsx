/**
 * ReportUserPage Component
 * 
 * Page for reporting/complaining about a user
 * According to PROJECT_MASTER Trust System rules
 */
import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateComplaint, ComplaintCreate } from '@/shared/api/trust';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { ComplaintForm, ComplaintFormData } from '@/shared/ui/ComplaintForm';

export function ReportUserPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const haptic = useHaptic();

    // Get current user ID from Telegram
    const currentUserId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 0;

    // Get target user info from URL params
    const targetId = parseInt(searchParams.get('target_id') || '0', 10);
    const targetUsername = searchParams.get('username') || undefined;
    const dealId = searchParams.get('deal_id') || undefined;

    const createComplaint = useCreateComplaint();

    const handleSubmit = useCallback(async (formData: ComplaintFormData) => {
        haptic.impact('medium');

        const complaintData: ComplaintCreate = {
            target_id: formData.targetId,
            deal_id: formData.dealId,
            reason: formData.reason,
            description: formData.description,
            evidence_urls: formData.evidenceUrls,
        };

        await createComplaint.mutateAsync({
            data: complaintData,
            reporterId: currentUserId,
        });

        haptic.notification('success');

        // Navigate back to previous page
        navigate(-1);
    }, [createComplaint, currentUserId, haptic, navigate]);

    const handleCancel = useCallback(() => {
        haptic.impact('light');
        navigate(-1);
    }, [haptic, navigate]);

    // Guard: No target specified
    if (!targetId) {
        return (
            <div className="p-6 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h1 className="text-xl font-bold text-white mb-2">
                    Ошибка
                </h1>
                <p className="text-gray-400 mb-6">
                    Не указан пользователь для жалобы
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                    Назад
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4 pb-28">
            {/* Header */}
            <header className="mb-6">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                >
                    <span className="text-lg">←</span>
                    <span>Назад</span>
                </button>
                <h1 className="text-2xl font-bold text-white">Жалоба на пользователя</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Опишите проблему и приложите доказательства
                </p>
            </header>

            {/* Complaint Form */}
            <ComplaintForm
                targetId={targetId}
                targetUsername={targetUsername}
                dealId={dealId}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createComplaint.isPending}
            />

            {/* Error Display */}
            {createComplaint.isError && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm">
                        {createComplaint.error instanceof Error
                            ? createComplaint.error.message
                            : 'Ошибка отправки жалобы'}
                    </p>
                </div>
            )}
        </div>
    );
}

export default ReportUserPage;
