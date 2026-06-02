import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, AccountOffer } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { useTelegram } from '@/shared/hooks/useTelegram';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

type TabKey = 'buy' | 'sell';

const categoryOptions = ['Streaming', 'Cloud', 'AI', 'Gaming', 'VPN', 'Other'];

export function AccountsPage() {
    const [tab, setTab] = useState<TabKey>('buy');
    const haptic = useHaptic();
    const { webapp } = useTelegram();
    const user = webapp?.initDataUnsafe?.user;

    const { data: offers = [], isLoading, refetch } = useQuery({
        queryKey: ['account-offers'],
        queryFn: () => api.getAccountOffers(),
        staleTime: 2 * 60 * 1000,
        refetchInterval: 60 * 1000,
    });

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', pb: 14 }}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 40, bgcolor: 'rgba(245,244,239,0.94)', backdropFilter: 'blur(20px)', px: 2, pt: 1.8, pb: 1.2 }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.4 }}>
                        <Box>
                            <Typography fontSize={28} fontWeight={760} lineHeight={1.05}>
                                Аккаунты
                            </Typography>
                            <Typography fontSize={13.5} fontWeight={520} color="#77736B">
                                GPT, Canva, Grok и другие аккаунты
                            </Typography>
                        </Box>
                        <Chip label="safe" sx={{ bgcolor: '#D8C7FF', color: '#111' }} />
                    </Box>

                    <Tabs value={tab} onChange={(_, v) => { haptic.selection(); setTab(v); }} sx={{ minHeight: 40 }}>
                        <Tab value="buy" label="Маркет" />
                        <Tab value="sell" label="Создать" />
                    </Tabs>
                </Box>
            </Box>

            <Box sx={{ px: 2, pt: 1.4, maxWidth: 600, mx: 'auto' }}>
                {tab === 'buy' && (
                    <Stack spacing={1}>
                        {isLoading && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CircularProgress size={32} sx={{ color: '#111' }} />
                            </Box>
                        )}
                        {!isLoading && offers.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 8, px: 2, bgcolor: '#fff', borderRadius: '28px' }}>
                                <KeyRoundedIcon sx={{ fontSize: 44, color: '#B7B1A8', mb: 1 }} />
                                <Typography fontSize={18} fontWeight={720}>Пока нет предложений</Typography>
                                <Typography fontSize={14} color="#77736B" sx={{ mt: 0.5 }}>Создайте первое предложение по аккаунту или сервису.</Typography>
                                <Button onClick={() => setTab('sell')} sx={{ mt: 2, bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }}>Создать</Button>
                            </Box>
                        )}
                        {offers.map(offer => <AccountCard key={offer.offer_id} offer={offer} currentUserId={user?.id} />)}
                    </Stack>
                )}

                {tab === 'sell' && <SellAccountForm onSuccess={() => { setTab('buy'); refetch(); }} />}
            </Box>
        </Box>
    );
}

