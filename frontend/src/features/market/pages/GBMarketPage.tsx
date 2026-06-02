import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, CreateGigabyteOfferRequest, GigabyteOffer } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { useTelegram } from '@/shared/hooks/useTelegram';
import DealsListPage from '@/features/deals/pages/DealsListPage';
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Divider,
    Skeleton,
    Slider,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';

type TabKey = 'buy' | 'sell' | 'my';

const operators = [
    { id: 'beeline', name: 'Beeline' },
    { id: 'tele2', name: 'Tele2' },
    { id: 'altel', name: 'Altel' },
    { id: 'kcell', name: 'Kcell' },
    { id: 'activ', name: 'Activ' },
];

export function GBMarketPage() {
    const [tab, setTab] = useState<TabKey>('buy');
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
    const haptic = useHaptic();
    const { showConfirm } = useTelegram();
    const queryClient = useQueryClient();

    const { data: offers = [], isLoading } = useQuery({
        queryKey: ['gb-offers', selectedOperator],
        queryFn: () => api.getGigabyteOffers(selectedOperator ? { operator: selectedOperator } : undefined),
        placeholderData: keepPreviousData,
        staleTime: 2 * 60 * 1000,
    });

    const createDealMutation = useMutation({
        mutationFn: api.createDeal,
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['my-deals'] });
            setTab('my');
        },
        onError: () => haptic.notification('error'),
    });

    const handleBuyOffer = async (offer: GigabyteOffer) => {
        haptic.impact('medium');
        const confirmed = await showConfirm(`Купить ${offer.amount_gb} ГБ за ${offer.price} ₸?`);
        if (confirmed) createDealMutation.mutate({ offer_type: 'gigabyte', offer_id: offer.offer_id, amount: offer.price });
    };

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', pb: 14 }}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 40, bgcolor: 'rgba(245,244,239,0.94)', backdropFilter: 'blur(20px)', px: 2, pt: 1.8, pb: 1.2 }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.4 }}>
                        <Box>
                            <Typography fontSize={28} fontWeight={760} lineHeight={1.05}>
                                ГБ маркет
                            </Typography>
                            <Typography fontSize={13.5} fontWeight={520} color="#77736B">
                                лишние гигабайты от людей рядом
                            </Typography>
                        </Box>
                        <Chip label="live" sx={{ bgcolor: '#B9F27D', color: '#111' }} />
                    </Box>

                    <Tabs value={tab} onChange={(_, v) => { haptic.selection(); setTab(v); }} sx={{ minHeight: 40 }}>
                        <Tab value="buy" label="Купить" />
                        <Tab value="sell" label="Продать" />
                        <Tab value="my" label="Сделки" />
                    </Tabs>
                </Box>
            </Box>

            <Box sx={{ px: 2, pt: 1.4, width: '100%', maxWidth: 600, mx: 'auto' }}>
                {tab === 'buy' && (
                    <>
                        <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1.4, mx: -2, px: 2 }}>
                            {[{ id: null, name: 'Все' }, ...operators].map(op => (
                                <Chip
                                    key={op.id ?? 'all'}
                                    label={op.name}
                                    clickable
                                    onClick={() => { haptic.selection(); setSelectedOperator(op.id); }}
                                    sx={{
                                        bgcolor: selectedOperator === op.id ? '#111' : '#fff',
                                        color: selectedOperator === op.id ? '#fff' : '#111',
                                        flexShrink: 0,
                                    }}
                                />
                            ))}
                        </Box>

                        <Stack spacing={1}>
                            {isLoading && [1, 2, 3].map(i => <OfferSkeleton key={i} />)}
                            {!isLoading && offers.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 8, px: 2, bgcolor: '#fff', borderRadius: '28px' }}>
                                    <StorefrontRoundedIcon sx={{ fontSize: 44, color: '#B7B1A8', mb: 1 }} />
                                    <Typography fontSize={18} fontWeight={720}>Предложений пока нет</Typography>
                                    <Typography fontSize={14} color="#77736B" sx={{ mt: 0.5 }}>Можно создать первое предложение на продажу ГБ.</Typography>
                                    <Button onClick={() => setTab('sell')} sx={{ mt: 2, bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }}>
                                        Продать ГБ
                                    </Button>
                                </Box>
                            )}
                            {!isLoading && offers.map(offer => <OfferCard key={offer.offer_id} offer={offer} onBuy={() => handleBuyOffer(offer)} />)}
                        </Stack>
                    </>
                )}

                {tab === 'sell' && <SellForm onSuccess={() => setTab('my')} />}
                {tab === 'my' && <DealsListPage />}
            </Box>
        </Box>
    );
}

