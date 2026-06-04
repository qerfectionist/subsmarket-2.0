/**
 * ReportUserPage — MUI version
 */
import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateComplaint, ComplaintCreate } from '@/shared/api/trust';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { ComplaintForm, ComplaintFormData } from '@/shared/ui/ComplaintForm';
import {
    Box, Typography, Button, alpha, IconButton,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

export function ReportUserPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const haptic = useHaptic();

    const currentUserId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 0;
    const targetId = parseInt(searchParams.get('target_id') || '0', 10);
    const targetUsername = searchParams.get('username') || undefined;
    const dealId = searchParams.get('deal_id') || undefined;

    const createComplaint = useCreateComplaint();

    const goBack = useCallback(() => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/profile');
    }, [navigate]);

    const handleSubmit = useCallback(async (formData: ComplaintFormData) => {
        haptic.impact('medium');
        const complaintData: ComplaintCreate = {
            target_id: formData.targetId,
            deal_id: formData.dealId,
            reason: formData.reason,
            description: formData.description,
            evidence_urls: formData.evidenceUrls,
        };
        await createComplaint.mutateAsync({ data: complaintData, reporterId: currentUserId });
        haptic.notification('success');
        goBack();
    }, [createComplaint, currentUserId, goBack, haptic]);

    const handleCancel = useCallback(() => {
        haptic.impact('light');
        goBack();
    }, [goBack, haptic]);

    // Guard
    if (!targetId) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                <Typography fontSize={48} mb={2}>⚠️</Typography>
                <Typography variant="h6" fontWeight={800} mb={1}>Ошибка</Typography>
                <Typography color="text.secondary" mb={3}>Не указан пользователь для жалобы</Typography>
                <Button variant="outlined" onClick={goBack} sx={{ borderRadius: 3 }}>Назад</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', pb: 10 }}>
            {/* Header */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 50,
                bgcolor: 'rgba(245,244,239,0.94)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(17,17,17,0.06)',
                display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 1,
            }}>
                <IconButton onClick={handleCancel} aria-label="Назад" sx={{ bgcolor: '#fff', color: '#111' }}><ArrowBackRoundedIcon /></IconButton>
                <Box>
                    <Typography fontWeight={800} fontSize={16}>Жалоба на пользователя</Typography>
                    <Typography variant="caption" color="#77736B">Опишите проблему и приложите доказательства</Typography>
                </Box>
            </Box>

            {/* Form */}
            <Box sx={{ p: 2 }}>
                <ComplaintForm
                    targetId={targetId}
                    targetUsername={targetUsername}
                    dealId={dealId}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={createComplaint.isPending}
                />

                {createComplaint.isError && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#F44336', 0.1), border: '1px solid rgba(244,67,54,0.2)', borderRadius: 3 }}>
                        <Typography color="error" variant="body2">
                            {createComplaint.error instanceof Error
                                ? createComplaint.error.message
                                : 'Ошибка отправки жалобы'}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default ReportUserPage;
