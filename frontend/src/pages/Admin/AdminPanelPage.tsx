import { useState, useEffect, useCallback } from 'react';
import { useHaptic } from '@/shared/hooks/useHaptic';
import {
    Box, Typography, Card, CardContent, Button, TextField,
    MenuItem, Stack, Chip, IconButton, alpha, Divider,
} from '@mui/material';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
type ActiveTab = 'clubs' | 'sell_gb' | 'buy_gb';

function isLocalDevHost(): boolean {
    return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

export default function AdminPanelPage() {
    const haptic = useHaptic();
    const [mockId, setMockId] = useState(() => localStorage.getItem('admin_mock_id') || Math.floor(Math.random() * 100000).toString());
    const [mockName, setMockName] = useState(() => localStorage.getItem('admin_mock_name') || 'AdminUser');
    const [activeTab, setActiveTab] = useState<ActiveTab>('clubs');
    const [isLoading, setIsLoading] = useState(false);

    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [gbOffers, setGbOffers] = useState<any[]>([]);
    const [clubs, setClubs] = useState<any[]>([]);

    useEffect(() => { localStorage.setItem('admin_mock_id', mockId); localStorage.setItem('admin_mock_name', mockName); }, [mockId, mockName]);

    const getHeaders = (id = mockId, name = mockName) => ({
        'X-Telegram-Init-Data': isLocalDevHost() ? `mock:${id}:${name}` : '',
        'Content-Type': 'application/json',
    });

    const fetchSubscriptions = useCallback(async () => { try { const r = await fetch(`${API_URL}/subscriptions`, { headers: getHeaders() }); if (r.ok) setSubscriptions(await r.json()); } catch (e) { console.error(e); } }, []);
    const fetchGbOffers = useCallback(async () => { try { const r = await fetch(`${API_URL}/gigabytes`, { headers: getHeaders() }); if (r.ok) setGbOffers(await r.json()); } catch (e) { console.error(e); } }, []);
    const fetchClubs = useCallback(async () => { try { const r = await fetch(`${API_URL}/clubs`, { headers: getHeaders() }); if (r.ok) { const d = await r.json(); setClubs(d.items || d); } } catch (e) { console.error(e); } }, []);

    useEffect(() => { fetchSubscriptions(); fetchGbOffers(); fetchClubs(); }, [fetchSubscriptions, fetchGbOffers, fetchClubs]);
    const call = async (fn: () => Promise<void>) => { setIsLoading(true); try { await fn(); } finally { setIsLoading(false); } };

    const handleCreateUser = () => call(async () => {
        const res = await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
        if (res.ok) { haptic.notification('success'); alert(`Пользователь ${mockName} (ID: ${mockId}) успешно создан!`); }
        else { haptic.notification('error'); alert(`Ошибка: ${await res.text()}`); }
    });

    const handleCreateClub = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); const fd = new FormData(e.currentTarget); const form = e.currentTarget; call(async () => {
            await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
            const payload = { subscription_id: fd.get('subscription_id'), price_total: Number(fd.get('price_total')), max_members: Number(fd.get('max_members')), payment_method: fd.get('payment_method'), payment_details: fd.get('payment_details') || '1234 5678 9012', payment_day: Number(fd.get('payment_day')), description: fd.get('description') || 'Тестовый клуб из админки', rules: fd.get('rules') || 'Своевременная оплата' };
            const res = await fetch(`${API_URL}/clubs`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
            if (res.ok) { haptic.notification('success'); alert('Клуб успешно создан!'); form.reset(); fetchClubs(); }
            else { haptic.notification('error'); alert(`Ошибка: ${await res.text()}`); }
        });
    };

    const handleCreateSellGb = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); const fd = new FormData(e.currentTarget); const form = e.currentTarget; call(async () => {
            await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
            const payload = { operator: fd.get('operator'), amount_gb: Number(fd.get('amount_gb')), price: Number(fd.get('price')), description: fd.get('description') || 'Отличный интернет' };
            const res = await fetch(`${API_URL}/gigabytes`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
            if (res.ok) { haptic.notification('success'); alert('Заявка на продажу ГБ создана!'); form.reset(); fetchGbOffers(); }
            else { haptic.notification('error'); alert(`Ошибка: ${await res.text()}`); }
        });
    };

    const handleCreateBuyGb = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); const fd = new FormData(e.currentTarget); const form = e.currentTarget; call(async () => {
            await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
            const res = await fetch(`${API_URL}/deals`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ offer_type: 'gigabyte', offer_id: fd.get('offer_id'), amount: Number(fd.get('amount')) }) });
            if (res.ok) { haptic.notification('success'); alert('Сделка создана!'); form.reset(); }
            else { haptic.notification('error'); alert(`Ошибка: ${await res.text()}`); }
        });
    };

    const TABS: { id: ActiveTab; label: string }[] = [
        { id: 'clubs', label: 'Клубы' },
        { id: 'sell_gb', label: 'Продать ГБ' },
        { id: 'buy_gb', label: 'Купить ГБ' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', bgcolor: 'background.default', pb: 10 }}>
            {/* Header */}
            <Box sx={{ position: 'sticky', top: 0, zIndex: 50, bgcolor: alpha('#080808', 0.92), backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', px: 2, py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha('#F44336', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AdminPanelSettingsRoundedIcon color="error" />
                    </Box>
                    <Box>
                        <Typography fontWeight={800} fontSize={16}>Админ Панель</Typography>
                        <Typography variant="caption" color="text.secondary">Мок-данные и генерация</Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ flex: 1, p: 2, maxWidth: 600, mx: 'auto', width: '100%' }}>
                <Stack spacing={3}>
                    {/* Acting User card */}
                    <Card sx={{ border: '1px solid rgba(244,67,54,0.3)', bgcolor: alpha('#F44336', 0.04) }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography fontWeight={700} fontSize={11} letterSpacing={2} color="error" sx={{ textTransform: 'uppercase', mb: 1.5 }}>
                                🔑 Текущий "Acting User"
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                Все API запросы будут выполняться от имени этого пользователя.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                                <TextField label="User ID" size="small" value={mockId} onChange={e => setMockId(e.target.value)} sx={{ flex: 1 }} />
                                <TextField label="Username" size="small" value={mockName} onChange={e => setMockName(e.target.value)} sx={{ flex: 1 }} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button variant="outlined" color="error" size="small" startIcon={<ShuffleRoundedIcon />} onClick={() => { setMockId(Math.floor(Math.random() * 100000).toString()); setMockName('AdminMock_' + Math.floor(Math.random() * 1000)); }} sx={{ flex: 1, fontWeight: 700 }}>
                                    Случайный
                                </Button>
                                <Button variant="contained" color="error" size="small" startIcon={<PersonAddRoundedIcon />} disabled={isLoading} onClick={handleCreateUser} sx={{ flex: 1, fontWeight: 700 }}>
                                    Создать
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Tabs */}
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                        {TABS.map(tab => (
                            <Chip
                                key={tab.id}
                                label={tab.label}
                                clickable
                                onClick={() => setActiveTab(tab.id)}
                                color={activeTab === tab.id ? 'primary' : 'default'}
                                variant={activeTab === tab.id ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 700, flexShrink: 0 }}
                            />
                        ))}
                    </Box>

                    {/* Clubs form */}
                    {activeTab === 'clubs' && (
                        <Card>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography fontWeight={800} fontSize={16} mb={2}>Создать Клуб</Typography>
                                <Stack spacing={2} component="form" onSubmit={handleCreateClub}>
                                    <TextField select name="subscription_id" label="Сервис" required fullWidth defaultValue="">
                                        {subscriptions.map(sub => (
                                            <MenuItem key={sub.subscription_id} value={sub.subscription_id}>
                                                {sub.service_name} (до {sub.max_members} чел)
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <TextField name="price_total" type="number" label="Общая цена (₸)" required fullWidth defaultValue="2000" />
                                        <TextField name="max_members" type="number" label="Кол-во мест" required fullWidth defaultValue="4" />
                                    </Box>
                                    <TextField select name="payment_method" label="Способ оплаты" required fullWidth defaultValue="kaspi">
                                        {['kaspi', 'halyk', 'jusan', 'bcc'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                    </TextField>
                                    <TextField name="payment_details" label="Реквизиты" required fullWidth defaultValue="+7 777 123 4567" />
                                    <TextField name="payment_day" type="number" label="День списания (1-31)" required fullWidth defaultValue="15" />
                                    <TextField name="description" label="Описание" fullWidth defaultValue="Супер клуб" />
                                    <Button type="submit" variant="contained" color="secondary" fullWidth disabled={isLoading} sx={{ height: 48, fontWeight: 800, borderRadius: 3 }}>
                                        Опубликовать Клуб
                                    </Button>
                                </Stack>

                                {clubs.length > 0 && (
                                    <>
                                        <Divider sx={{ my: 3 }} />
                                        <Typography variant="caption" fontWeight={700} letterSpacing={2} color="text.secondary" sx={{ textTransform: 'uppercase', display: 'block', mb: 1.5 }}>Существующие клубы</Typography>
                                        <Stack spacing={1}>
                                            {clubs.map(club => (
                                                <Box key={club.club_id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, px: 1.5, py: 1.25 }}>
                                                    <Box>
                                                        <Typography fontWeight={700} fontSize={13}>{club.service_name}</Typography>
                                                        <Typography variant="caption" color="text.disabled">ID: {club.club_id.split('-')[0]}... • Хост: {club.host_id}</Typography>
                                                    </Box>
                                                    <IconButton color="error" size="small" onClick={async () => {
                                                        if (!confirm('Точно удалить этот клуб?')) return;
                                                        try {
                                                            const res = await fetch(`${API_URL}/clubs/${club.club_id}`, { method: 'DELETE', headers: getHeaders() });
                                                            if (res.ok) { haptic.notification('success'); fetchClubs(); }
                                                            else throw new Error(await res.text());
                                                        } catch (e: any) { haptic.notification('error'); alert(`Ошибка: ${e.message}`); }
                                                    }}>
                                                        <DeleteRoundedIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Sell GB form */}
                    {activeTab === 'sell_gb' && (
                        <Card>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography fontWeight={800} fontSize={16} mb={2}>Оффер на продажу ГБ</Typography>
                                <Stack spacing={2} component="form" onSubmit={handleCreateSellGb}>
                                    <TextField select name="operator" label="Оператор связи" required fullWidth defaultValue="tele2">
                                        {['tele2', 'kcell', 'activ', 'beeline'].map(op => <MenuItem key={op} value={op} sx={{ textTransform: 'capitalize' }}>{op}</MenuItem>)}
                                    </TextField>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <TextField name="amount_gb" type="number" label="ГБ" required fullWidth defaultValue="10" />
                                        <TextField name="price" type="number" label="Цена (₸)" required fullWidth defaultValue="500" />
                                    </Box>
                                    <TextField name="description" label="Описание (опц.)" fullWidth />
                                    <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading} sx={{ height: 48, fontWeight: 800, borderRadius: 3 }}>
                                        Выставить ГБ на продажу
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {/* Buy GB form */}
                    {activeTab === 'buy_gb' && (
                        <Card>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography fontWeight={800} fontSize={16} mb={0.5}>Купить ГБ (Сделка)</Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                    Сделка создастся от имени Acting User.
                                </Typography>
                                <Stack spacing={2} component="form" onSubmit={handleCreateBuyGb}>
                                    <TextField select name="offer_id" label="Выберите оффер" required fullWidth defaultValue="">
                                        {gbOffers.length === 0
                                            ? <MenuItem value="" disabled>Нет доступных офферов</MenuItem>
                                            : gbOffers.map(offer => (
                                                <MenuItem key={offer.offer_id} value={offer.offer_id}>
                                                    {offer.amount_gb} ГБ — ID{offer.seller_id} — {offer.price}₸
                                                </MenuItem>
                                            ))}
                                    </TextField>
                                    <TextField name="amount" type="number" label="Сколько ГБ купить?" required fullWidth defaultValue="5" />
                                    <Button type="submit" variant="contained" color="success" fullWidth disabled={isLoading} sx={{ height: 48, fontWeight: 800, borderRadius: 3 }}>
                                        Создать Deal
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}
