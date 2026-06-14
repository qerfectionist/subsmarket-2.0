import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, Club } from '@/shared/api';
import {
    Box,
    Card,
    CardActionArea,
    Chip,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

type CategoryPageConfig = {
    category: 'digital' | 'telecom';
    title: string;
    subtitle: string;
};

export function SubscriptionsPage() {
    return (
        <CategoryClubsPage
            category="digital"
            title="Семья подписки"
            subtitle="YouTube, Яндекс, Spotify и другие сервисы"
        />
    );
}

export function TariffsPage() {
    return (
        <CategoryClubsPage
            category="telecom"
            title="Семья тарифа"
            subtitle="Activ, Kcell, Beeline и семейные слоты"
        />
    );
}

function CategoryClubsPage({ category, title, subtitle }: CategoryPageConfig) {
    const { data, isLoading } = useQuery({
        queryKey: ['clubs', category],
        queryFn: () => api.getClubs({ category, limit: 30 }),
        staleTime: 2 * 60 * 1000,
    });
    const clubs = data?.items ?? [];

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', px: 2, pt: 2, pb: 14 }}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Typography fontSize={31} fontWeight={840} lineHeight={1.02}>
                    {title}
                </Typography>
                <Typography fontSize={14} fontWeight={560} color="#77736B" sx={{ mt: 0.4, mb: 1.8 }}>
                    {subtitle}
                </Typography>

                <Stack spacing={1}>
                    {isLoading && [1, 2, 3].map(index => <ClubSkeleton key={index} />)}
                    {!isLoading && clubs.length === 0 && (
                        <Box sx={{ bgcolor: '#fff', borderRadius: '28px', p: 3, textAlign: 'center' }}>
                            <Typography fontSize={18} fontWeight={820}>
                                Пока нет свободных мест
                            </Typography>
                            <Typography fontSize={14} color="#77736B" sx={{ mt: 0.6 }}>
                                Когда появятся предложения в этой категории, они будут здесь.
                            </Typography>
                        </Box>
                    )}
                    {!isLoading && clubs.map(club => <ClubRow key={club.club_id} club={club} />)}
                </Stack>
            </Box>
        </Box>
    );
}

function ClubSkeleton() {
    return (
        <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px', p: 1.45 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: '18px' }} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="58%" />
                    <Skeleton variant="text" width="42%" />
                </Box>
            </Box>
        </Card>
    );
}

function ClubRow({ club }: { club: Club }) {
    const spotsLeft = Math.max(0, club.max_members - club.current_members);
    const isTelecom = club.category === 'telecom';
    const Icon = isTelecom ? CellTowerRoundedIcon : GridViewRoundedIcon;

    return (
        <Card sx={{ bgcolor: '#fff', color: '#111', border: 0, borderRadius: '24px' }}>
            <CardActionArea component={Link} to={`/clubs/${club.club_id}`} sx={{ p: 1.45, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '18px', bgcolor: isTelecom ? '#DDF7D4' : '#DCEBFF', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={16} fontWeight={780} lineHeight={1.2} noWrap>
                        {club.subscription.service_name}
                    </Typography>
                    <Typography fontSize={13} color="#77736B" fontWeight={560} noWrap>
                        {spotsLeft > 0 ? `${spotsLeft} мест свободно` : 'мест нет'}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography fontSize={17} fontWeight={820} lineHeight={1.1}>
                        {Math.round(club.price_per_member)} ₸
                    </Typography>
                    <Chip size="small" label={club.status === 'open' ? 'открыто' : club.status} sx={{ mt: 0.7, bgcolor: '#F2F1EC', fontWeight: 700 }} />
                </Box>
            </CardActionArea>
        </Card>
    );
}
