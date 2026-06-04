import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ClubMember } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { MSIcon } from '@/shared/ui/MSIcon';
import {
    Box, Card, CardContent, Button, Skeleton, Avatar, Chip,
    Divider, Stack, Typography, IconButton, alpha, Snackbar, Alert,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';

// ── Trust badge ───────────────────────────────────────────────────────────────
function TrustBadge({ score }: { score: number }) {
    const color = score >= 4.5 ? 'success' : score >= 3.5 ? 'warning' : 'error';
    return (
        <Chip
            icon={<StarRoundedIcon sx={{ fontSize: '12px !important' }} />}
            label={Number(score).toFixed(1)}
            color={color}
            size="small"
            sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
        />
    );
}

// ── Time since ────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    return `${Math.floor(diff / 86400)} дн назад`;
}

const slotTypeLabels: Record<string, string> = {
    smartphone: 'Смартфон',
    router: 'Роутер / модем',
    m2m: 'Умное устройство',
};

// ── Applicant card ────────────────────────────────────────────────────────────
function ApplicantCard({
    member, onApprove, onReject, onMessage, isApproving, isRejecting,
}: {
    member: ClubMember;
    onApprove: () => void;
    onReject: () => void;
    onMessage: () => void;
    isApproving: boolean;
    isRejecting: boolean;
}) {
    const { user } = member;
    const deals = user.p2p_deals_count ?? 0;
    const success = user.p2p_success_count ?? 0;
    const successRate = deals > 0 ? Math.round((success / deals) * 100) : null;

    return (
        <Card sx={{ overflow: 'hidden' }}>
            <CardContent sx={{ p: 2 }}>
                {/* User row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                        sx={{ width: 40, height: 40, fontWeight: 800, bgcolor: alpha('#2196F3', 0.15), color: 'primary.main', flexShrink: 0 }}
                    >
                        {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} fontSize={14} noWrap>
                            {user.first_name || user.username || `User #${user.user_id}`}
                        </Typography>
                        {user.username && (
                            <Typography variant="caption" color="text.secondary" noWrap>@{user.username}</Typography>
                        )}
                        <Typography variant="caption" color="text.disabled" display="block">{timeAgo(member.joined_at)}</Typography>
                    </Box>
                    <TrustBadge score={Number(user.trust_score)} />
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                    <Chip size="small" label={`Сделок: ${deals}`} sx={{ fontSize: 11 }} />
                    {successRate !== null && (
                        <Chip size="small" color="success" label={`${successRate}% успешных`} sx={{ fontSize: 11 }} />
                    )}
                    {member.phone_number && (
                        <Chip
                            size="small"
                            color="primary"
                            icon={<MSIcon name="phone" size={12} />}
                            label={member.phone_number}
                            sx={{ fontSize: 11 }}
                        />
                    )}
                    {member.slot_type && (
                        <Chip
                            size="small"
                            label={slotTypeLabels[member.slot_type] || member.slot_type}
                            sx={{ fontSize: 11, bgcolor: '#FFF4CC', fontWeight: 700 }}
                        />
                    )}
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<ChatRoundedIcon fontSize="small" />}
                    disabled={!user.username}
                    onClick={onMessage}
                    sx={{ height: 40, borderRadius: 2, fontWeight: 700, mb: 1 }}
                >
                    {user.username ? 'Написать в Telegram' : 'У пользователя нет username'}
                </Button>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        size="small"
                        startIcon={!isApproving && <CheckCircleRoundedIcon fontSize="small" />}
                        disabled={isRejecting || isApproving}
                        onClick={onApprove}
                        sx={{ height: 40, borderRadius: 2, fontWeight: 700 }}
                    >
                        {isApproving ? 'Принимаем...' : 'Принять'}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        size="small"
                        startIcon={!isRejecting && <CancelRoundedIcon fontSize="small" />}
                        disabled={isApproving || isRejecting}
                        onClick={onReject}
                        sx={{ height: 40, borderRadius: 2, fontWeight: 700 }}
                    >
                        {isRejecting ? 'Отклоняем...' : 'Отклонить'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function PaymentCard({
    member, onConfirm, isConfirming,
}: {
    member: ClubMember;
    onConfirm: () => void;
    isConfirming: boolean;
}) {
    const { user } = member;

    return (
        <Card sx={{ overflow: 'hidden', border: '1px solid rgba(76, 175, 80, 0.22)' }}>
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40, fontWeight: 800, bgcolor: alpha('#4CAF50', 0.15), color: 'success.main', flexShrink: 0 }}>
                        {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} fontSize={14} noWrap>
                            {user.first_name || user.username || `User #${user.user_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            Нажал “Оплатил” {member.last_payment_at ? timeAgo(member.last_payment_at) : ''}
                        </Typography>
                    </Box>
                    <Chip color="success" size="small" label="Оплатил" sx={{ fontWeight: 700 }} />
                </Box>

                <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={!isConfirming && <CheckCircleRoundedIcon fontSize="small" />}
                    disabled={isConfirming}
                    onClick={onConfirm}
                    sx={{ height: 42, borderRadius: 2, fontWeight: 800 }}
                >
                    {isConfirming ? 'Подтверждаем...' : 'Подтвердить оплату'}
                </Button>
            </CardContent>
        </Card>
    );
}

function IssueAccessCard({
    member, onIssue, onMessage, isIssuing,
}: {
    member: ClubMember;
    onIssue: () => void;
    onMessage: () => void;
    isIssuing: boolean;
}) {
    const { user } = member;

    return (
        <Card sx={{ overflow: 'hidden', border: '1px solid rgba(33, 150, 243, 0.18)' }}>
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40, fontWeight: 800, bgcolor: alpha('#2196F3', 0.14), color: 'primary.main', flexShrink: 0 }}>
                        {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} fontSize={14} noWrap>
                            {user.first_name || user.username || `User #${user.user_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            Заявка принята. Напишите пользователю и выдайте доступ.
                        </Typography>
                    </Box>
                    <Chip color="primary" size="small" label="Принят" sx={{ fontWeight: 700 }} />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ChatRoundedIcon fontSize="small" />}
                        disabled={!user.username}
                        onClick={onMessage}
                        sx={{ height: 42, borderRadius: 2, fontWeight: 800 }}
                    >
                        Написать
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={!isIssuing && <CheckCircleRoundedIcon fontSize="small" />}
                        disabled={isIssuing}
                        onClick={onIssue}
                        sx={{ height: 42, borderRadius: 2, fontWeight: 800 }}
                    >
                        {isIssuing ? 'Выдаем...' : 'Доступ выдан'}
                    </Button>
                </Box>
                {!user.username && (
                    <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1 }}>
                        У пользователя нет username, написать напрямую нельзя.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

export function ClubRequestsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const queryClient = useQueryClient();
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const { data: requests, isLoading, error } = useQuery({
        queryKey: ['club-requests', id],
        queryFn: () => api.getPendingMembers(id!),
        enabled: !!id,
        refetchInterval: 15000,
    });

    const { data: members, isLoading: membersLoading } = useQuery({
        queryKey: ['club-members', id],
        queryFn: () => api.getClubMembers(id!),
        enabled: !!id,
        refetchInterval: 15000,
    });

    const issueRequests = (members || []).filter(member => ['invited', 'access_issued', 'approved'].includes(member.status));
    const paymentRequests = (members || []).filter(member => member.status === 'paid');

    const approveMutation = useMutation({
        mutationFn: (memberId: string) => api.approveMember(id!, memberId),
        onSuccess: () => {
            haptic.notification('success');
            setToast({ open: true, message: 'Участник принят в клуб', severity: 'success' });
            queryClient.invalidateQueries({ queryKey: ['club-requests', id] });
            queryClient.invalidateQueries({ queryKey: ['club-members', id] });
            queryClient.invalidateQueries({ queryKey: ['club', id] });
        },
        onError: () => {
            haptic.notification('error');
            setToast({ open: true, message: 'Не удалось принять участника', severity: 'error' });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (memberId: string) => api.rejectMember(id!, memberId),
        onSuccess: () => {
            haptic.notification('success');
            setToast({ open: true, message: 'Заявка отклонена', severity: 'success' });
            queryClient.invalidateQueries({ queryKey: ['club-requests', id] });
        },
        onError: () => {
            haptic.notification('error');
            setToast({ open: true, message: 'Не удалось отклонить заявку', severity: 'error' });
        },
    });

    const confirmPaymentMutation = useMutation({
        mutationFn: (memberId: string) => api.confirmMemberPayment(id!, memberId),
        onSuccess: () => {
            haptic.notification('success');
            setToast({ open: true, message: 'Оплата подтверждена', severity: 'success' });
            queryClient.invalidateQueries({ queryKey: ['club-members', id] });
            queryClient.invalidateQueries({ queryKey: ['club', id] });
        },
        onError: () => {
            haptic.notification('error');
            setToast({ open: true, message: 'Не удалось подтвердить оплату', severity: 'error' });
        },
    });

    const issueAccessMutation = useMutation({
        mutationFn: (memberId: string) => api.issueClubAccess(id!, memberId),
        onSuccess: () => {
            haptic.notification('success');
            setToast({ open: true, message: 'Доступ выдан. Таймер оплаты запущен', severity: 'success' });
            queryClient.invalidateQueries({ queryKey: ['club-members', id] });
            queryClient.invalidateQueries({ queryKey: ['club', id] });
        },
        onError: () => {
            haptic.notification('error');
            setToast({ open: true, message: 'Не удалось выдать доступ', severity: 'error' });
        },
    });

    const openApplicantChat = (username: string | null) => {
        if (!username) return;
        const cleanUsername = username.replace(/^@/, '');
        const url = `https://t.me/${cleanUsername}`;
        const tg = (window as any).Telegram?.WebApp;

        haptic.impact('light');
        if (tg?.openTelegramLink) tg.openTelegramLink(url);
        else if (tg?.openLink) tg.openLink(url);
        else window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 50,
                bgcolor: alpha('#080808', 0.92), backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', gap: 1.5, px: 1, py: 1,
            }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackRoundedIcon />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={800} fontSize={16}>Заявки на вступление</Typography>
                    <Typography variant="caption" color="text.secondary">Просматривайте и принимайте решения</Typography>
                </Box>
                {(requests?.length || issueRequests.length || paymentRequests.length) > 0 && (
                    <Chip color="error" size="small" label={(requests?.length || 0) + issueRequests.length + paymentRequests.length} sx={{ fontWeight: 700 }} />
                )}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, p: 2, maxWidth: 600, mx: 'auto', width: '100%', pb: 10 }}>
                {/* Loading */}
                {isLoading && (
                    <Stack spacing={1.5}>
                        {[1, 2, 3].map(i => (
                            <Card key={i}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton variant="text" width={140} height={20} />
                                            <Skeleton variant="text" width={80} height={16} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Skeleton variant="rounded" height={40} sx={{ flex: 1, borderRadius: 2 }} />
                                        <Skeleton variant="rounded" height={40} sx={{ flex: 1, borderRadius: 2 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                {/* Error */}
                {error && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2, textAlign: 'center' }}>
                        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: alpha('#F44336', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MSIcon name="error" size={28} filled />
                        </Box>
                        <Typography color="text.secondary" fontSize={14}>
                            {error instanceof Error ? error.message : 'Ошибка загрузки'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">Возможно, вы не являетесь организатором этого клуба</Typography>
                    </Box>
                )}

                {/* Empty */}
                {!isLoading && !membersLoading && !error && requests?.length === 0 && issueRequests.length === 0 && paymentRequests.length === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 2, textAlign: 'center' }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: alpha('#4CAF50', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                            <MSIcon name="check_circle" size={32} filled />
                        </Box>
                        <Typography fontWeight={700} fontSize={18}>Нет новых заявок</Typography>
                        <Typography variant="body2" color="text.secondary" maxWidth={280}>
                            Когда кто-то захочет вступить в ваш клуб, заявки появятся здесь
                        </Typography>
                    </Box>
                )}

                {paymentRequests.length > 0 && (
                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 0.5 }}>
                            <MSIcon name="payments" size={14} className="text-default-400" />
                            <Typography variant="caption" color="text.disabled" lineHeight={1.5}>
                                Эти участники отметили оплату. Проверьте Kaspi и подтвердите получение.
                            </Typography>
                        </Box>
                        {paymentRequests.map(member => (
                            <PaymentCard
                                key={member.member_id}
                                member={member}
                                onConfirm={() => { haptic.impact('medium'); confirmPaymentMutation.mutate(member.member_id); }}
                                isConfirming={confirmPaymentMutation.isPending && confirmPaymentMutation.variables === member.member_id}
                            />
                        ))}
                    </Stack>
                )}

                {issueRequests.length > 0 && (
                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 0.5 }}>
                            <MSIcon name="key" size={14} className="text-default-400" />
                            <Typography variant="caption" color="text.disabled" lineHeight={1.5}>
                                Сначала напишите пользователю в Telegram и договоритесь по доступу. Потом нажмите “Доступ выдан” — с этого момента пойдет 30 минут на оплату.
                            </Typography>
                        </Box>
                        {issueRequests.map(member => (
                            <IssueAccessCard
                                key={member.member_id}
                                member={member}
                                onMessage={() => openApplicantChat(member.user.username)}
                                onIssue={() => { haptic.impact('medium'); issueAccessMutation.mutate(member.member_id); }}
                                isIssuing={issueAccessMutation.isPending && issueAccessMutation.variables === member.member_id}
                            />
                        ))}
                    </Stack>
                )}

                {/* List */}
                {requests && requests.length > 0 && (
                    <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 0.5 }}>
                            <MSIcon name="info" size={14} className="text-default-400" />
                            <Typography variant="caption" color="text.disabled" lineHeight={1.5}>
                                Заявки отсортированы по времени подачи. Оцените рейтинг и активность пользователя.
                            </Typography>
                        </Box>
                        {requests.map((member) => (
                            <ApplicantCard
                                key={member.member_id}
                                member={member}
                                onMessage={() => openApplicantChat(member.user.username)}
                                onApprove={() => { haptic.impact('medium'); approveMutation.mutate(member.member_id); }}
                                onReject={() => { haptic.impact('light'); rejectMutation.mutate(member.member_id); }}
                                isApproving={approveMutation.isPending && approveMutation.variables === member.member_id}
                                isRejecting={rejectMutation.isPending && rejectMutation.variables === member.member_id}
                            />
                        ))}
                    </Stack>
                )}
            </Box>
            <Snackbar
                open={toast.open}
                autoHideDuration={2600}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ bottom: 'calc(92px + env(safe-area-inset-bottom)) !important' }}
            >
                <Alert
                    severity={toast.severity}
                    variant="filled"
                    onClose={() => setToast(prev => ({ ...prev, open: false }))}
                    sx={{ borderRadius: 999, fontWeight: 800, boxShadow: '0 18px 45px rgba(0,0,0,0.22)' }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
