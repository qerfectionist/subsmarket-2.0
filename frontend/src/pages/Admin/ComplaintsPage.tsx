import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTelegram } from "@/app/providers/TelegramProvider";
import { trustApi, Complaint } from "@/shared/api/trust";
import { BackButton } from "@twa-dev/sdk/react";
import {
    Box, Typography, Card, CardContent, Button, Chip,
    Stack, CircularProgress,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';

const ComplaintCard = ({
    complaint, onResolve,
}: {
    complaint: Complaint;
    onResolve: (id: string, action: 'confirm' | 'reject') => void;
}) => (
    <Card>
        <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Chip
                    label={complaint.reason}
                    color="error"
                    size="small"
                    sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}
                />
                <Typography variant="caption" color="text.disabled">
                    {new Date(complaint.created_at).toLocaleDateString()}
                </Typography>
            </Box>

            <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, p: 1.5, mb: 1.5 }}>
                <Typography variant="body2">Reporter: <b>{complaint.reporter_id}</b></Typography>
                <Typography variant="body2">Target: <b>{complaint.target_id}</b></Typography>
                {complaint.description && (
                    <Typography variant="caption" color="text.secondary" fontStyle="italic" display="block" mt={0.5}>
                        "{complaint.description}"
                    </Typography>
                )}
                {complaint.evidence_urls && complaint.evidence_urls.length > 0 && (
                    <Box mt={1}>
                        <a href={complaint.evidence_urls[0]} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                            <Chip
                                icon={<ImageRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                label={`Скриншот (${complaint.evidence_urls.length})`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                clickable
                                sx={{ fontSize: 11 }}
                            />
                        </a>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    size="small"
                    startIcon={<BlockRoundedIcon fontSize="small" />}
                    onClick={() => onResolve(complaint.complaint_id, 'reject')}
                    sx={{ fontWeight: 700, borderRadius: 2, height: 40 }}
                >
                    Заблокировать
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    size="small"
                    startIcon={<CheckRoundedIcon fontSize="small" />}
                    onClick={() => onResolve(complaint.complaint_id, 'confirm')}
                    sx={{ fontWeight: 700, borderRadius: 2, height: 40 }}
                >
                    Подтвердить
                </Button>
            </Box>
        </CardContent>
    </Card>
);

export const ComplaintsPage = () => {
    const navigate = useNavigate();
    useTelegram();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadComplaints(); }, []);

    const loadComplaints = async () => {
        try {
            const data = await trustApi.listComplaints('pending');
            setComplaints(data.complaints);
        } catch (e) {
            console.error(e);
            alert('Ошибка загрузки жалоб');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string, action: 'confirm' | 'reject') => {
        const msg = action === 'confirm' ? 'Подтвердить нарушение? Это снизит рейтинг.' : 'Отклонить жалобу?';
        if (!window.confirm(msg)) return;
        try {
            await trustApi.resolveComplaint(id, action);
            setComplaints(prev => prev.filter(c => c.complaint_id !== id));
        } catch (e) { console.error(e); alert('Ошибка при обработке'); }
    };

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', p: 2, pb: 10 }}>
            <BackButton onClick={() => navigate(-1)} />

            <Typography variant="h5" fontWeight={800} mb={3}>Жалобы</Typography>

            {loading && (
                <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>
            )}

            {!loading && complaints.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography fontSize={40} mb={1}>🎉</Typography>
                    <Typography color="text.secondary">Нет активных жалоб</Typography>
                </Box>
            )}

            <Stack spacing={1.5}>
                {complaints.map(c => (
                    <ComplaintCard key={c.complaint_id} complaint={c} onResolve={handleResolve} />
                ))}
            </Stack>
        </Box>
    );
};