function OfferCard({ offer, onBuy }: { offer: GigabyteOffer; onBuy: () => void }) {
    const op = operators.find(o => o.id === offer.operator.toLowerCase());
    const pricePerGb = offer.price / offer.amount_gb;
    const isHot = pricePerGb < 100;

    return (
        <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px' }}>
            <CardActionArea onClick={onBuy} sx={{ p: 1.55, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                    <Box sx={{ width: 52, height: 52, borderRadius: '18px', bgcolor: '#B9F27D', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography fontWeight={760} fontSize={18} lineHeight={1}>{offer.amount_gb}</Typography>
                            <Typography fontSize={10} fontWeight={650} lineHeight={1}>ГБ</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                            <Typography fontWeight={720} fontSize={15.5} noWrap>{op?.name ?? offer.operator}</Typography>
                            {isHot && <Chip icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: '14px !important' }} />} label="выгодно" size="small" sx={{ height: 22, bgcolor: '#FFE15A' }} />}
                        </Box>
                        <Typography fontSize={12.5} color="#77736B" fontWeight={520}>
                            продавец #{offer.seller_id}
                        </Typography>
                        {offer.description && (
                            <Typography fontSize={12} color="#77736B" fontWeight={520} noWrap sx={{ maxWidth: 190 }}>
                                {offer.description.replace(/\n/g, ' · ')}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography fontWeight={760} fontSize={18} lineHeight={1.15}>{offer.price} ₸</Typography>
                    <Typography fontSize={12} color="#77736B" fontWeight={520}>{Math.round(pricePerGb)} ₸ / ГБ</Typography>
                </Box>
            </CardActionArea>
        </Card>
    );
}

function OfferSkeleton() {
    return (
        <Card sx={{ bgcolor: '#fff', border: 0, borderRadius: '24px' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.4, p: 1.5 }}>
                <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: '18px' }} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={120} height={22} />
                    <Skeleton variant="text" width={90} height={16} />
                </Box>
                <Skeleton variant="rounded" width={72} height={34} />
            </CardContent>
        </Card>
    );
}

function SellForm({ onSuccess }: { onSuccess: () => void }) {
    const haptic = useHaptic();
    const queryClient = useQueryClient();
    const [operator, setOperator] = useState('beeline');
    const [gb, setGb] = useState<number>(10);
    const [price, setPrice] = useState<string>('500');
    const [validUntil, setValidUntil] = useState('до конца месяца');
    const [transferNote, setTransferNote] = useState('перевод через приложение оператора');

    const createOfferMutation = useMutation({
        mutationFn: (data: CreateGigabyteOfferRequest) => api.createGigabyteOffer(data),
        onSuccess: () => {
            haptic.notification('success');
            queryClient.invalidateQueries({ queryKey: ['gb-offers'] });
            onSuccess();
        },
        onError: () => haptic.notification('error'),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        haptic.impact('medium');
        createOfferMutation.mutate({
            operator,
            amount_gb: gb,
            price: parseInt(price, 10),
            description: [`Срок: ${validUntil}`, `Условия: ${transferNote}`].join('\n'),
        });
    };

    return (
        <Stack spacing={1.2} component="form" onSubmit={handleSubmit}>
            <Card sx={{ bgcolor: '#FFE15A', color: '#111', border: 0, borderRadius: '30px' }}>
                <CardContent sx={{ p: 2.2 }}>
                    <Typography fontSize={25} fontWeight={760} lineHeight={1.06}>Продать свободные ГБ</Typography>
                    <Typography fontSize={14} color="rgba(0,0,0,0.58)" sx={{ mt: 0.8 }}>Укажите оператор, объем и цену. Покупатель начнет сделку из карточки.</Typography>
                </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '26px' }}>
                <CardContent sx={{ p: 2 }}>
                    <Typography fontSize={13} fontWeight={650} color="#77736B" sx={{ mb: 1 }}>Оператор</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                        {operators.map(op => (
                            <Chip key={op.id} label={op.name} clickable onClick={() => { haptic.selection(); setOperator(op.id); }} sx={{ bgcolor: operator === op.id ? '#111' : '#F2F1EC', color: operator === op.id ? '#fff' : '#111' }} />
                        ))}
                    </Box>

                    <Divider sx={{ my: 2, borderColor: '#F0EEE8' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography fontSize={15} fontWeight={650}>Объем</Typography>
                        <Typography fontSize={15} fontWeight={760}>{gb} ГБ</Typography>
                    </Box>
                    <Slider
                        value={gb}
                        min={1}
                        max={50}
                        step={1}
                        onChange={(_, val) => {
                            haptic.selection();
                            const v = Array.isArray(val) ? val[0] : val;
                            setGb(v);
                            setPrice((v * 50).toString());
                        }}
                        sx={{ color: '#111' }}
                    />

                    <Divider sx={{ my: 2, borderColor: '#F0EEE8' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Box>
                            <Typography fontSize={15} fontWeight={650}>Цена</Typography>
                            <Typography fontSize={12.5} color="#77736B">~ {Math.round(parseInt(price || '0', 10) / gb)} ₸ / ГБ</Typography>
                        </Box>
                        <TextField value={price} onChange={e => setPrice(e.target.value)} type="number" size="small" sx={{ width: 128 }} InputProps={{ endAdornment: <Typography color="#77736B" ml={0.5}>₸</Typography> }} inputProps={{ style: { textAlign: 'right', fontWeight: 720, fontSize: 18 } }} />
                    </Box>

                    <Divider sx={{ my: 2, borderColor: '#F0EEE8' }} />

                    <Stack spacing={1.2}>
                        <TextField
                            label="Срок жизни ГБ"
                            value={validUntil}
                            onChange={e => setValidUntil(e.target.value)}
                            placeholder="до конца месяца"
                            fullWidth
                        />
                        <TextField
                            label="Условия перевода"
                            value={transferNote}
                            onChange={e => setTransferNote(e.target.value)}
                            placeholder="перевод через приложение оператора"
                            fullWidth
                        />
                    </Stack>
                </CardContent>
            </Card>

            <Button type="submit" size="large" disabled={createOfferMutation.isPending} startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }}>
                {createOfferMutation.isPending ? 'Публикуем...' : 'Опубликовать'}
            </Button>
        </Stack>
    );
}

export default GBMarketPage;
