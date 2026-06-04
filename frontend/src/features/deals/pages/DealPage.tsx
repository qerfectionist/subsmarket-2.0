import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { api } from '@/shared/api';
import { t } from '@/shared/i18n';
import {
    Box, Typography, Card, CardContent, Button, Chip,
    Skeleton, Stack, alpha, IconButton,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const STEPS = ['CREATED', 'PAID_BY_BUYER', 'COMPLETED'];

const STATUS_META: Record<string, { label: string; color: 'primary' | 'warning' | 'success' | 'error' | 'default' }> = {
    CREATED: { label: 'Ожидание оплаты', color: 'primary' },
    PAID_BY_BUYER: { label: 'Оплачено', color: 'warning' },
    COMPLETED: { label: 'Завершено', color: 'success' },
    DISPUTED: { label: 'Спор', color: 'error' },
    CANCELLED: { label: 'Отменено', color: 'default' },
};

export default function DealPage() {
    const { dealId } = useParams<{ dealId: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const { showConfirm, webapp } = useTelegram();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: user } = useQuery({ queryKey: ['me'], queryFn: api.getMe });
    const { data: deal, isLoading, error } = useQuery({
        queryKey: ['deal', dealId],
        queryFn: () => api.getDeal(dealId!),
        enabled: !!dealId,
        refetchInterval: 5000,
    });

    const payMutation = useMutation({
        mutationFn: (file?: File) => api.payDeal(dealId!, file),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setSelectedFile(null);
        },
        onError: () => { haptic.notification('error'); webapp?.showAlert(t('common', 'error')); },
    });

    const confirmMutation = useMutation({
        mutationFn: () => api.confirmDeal(dealId!),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
        onError: () => { haptic.notification('error'); webapp?.showAlert(t('common', 'error')); },
    });

    const handlePay = async () => {
        haptic.impact('heavy');
        if (!selectedFile) {
            const confirmed = await showConfirm(t('deal', 'confirm_without_receipt'));
            if (confirmed) payMutation.mutate(undefined);
        } else {
            payMutation.mutate(selectedFile);
        }
    };

    const handleConfirm = async () => {
        haptic.impact('heavy');
        const confirmed = await showConfirm(t('deal', 'confirm_fund_received'));
        if (confirmed) confirmMutation.mutate();
    };

    if (isLoading) {
        return (
            <Box sx={{ p: 2, pb: 16 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, mb: 3 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={130} height={28} />
                </Box>
                <Stack spacing={1.5}>
                    <Card><CardContent sx={{ textAlign: 'center', py: 4 }}><Skeleton variant="rounded" width={100} height={40} sx={{ mx: 'auto', mb: 1 }} /><Skeleton variant="text" width={150} sx={{ mx: 'auto' }} /></CardContent></Card>
                    <Card><CardContent><Skeleton variant="rounded" height={32} sx={{ mb: 1 }} /><Skeleton variant="rounded" height={32} /></CardContent></Card>
                </Stack>
            </Box>
        );
    }

    if (error || !deal) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2, p: 2 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: alpha('#F44336', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 32, color: 'error.main' }} />
                </Box>
                <Typography fontWeight={700} color="error.main" fontSize={14}>{t('common', 'error')}</Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center" maxWidth={240}>Сделка не найдена или произошла ошибка</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 1, borderRadius: 3, textTransform: 'none' }}>
                    ← {t('common', 'back')}
                </Button>
            </Box>
        );
    }

    const isBuyer = user?.user_id === deal.buyer_id;
    const isSeller = user?.user_id === deal.seller_id;
    const config = STATUS_META[deal.status] || STATUS_META.CREATED;
    const currentStep = STEPS.indexOf(deal.status);

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', pb: 16, p: 2 }}>
            <Stack spacing={1.5}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 1 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
                        <ArrowBackRoundedIcon />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={800} fontSize={18} lineHeight={1.2}>{t('deal', 'title')}</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                            #{deal.deal_id.slice(0, 8)}
                        </Typography>
                    </Box>
                    <Chip
                        label={config.label}
                        size="small"
                        color={config.color}
                        sx={{ fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}
                    />
                </Box>

                {/* Progress Timeline */}
                {deal.status !== 'DISPUTED' && deal.status !== 'CANCELLED' && (
                    <Card>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', px: 1 }}>
                                {/* Background line */}
                                <Box sx={{ position: 'absolute', left: 30, right: 30, top: 16, height: 3, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 }} />
                                {/* Active line */}
                                <Box sx={{
                                    position: 'absolute', left: 30, top: 16, height: 3,
                                    bgcolor: 'primary.main', borderRadius: 2,
                                    transition: 'width 0.7s ease',
                                    width: currentStep >= 2 ? 'calc(100% - 60px)' : currentStep >= 1 ? 'calc(50% - 30px)' : '0%',
                                }} />

                                {STEPS.map((step, i) => {
                                    const done = i <= currentStep;
                                    return (
                                        <Box key={step} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1, width: 48 }}>
                                            <Box sx={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '2px solid', transition: 'all 0.3s',
                                                bgcolor: done ? 'primary.main' : '#161616',
                                                borderColor: done ? 'primary.main' : 'rgba(255,255,255,0.12)',
                                            }}>
                                                {done ? (
                                                    <CheckRoundedIcon sx={{ fontSize: 16, color: 'white' }} />
                                                ) : (
                                                    <Typography fontWeight={700} fontSize={13} color="text.disabled">{i + 1}</Typography>
                                                )}
                                            </Box>
                                            <Typography variant="caption" fontWeight={600} color={done ? 'text.primary' : 'text.disabled'} sx={{ whiteSpace: 'nowrap', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                {i === 0 ? 'Создано' : i === 1 ? 'Оплата' : 'Готово'}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Amount card */}
                <Card>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Typography fontWeight={900} fontSize={40} lineHeight={1} sx={{ fontVariantNumeric: 'tabular-nums', mt: 1 }}>
                            {deal.amount} ₸
                        </Typography>
                        <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 2, display: 'block', mt: 1.5, mb: 2 }}>
                            Сумма сделки
                        </Typography>
                        <Chip
                            label={`${deal.offer_type} • #${(deal.gb_offer_id || deal.club_id || deal.deal_id).slice(-6)}`}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: 11 }}
                        />
                    </CardContent>
                </Card>

                {/* Parties */}
                <Card>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 2, display: 'block', mb: 2, ml: 0.5 }}>
                            Участники
                        </Typography>
                        {[
                            { label: isBuyer ? 'Вы (покупатель)' : 'Покупатель', id: deal.buyer_id, color: 'primary.main' },
                            { label: isSeller ? 'Вы (продавец)' : 'Продавец', id: deal.seller_id, color: 'success.main' },
                        ].map((party, i) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderTop: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(party.color as string, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={party.color as string} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    </Box>
                                    <Typography fontSize={14} fontWeight={600} color="text.secondary">{party.label}</Typography>
                                </Box>
                                <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                                    #{String(party.id).slice(-6)}
                                </Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>

                {/* Created at */}
                <Card>
                    <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontSize={14} color="text.secondary" fontWeight={500}>Создано</Typography>
                        <Typography fontSize={14} fontWeight={600}>
                            {new Date(deal.created_at || deal.updated_at).toLocaleString('ru-RU', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Buyer payment action */}
                {isBuyer && deal.status === 'CREATED' && (
                    <Card sx={{ borderLeft: '3px solid', borderLeftColor: 'primary.main' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', mb: 1.5 }}>
                                Оплата
                            </Typography>
                            <Typography fontSize={14} color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                                {t('deal', 'pay_desc')} <strong style={{ color: 'rgba(255,255,255,0.92)' }}>{deal.amount} ₸</strong>
                            </Typography>

                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if (e.target.files?.[0]) { haptic.selection(); setSelectedFile(e.target.files[0]); } }} style={{ display: 'none' }} />

                            {selectedFile ? (
                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UploadRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                    </Box>
                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                        <Typography fontSize={14} fontWeight={600} noWrap>{selectedFile.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{(selectedFile.size / 1024).toFixed(0)} KB</Typography>
                                    </Box>
                                    <IconButton size="small" onClick={() => setSelectedFile(null)}>
                                        <CloseRoundedIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<UploadRoundedIcon />}
                                    sx={{ height: 52, borderStyle: 'dashed', mb: 2, borderRadius: 3 }}
                                >
                                    {t('deal', 'upload_receipt')}
                                </Button>
                            )}

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                onClick={handlePay}
                                disabled={payMutation.isPending}
                                sx={{ height: 52, borderRadius: 3 }}
                            >
                                {payMutation.isPending ? 'Отправка...' : t('deal', 'pay_btn')}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Seller confirm action */}
                {isSeller && deal.status === 'PAID_BY_BUYER' && (
                    <Card sx={{ borderLeft: '3px solid', borderLeftColor: 'success.main' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="caption" color="success.main" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', mb: 1.5 }}>
                                Подтверждение
                            </Typography>
                            <Typography fontSize={14} color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                                {t('deal', 'confirm_desc')} <strong style={{ color: 'rgba(255,255,255,0.92)' }}>{deal.amount} ₸</strong>
                            </Typography>
                            {deal.proof_screenshot_id && (
                                <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <UploadRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                    <Typography fontSize={14} color="text.secondary" fontWeight={500}>Чек от покупателя прикреплён</Typography>
                                </Box>
                            )}
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                size="large"
                                onClick={handleConfirm}
                                disabled={confirmMutation.isPending}
                                sx={{ height: 52, borderRadius: 3, color: 'white' }}
                            >
                                {confirmMutation.isPending ? 'Подтверждение...' : t('deal', 'confirm_btn')}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Waiting states */}
                {isBuyer && deal.status === 'PAID_BY_BUYER' && (
                    <Card><CardContent sx={{ py: 5, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 40, mb: 2 }}>⏳</Box>
                        <Typography fontWeight={700} mb={0.5}>Ожидание подтверждения</Typography>
                        <Typography variant="caption" color="text.secondary">Продавец проверяет оплату</Typography>
                    </CardContent></Card>
                )}
                {isSeller && deal.status === 'CREATED' && (
                    <Card><CardContent sx={{ py: 5, textAlign: 'center' }}>
                        <Box sx={{ fontSize: 40, mb: 2 }}>💤</Box>
                        <Typography fontWeight={700} mb={0.5}>Ожидание оплаты</Typography>
                        <Typography variant="caption" color="text.secondary">Покупатель ещё не оплатил сделку</Typography>
                    </CardContent></Card>
                )}
                {deal.status === 'COMPLETED' && (
                    <Card sx={{ bgcolor: alpha('#4CAF50', 0.06), border: '1px solid rgba(76,175,80,0.15)' }}>
                        <CardContent sx={{ py: 5, textAlign: 'center' }}>
                            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: alpha('#4CAF50', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                                <CheckRoundedIcon sx={{ fontSize: 32, color: 'success.main' }} />
                            </Box>
                            <Typography fontWeight={800} color="success.main" fontSize={18} mb={0.5}>{t('deal', 'deal_completed')}</Typography>
                            <Typography variant="caption" color="text.secondary">Сделка успешно завершена</Typography>
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </Box>
    );
}