function AccountCard({ offer, currentUserId }: { offer: AccountOffer; currentUserId?: number }) {
    const haptic = useHaptic();
    const { showConfirm } = useTelegram();
    const queryClient = useQueryClient();

    const buyMutation = useMutation({
        mutationFn: () => api.createDeal({ offer_type: 'account', offer_id: offer.offer_id, amount: offer.price }),
        onSuccess: (deal) => {
            haptic.notification('success');
            alert(`Сделка #${deal.deal_id.slice(0, 8)} создана. Проверьте раздел сделок.`);
            queryClient.invalidateQueries({ queryKey: ['account-offers'] });
        },
        onError: (e) => {
            haptic.notification('error');
            console.error(e);
            alert('Не удалось создать сделку');
        },
    });

    const handleBuy = async () => {
        haptic.impact('medium');
        const confirmed = await showConfirm(`Оформить "${offer.title}" за ${offer.price} ₸?`);
        if (confirmed) buyMutation.mutate();
    };

    const isOwner = currentUserId === offer.seller_id;

    return (
        <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px' }}>
            <CardContent sx={{ p: 1.6 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 1.2 }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Chip label={offer.service_category} size="small" sx={{ height: 22, bgcolor: '#D8C7FF', color: '#111', mb: 0.8 }} />
                        <Typography fontWeight={720} fontSize={16} lineHeight={1.25}>
                            {offer.title}
                        </Typography>
                    </Box>
                    <Box sx={{ bgcolor: '#F2F1EC', px: 1.3, py: 0.75, borderRadius: '16px', flexShrink: 0 }}>
                        <Typography fontWeight={760} fontSize={16}>{offer.price} ₸</Typography>
                    </Box>
                </Box>

                <Typography fontSize={13.5} color="#77736B" lineHeight={1.45} sx={{ mb: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {offer.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pt: 1.2, borderTop: '1px solid #F0EEE8' }}>
                    <Typography fontSize={12} color="#77736B" fontWeight={520}>продавец #{offer.seller_id}</Typography>
                    {!isOwner && (
                        <Button size="small" disabled={buyMutation.isPending} onClick={handleBuy} sx={{ bgcolor: '#111', color: '#fff', px: 1.6, '&:hover': { bgcolor: '#222' } }}>
                            {buyMutation.isPending ? 'Создаем...' : 'Оформить'}
                        </Button>
                    )}
                    {isOwner && <Chip size="small" label="ваше" sx={{ bgcolor: '#B9F27D' }} />}
                </Box>
            </CardContent>
        </Card>
    );
}

function SellAccountForm({ onSuccess }: { onSuccess: () => void }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Streaming');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const haptic = useHaptic();

    const createMutation = useMutation({
        mutationFn: () => api.createAccountOffer({ title, service_category: category, price: Number(price), description: desc }),
        onSuccess: () => {
            haptic.notification('success');
            alert('Предложение опубликовано');
            onSuccess();
        },
        onError: (e) => {
            haptic.notification('error');
            alert('Не удалось создать предложение');
            console.error(e);
        },
    });

    return (
        <Stack spacing={1.2} component="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); createMutation.mutate(); }}>
            <Card sx={{ bgcolor: '#D8C7FF', color: '#111', border: 0, borderRadius: '30px' }}>
                <CardContent sx={{ p: 2.2 }}>
                    <Typography fontSize={25} fontWeight={760} lineHeight={1.06}>Создать аккаунт</Typography>
                    <Typography fontSize={14} color="rgba(0,0,0,0.58)" sx={{ mt: 0.8 }}>Опишите сервис, срок и условия. Логины и коды передавайте только после сделки.</Typography>
                </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '26px' }}>
                <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1.4}>
                        <TextField label="Название" value={title} onChange={e => setTitle(e.target.value)} placeholder="ChatGPT Pro, Canva Pro" required fullWidth />
                        <TextField select label="Категория" value={category} onChange={e => setCategory(e.target.value)} fullWidth>
                            {categoryOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                        <TextField type="number" label="Цена" value={price} onChange={e => setPrice(e.target.value)} placeholder="5000" required fullWidth InputProps={{ endAdornment: <Typography color="#77736B" ml={0.5}>₸</Typography> }} />
                        <TextField label="Описание" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Что входит, срок, условия передачи" required fullWidth multiline minRows={3} maxRows={5} />
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ p: 1.6, bgcolor: '#fff', borderRadius: '22px', display: 'flex', gap: 1.1 }}>
                <ShieldRoundedIcon sx={{ color: '#77736B', mt: 0.1 }} />
                <Typography fontSize={12.5} color="#77736B" lineHeight={1.4}>Не публикуйте логины, пароли и коды в описании. Детали передаются после создания сделки.</Typography>
            </Box>

            <Button type="submit" size="large" disabled={createMutation.isPending} startIcon={<AddRoundedIcon />} sx={{ bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }}>
                {createMutation.isPending ? 'Публикуем...' : 'Опубликовать'}
            </Button>
        </Stack>
    );
}

export default AccountsPage;
