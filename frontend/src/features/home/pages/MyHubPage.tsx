import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { useHaptic } from '@/shared/hooks/useHaptic';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';

const hubItems = [
    {
        title: 'Мои подписки',
        subtitle: 'семейные места и заявки',
        to: '/clubs?tab=my&category=digital',
        icon: <GridViewRoundedIcon />,
        color: '#FFE15A',
    },
    {
        title: 'Мои тарифы',
        subtitle: 'семейная связь и слоты',
        to: '/clubs?tab=my&category=telecom',
        icon: <CellTowerRoundedIcon />,
        color: '#B9F27D',
    },
    {
        title: 'ГБ сделки',
        subtitle: 'покупки и продажи гигабайтов',
        to: '/gb-market?tab=deals',
        icon: <WifiRoundedIcon />,
        color: '#BFE7FF',
    },
    {
        title: 'Аккаунты',
        subtitle: 'ваши предложения и покупки',
        to: '/accounts?tab=my',
        icon: <StorefrontRoundedIcon />,
        color: '#D8C7FF',
    },
];

export function MyHubPage() {
    const haptic = useHaptic();
    const { data: myClubs, isLoading: clubsLoading } = useQuery({
        queryKey: ['clubs', 'my'],
        queryFn: () => api.getMyClubs(),
        staleTime: 2 * 60 * 1000,
    });
    const { data: deals, isLoading: dealsLoading } = useQuery({
        queryKey: ['my-deals'],
        queryFn: () => api.getMyDeals(),
        staleTime: 60 * 1000,
    });
    const activeClubs = myClubs?.length ?? 0;
    const activeDeals = deals?.length ?? 0;

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', px: 2, pt: 1.8, pb: 14 }}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography fontSize={31} fontWeight={820} lineHeight={1.02}>
                            Мои
                        </Typography>
                        <Typography fontSize={14} fontWeight={560} color="#77736B">
                            заявки, доступы и сделки
                        </Typography>
                    </Box>
                    <Box sx={{ width: 50, height: 50, borderRadius: '18px', bgcolor: '#111', color: '#fff', display: 'grid', placeItems: 'center' }}>
                        <AccountCircleRoundedIcon sx={{ fontSize: 27 }} />
                    </Box>
                </Box>

                <Card sx={{ bgcolor: '#111', color: '#fff', border: 0, borderRadius: '30px', mb: 1.4 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography fontSize={13} fontWeight={800} color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing={1}>
                            Сейчас
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                            <Metric label="места" value={clubsLoading ? null : activeClubs} />
                            <Metric label="сделки" value={dealsLoading ? null : activeDeals} />
                        </Box>
                    </CardContent>
                </Card>

                <Stack spacing={1}>
                    {hubItems.map(item => (
                        <Card key={item.to} sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '26px' }}>
                            <CardActionArea component={Link} to={item.to} onClick={() => haptic.impact('light')} sx={{ p: 1.45, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Box sx={{ width: 52, height: 52, borderRadius: '18px', bgcolor: item.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                    {item.icon}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography fontSize={16.5} fontWeight={800} lineHeight={1.15}>
                                        {item.title}
                                    </Typography>
                                    <Typography fontSize={13} color="#77736B" fontWeight={560}>
                                        {item.subtitle}
                                    </Typography>
                                </Box>
                                <Chip label="открыть" size="small" sx={{ bgcolor: '#F2F1EC', fontWeight: 750 }} />
                            </CardActionArea>
                        </Card>
                    ))}
                </Stack>

                {!clubsLoading && !dealsLoading && activeClubs === 0 && activeDeals === 0 && (
                    <Box sx={{ mt: 1.2, bgcolor: '#fff', borderRadius: '26px', p: 2, textAlign: 'center' }}>
                        <ReceiptLongRoundedIcon sx={{ fontSize: 42, color: '#B7B1A8', mb: 0.8 }} />
                        <Typography fontSize={18} fontWeight={800}>
                            Пока пусто
                        </Typography>
                        <Typography fontSize={14} color="#77736B" sx={{ mt: 0.4 }}>
                            Когда отправите заявку, создадите предложение или начнете сделку, все появится здесь.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

function Metric({ label, value }: { label: string; value: number | null }) {
    return (
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: '22px', p: 1.4 }}>
            {value === null ? (
                <Skeleton variant="text" width={44} height={34} sx={{ bgcolor: 'rgba(255,255,255,0.18)' }} />
            ) : (
                <Typography fontSize={28} fontWeight={850} lineHeight={1}>
                    {value}
                </Typography>
            )}
            <Typography fontSize={12.5} color="rgba(255,255,255,0.62)" fontWeight={700} sx={{ mt: 0.4 }}>
                {label}
            </Typography>
        </Box>
    );
}

export default MyHubPage;
