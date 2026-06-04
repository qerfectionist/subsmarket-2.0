import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, Club } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Fab,
    InputBase,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

type Filter = 'all' | 'digital' | 'telecom';
type PageTab = 'market' | 'my';

const filters: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'Все' },
    { id: 'digital', label: 'Сервисы' },
    { id: 'telecom', label: 'Связь' },
];

export function ClubsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const tabParam = searchParams.get('tab');
    const initialTab: PageTab = tabParam === 'my' ? 'my' : 'market';
    const [tab, setTab] = useState<PageTab>(initialTab);
    const initialFilter: Filter = categoryParam === 'digital' || categoryParam === 'telecom' ? categoryParam : 'all';
    const [filter, setFilter] = useState<Filter>(initialFilter);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const haptic = useHaptic();
    const navigate = useNavigate();

    const handleSearchChange = (val: string) => {
        setSearchInput(val);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => setSearchQuery(val.trim()), 350);
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
    };

    useEffect(() => {
        const nextTab: PageTab = searchParams.get('tab') === 'my' ? 'my' : 'market';
        const nextCategory = searchParams.get('category');
        const nextFilter: Filter = nextCategory === 'digital' || nextCategory === 'telecom' ? nextCategory : 'all';

        setTab(current => current === nextTab ? current : nextTab);
        setFilter(current => current === nextFilter ? current : nextFilter);
    }, [searchParams]);

    const setRouteState = (nextTab: PageTab, nextFilter = filter) => {
        const nextParams = new URLSearchParams(searchParams);
        if (nextTab === 'my') {
            nextParams.set('tab', 'my');
        } else {
            nextParams.set('tab', 'market');
        }

        if (nextFilter === 'all') {
            nextParams.delete('category');
        } else {
            nextParams.set('category', nextFilter);
        }

        setSearchParams(nextParams, { replace: true });
    };

    const handleTabChange = (nextTab: PageTab) => {
        haptic.selection();
        setTab(nextTab);
        if (nextTab === 'market') clearSearch();
        setRouteState(nextTab, nextTab === 'market' ? 'all' : filter);
    };

    const handleFilterChange = (nextFilter: Filter) => {
        haptic.selection();
        setFilter(nextFilter);
        setRouteState(tab, nextFilter);
    };

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['clubs', filter, searchQuery],
        queryFn: () => api.getClubs({ ...(filter !== 'all' && { category: filter }), ...(searchQuery && { search: searchQuery }) }),
        enabled: tab === 'market',
        placeholderData: keepPreviousData,
        staleTime: 2 * 60 * 1000,
    });

    const { data: myClubs, isLoading: myLoading, error: myError, refetch: myRefetch } = useQuery({
        queryKey: ['clubs', 'my'],
        queryFn: () => api.getMyClubs(),
        enabled: tab === 'my',
        staleTime: 2 * 60 * 1000,
    });

    const clubs = data?.items ?? [];
    const total = data?.total ?? 0;
    const visibleMyClubs = filter === 'all' ? (myClubs ?? []) : (myClubs ?? []).filter(club => club.category === filter);
    const createPath = filter === 'telecom'
        ? '/clubs/create/tariff'
        : filter === 'digital'
            ? '/clubs/create/subscription'
            : '/clubs/create';

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', pb: 14 }}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 40, bgcolor: 'rgba(245,244,239,0.94)', backdropFilter: 'blur(20px)', px: 2, pt: 1.8, pb: 1.2 }}>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 1.4 }}>
                        <Box>
                            <Typography fontSize={28} fontWeight={760} lineHeight={1.05}>
                                Места
                            </Typography>
                            <Typography fontSize={13.5} fontWeight={520} color="#77736B">
                                подписки и семейные слоты
                            </Typography>
                        </Box>
                        {tab === 'market' && total > 0 && <Chip label={`${total} сейчас`} sx={{ bgcolor: '#fff', color: '#111' }} />}
                    </Box>

                    <Tabs value={tab} onChange={(_, v) => handleTabChange(v)} sx={{ minHeight: 40, mb: 1.2 }}>
                        <Tab value="market" label="Маркет" />
                        <Tab value="my" label="Мои" />
                    </Tabs>

                    {tab === 'market' && (
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff', borderRadius: '20px', px: 1.4, height: 48 }}>
                                <SearchRoundedIcon sx={{ fontSize: 21, color: '#77736B' }} />
                                <InputBase value={searchInput} onChange={e => handleSearchChange(e.target.value)} placeholder="YouTube, Яндекс, Beeline..." sx={{ flex: 1, fontSize: 15, '& input': { p: 0 } }} />
                                {searchInput && (
                                    <Box onClick={clearSearch} sx={{ cursor: 'pointer', display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', bgcolor: '#F2F1EC' }}>
                                        <CloseRoundedIcon sx={{ fontSize: 15 }} />
                                    </Box>
                                )}
                            </Box>

                            {!searchInput && (
                                <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 0.2 }}>
                                    {filters.map(item => (
                                        <Chip
                                            key={item.id}
                                            label={item.label}
                                            clickable
                                            onClick={() => handleFilterChange(item.id)}
                                            sx={{
                                                bgcolor: filter === item.id ? '#111' : '#fff',
                                                color: filter === item.id ? '#fff' : '#111',
                                                flexShrink: 0,
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Stack>
                    )}
                </Box>
            </Box>

            <Box sx={{ px: 2, pt: 1.4, maxWidth: 600, mx: 'auto' }}>
                {tab === 'market' && (
                    <Stack spacing={1}>
                        {isLoading && [1, 2, 3].map(i => <ClubCardSkeleton key={i} />)}
                        {error && <ErrorState title="Не загрузили предложения" action="Повторить" onClick={() => refetch()} />}
                        {!isLoading && !error && clubs.length === 0 && (
                            <EmptyState
                                title="Пока ничего нет"
                                body={searchQuery ? `Нет предложений по запросу «${searchQuery}»` : 'Попробуйте другой фильтр или создайте первое предложение.'}
                                action="Создать"
                                onClick={() => navigate(createPath)}
                            />
                        )}
                        {!isLoading && !error && clubs.map(club => <ClubCard key={club.club_id} club={club} />)}
                    </Stack>
                )}

                {tab === 'my' && (
                    <Stack spacing={1}>
                        {myLoading && [1, 2].map(i => <ClubCardSkeleton key={i} />)}
                        {myError && <ErrorState title="Не загрузили ваши места" action="Повторить" onClick={() => myRefetch()} />}
                        {!myLoading && !myError && visibleMyClubs.length === 0 && (
                            <EmptyState title="Мест пока нет" body="Вступите в клуб или создайте свое предложение." action="Открыть маркет" onClick={() => handleTabChange('market')} />
                        )}
                        {!myLoading && !myError && visibleMyClubs.map(club => <ClubCard key={club.club_id} club={club} />)}
                    </Stack>
                )}
            </Box>

            <Fab component={Link} to={createPath} onClick={() => haptic.impact('medium')} sx={{ position: 'fixed', bottom: 'calc(84px + env(safe-area-inset-bottom))', right: 20, zIndex: 50, bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }} size="medium">
                <AddRoundedIcon />
            </Fab>
        </Box>
    );
}

function ClubCard({ club }: { club: Club }) {
    const haptic = useHaptic();
    const isFull = club.status === 'full';
    const isFrozen = club.status === 'frozen';
    const spotsFree = club.max_members - club.current_members;
    const hasSlots = club.category === 'telecom' && Boolean(club.slot_config?.length);
    const slotSummary = hasSlots
        ? club.slot_config!.map(slot => `${slot.label}: ${slot.capacity} · ${Math.round(Number(slot.price))} ₸`).join(' / ')
        : null;

    return (
        <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px' }}>
            <CardActionArea component={Link} to={`/clubs/${club.club_id}`} onClick={() => haptic.impact('light')} sx={{ p: 1.45, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Avatar src={club.subscription.icon_url || undefined} alt={club.subscription.service_name} variant="rounded" sx={{ width: 48, height: 48, borderRadius: '17px', bgcolor: '#FFE15A', color: '#111', fontSize: 20, fontWeight: 720, '& img': { objectFit: 'contain' } }}>
                    {club.subscription.service_name.charAt(0)}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={720} fontSize={15.5} lineHeight={1.2} noWrap>
                        {club.subscription.service_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, mt: 0.45 }}>
                        <GroupRoundedIcon sx={{ fontSize: 14, color: '#77736B' }} />
                        <Typography fontSize={12.5} color="#77736B" fontWeight={520} noWrap>
                            {slotSummary || `${club.current_members}/${club.max_members}`}
                        </Typography>
                        {!isFull && !isFrozen && spotsFree > 0 && (
                            <Typography fontSize={12.5} color="#2E7D32" fontWeight={650}>
                                · {spotsFree} мест
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography fontWeight={760} fontSize={16} lineHeight={1.1}>
                        {hasSlots ? `от ${Math.round(club.price_per_member)} ₸` : `${Math.round(club.price_per_member)} ₸`}
                    </Typography>
                    {isFull && <Chip label="занято" size="small" sx={{ mt: 0.4, height: 20, bgcolor: '#F2F1EC' }} />}
                    {isFrozen && <Chip label="пауза" size="small" sx={{ mt: 0.4, height: 20, bgcolor: '#FFE0D6' }} />}
                    {!isFull && !isFrozen && <Typography fontSize={11.5} color="#77736B" fontWeight={520}>/мес</Typography>}
                </Box>
            </CardActionArea>
        </Card>
    );
}

function ClubCardSkeleton() {
    return (
        <Card sx={{ bgcolor: '#fff', border: 0, borderRadius: '24px' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.4, p: 1.5 }}>
                <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: '17px' }} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width={140} height={22} />
                    <Skeleton variant="text" width={90} height={16} />
                </Box>
                <Skeleton variant="rounded" width={64} height={34} />
            </CardContent>
        </Card>
    );
}

function EmptyState({ title, body, action, onClick }: { title: string; body: string; action: string; onClick: () => void }) {
    return (
        <Box sx={{ textAlign: 'center', py: 7, px: 2, bgcolor: '#fff', borderRadius: '28px' }}>
            <GridViewRoundedIcon sx={{ fontSize: 44, color: '#B7B1A8', mb: 1 }} />
            <Typography fontSize={18} fontWeight={720}>{title}</Typography>
            <Typography fontSize={14} color="#77736B" sx={{ mt: 0.5, mb: 2 }}>{body}</Typography>
            <Button onClick={onClick} sx={{ bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }}>{action}</Button>
        </Box>
    );
}

function ErrorState({ title, action, onClick }: { title: string; action: string; onClick: () => void }) {
    return (
        <Box sx={{ textAlign: 'center', py: 7, px: 2, bgcolor: '#fff', borderRadius: '28px' }}>
            <ErrorOutlineRoundedIcon sx={{ fontSize: 44, color: '#D84315', mb: 1 }} />
            <Typography fontSize={18} fontWeight={720}>{title}</Typography>
            <Button onClick={onClick} sx={{ mt: 2, bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }}>{action}</Button>
        </Box>
    );
}

export default ClubsPage;
