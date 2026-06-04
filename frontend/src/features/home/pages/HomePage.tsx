import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, Club } from '@/shared/api';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActionArea,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';
import CreditScoreRoundedIcon from '@mui/icons-material/CreditScoreRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';

const serviceTiles = [
    { title: 'Подписки', subtitle: 'YouTube, Яндекс', to: '/clubs?category=digital', createTo: '/clubs/create/subscription', icon: GridViewRoundedIcon, color: '#FFE36E' },
    { title: 'Тарифы', subtitle: 'семейные операторы', to: '/clubs?category=telecom', createTo: '/clubs/create/tariff', icon: CellTowerRoundedIcon, color: '#B9F27D' },
    { title: 'Гигабайты', subtitle: 'продажа лишних ГБ', to: '/gb-market', icon: WifiRoundedIcon, color: '#BFE7FF' },
    { title: 'Аккаунты', subtitle: 'GPT, Canva, Grok', to: '/accounts', icon: StorefrontRoundedIcon, color: '#D8C7FF' },
];

export function HomePage() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const { data: liveData, isLoading: liveLoading } = useQuery({
        queryKey: ['home-live-clubs'],
        queryFn: () => api.getClubs({ limit: 3 }),
        staleTime: 2 * 60 * 1000,
    });
    const liveOffers = liveData?.items ?? [];

    return (
        <Box sx={{ bgcolor: '#F5F4EF', color: '#111', px: 2, pt: 1.6, pb: 2 }}>
            <Box sx={{ maxWidth: 430, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar
                            component={Link}
                            to="/profile"
                            src={user?.photo_url}
                            sx={{ width: 38, height: 38, bgcolor: '#111', color: '#fff', fontWeight: 700, textDecoration: 'none' }}
                        >
                            {(user?.first_name ?? 'S').charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography fontSize={17} fontWeight={760} lineHeight={1.05}>
                                SubsMarket
                            </Typography>
                            <Typography fontSize={12.5} fontWeight={520} color="#74716A">
                                подписки, тарифы, аккаунты
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        component={Link}
                        to="/profile?section=settings"
                        aria-label="Настройки"
                        sx={{ width: 40, height: 40, bgcolor: '#fff', color: '#111', '&:hover': { bgcolor: '#fff' } }}
                    >
                        <SettingsRoundedIcon sx={{ fontSize: 21 }} />
                    </IconButton>
                </Box>

                <Card sx={{ bgcolor: '#fff', color: '#111', borderRadius: '28px', border: '0', mb: 1.2 }}>
                    <CardActionArea component={Link} to="/clubs" sx={{ p: 1.2 }}>
                        <Box
                            sx={{
                                height: 48,
                                borderRadius: '18px',
                                bgcolor: '#F2F1EC',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.1,
                                px: 1.4,
                            }}
                        >
                            <SearchRoundedIcon sx={{ color: '#77736B', fontSize: 21 }} />
                            <Typography fontSize={15} fontWeight={560} color="#77736B">
                                Найти YouTube, Beeline, GPT...
                            </Typography>
                        </Box>
                    </CardActionArea>
                </Card>

                <Card sx={{ bgcolor: '#FFE15A', color: '#111', borderRadius: '32px', border: 0, mb: 1.4 }}>
                    <CardActionArea component={Link} to="/clubs" sx={{ p: 2.2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: 30, lineHeight: 1.04, fontWeight: 760, letterSpacing: 0, mb: 1 }}>
                                    Подписки, тарифы и аккаунты без хаоса
                                </Typography>
                                <Typography fontSize={15} lineHeight={1.42} fontWeight={520} color="rgba(0,0,0,0.58)">
                                    Видно, что продают: семейное место, тариф, ГБ или аккаунт.
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: '18px',
                                    bgcolor: '#111',
                                    color: '#FFE15A',
                                    display: 'grid',
                                    placeItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <BoltRoundedIcon />
                            </Box>
                        </Box>
                    </CardActionArea>
                </Card>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2.1 }}>
                    {serviceTiles.map(({ title, subtitle, to, icon: Icon, color }) => (
                        <Card key={title} sx={{ bgcolor: '#fff', color: '#111', borderRadius: '26px', border: 0 }}>
                            <CardActionArea component={Link} to={to} sx={{ p: 1.45, minHeight: 112 }}>
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: '16px',
                                        bgcolor: color,
                                        display: 'grid',
                                        placeItems: 'center',
                                        mb: 1.35,
                                    }}
                                >
                                    <Icon sx={{ color: '#111', fontSize: 22 }} />
                                </Box>
                                <Typography fontSize={16} fontWeight={720} lineHeight={1.15}>
                                    {title}
                                </Typography>
                                <Typography fontSize={12.5} fontWeight={520} color="#77736B" noWrap>
                                    {subtitle}
                                </Typography>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>

                {(liveLoading || liveOffers.length > 0) && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography fontSize={21} fontWeight={760} lineHeight={1.15}>
                                Сейчас в маркете
                            </Typography>
                            <Button component={Link} to="/clubs" endIcon={<ArrowForwardRoundedIcon />} sx={{ color: '#111', px: 1 }}>
                                Все
                            </Button>
                        </Box>

                        <Stack spacing={1}>
                            {liveLoading && [1, 2, 3].map(index => (
                                <Card key={index} sx={{ bgcolor: '#fff', color: '#111', borderRadius: '24px', border: 0, p: 1.45 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                        <Box sx={{ width: 44, height: 44, borderRadius: '16px', bgcolor: '#F2F1EC', flexShrink: 0 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ width: '55%', height: 16, borderRadius: 999, bgcolor: '#F2F1EC', mb: 0.8 }} />
                                            <Box sx={{ width: '38%', height: 12, borderRadius: 999, bgcolor: '#F2F1EC' }} />
                                        </Box>
                                    </Box>
                                </Card>
                            ))}
                            {!liveLoading && liveOffers.map((club, index) => <LiveOfferCard key={club.club_id} club={club} index={index} />)}
                        </Stack>
                    </>
                )}

                <Box sx={{ mt: 1.2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Button
                        component={Link}
                        to="/clubs/create/subscription"
                        size="large"
                        startIcon={<AddRoundedIcon />}
                        sx={{ bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' }, minWidth: 0 }}
                    >
                        Подписку
                    </Button>
                    <Button
                        component={Link}
                        to="/clubs/create/tariff"
                        size="large"
                        startIcon={<CellTowerRoundedIcon />}
                        sx={{ bgcolor: '#fff', color: '#111', '&:hover': { bgcolor: '#fff' }, minWidth: 0 }}
                    >
                        Тариф
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

function LiveOfferCard({ club, index }: { club: Club; index: number }) {
    const spotsLeft = Math.max(0, club.max_members - club.current_members);
    const isTelecom = club.category === 'telecom';
    const meta = isTelecom
        ? `${club.current_members}/${club.max_members} · семейный тариф`
        : spotsLeft > 0
            ? `${spotsLeft} мест свободно`
            : 'мест нет';

    return (
        <Card sx={{ bgcolor: '#fff', color: '#111', borderRadius: '24px', border: 0 }}>
            <CardActionArea component={Link} to={`/clubs/${club.club_id}`} sx={{ p: 1.45, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '16px',
                        bgcolor: index === 0 ? '#FFE15A' : '#F2F1EC',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                    }}
                >
                    {isTelecom ? <WifiRoundedIcon sx={{ fontSize: 21 }} /> : <CreditScoreRoundedIcon sx={{ fontSize: 21 }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={15.5} fontWeight={720} lineHeight={1.2} noWrap>
                        {club.subscription.service_name}
                    </Typography>
                    <Typography fontSize={12.5} fontWeight={520} color="#77736B" noWrap>
                        {meta}
                    </Typography>
                </Box>
                <Typography fontSize={15} fontWeight={760}>
                    {Math.round(club.price_per_member)} ₸
                </Typography>
            </CardActionArea>
        </Card>
    );
}

export default HomePage;
