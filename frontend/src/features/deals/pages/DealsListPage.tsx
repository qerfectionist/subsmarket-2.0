import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, Deal } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { Box, Card, CardActionArea, CardContent, Chip, Skeleton, Stack, Typography } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';

const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
    pending: { label: 'Ожидает', bg: '#FFE15A' },
    CREATED: { label: 'Ожидает', bg: '#FFE15A' },
    paid: { label: 'Оплачено', bg: '#BFE7FF' },
    PAID_BY_BUYER: { label: 'Оплачено', bg: '#BFE7FF' },
    confirmed: { label: 'Готово', bg: '#B9F27D' },
    COMPLETED: { label: 'Готово', bg: '#B9F27D' },
    cancelled: { label: 'Отмена', bg: '#F2F1EC' },
    CANCELLED: { label: 'Отмена', bg: '#F2F1EC' },
    disputed: { label: 'Спор', bg: '#FFD6C8' },
    DISPUTED: { label: 'Спор', bg: '#FFD6C8' },
};

export function DealsListPage() {
    const haptic = useHaptic();
    const { data: deals, isLoading, error } = useQuery({
        queryKey: ['my-deals'],
        queryFn: () => api.getMyDeals(),
        refetchInterval: 15000,
    });

    if (isLoading) {
        return (
            <Stack spacing={1}>
                {[1, 2, 3].map(i => (
                    <Card key={i} sx={{ bgcolor: '#fff', border: 0, borderRadius: '24px' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.4, p: 1.5 }}>
                            <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '16px' }} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width={120} height={22} />
                                <Skeleton variant="text" width={80} height={16} />
                            </Box>
                            <Skeleton variant="rounded" width={64} height={28} />
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', py: 7, px: 2, bgcolor: '#fff', borderRadius: '28px' }}>
                <ErrorOutlineRoundedIcon sx={{ fontSize: 44, color: '#D84315', mb: 1 }} />
                <Typography fontSize={18} fontWeight={720}>Не загрузили сделки</Typography>
                <Typography fontSize={14} color="#77736B">Проверьте подключение и повторите позже.</Typography>
            </Box>
        );
    }

    if (!deals || deals.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 7, px: 2, bgcolor: '#fff', borderRadius: '28px' }}>
                <ShoppingBagRoundedIcon sx={{ fontSize: 44, color: '#B7B1A8', mb: 1 }} />
                <Typography fontSize={18} fontWeight={720}>Сделок пока нет</Typography>
                <Typography fontSize={14} color="#77736B">Когда начнете покупку или продажу, статус появится здесь.</Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={1}>
            {deals.map(deal => <DealCard key={deal.deal_id} deal={deal} onTap={() => haptic.impact('light')} />)}
        </Stack>
    );
}

function DealCard({ deal, onTap }: { deal: Deal; onTap: () => void }) {
    const status = STATUS_CONFIG[deal.status] || STATUS_CONFIG.pending;
    const date = new Date(deal.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

    return (
        <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px' }}>
            <CardActionArea component={Link} to={`/deals/${deal.deal_id}`} onClick={onTap} sx={{ p: 1.45, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '16px', bgcolor: status.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <ReceiptLongRoundedIcon sx={{ fontSize: 21 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={720} fontSize={15.5} noWrap>Сделка #{deal.deal_id.slice(-6)}</Typography>
                    <Typography fontSize={12.5} color="#77736B">{date} · {deal.offer_type === 'gigabyte' ? 'ГБ' : 'подписка'}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography fontWeight={760} fontSize={15}>{deal.amount} ₸</Typography>
                    <Chip label={status.label} size="small" sx={{ height: 22, bgcolor: status.bg, fontSize: 11 }} />
                </Box>
            </CardActionArea>
        </Card>
    );
}

export default DealsListPage;
