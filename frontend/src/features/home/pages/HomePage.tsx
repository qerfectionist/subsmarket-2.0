import { Link } from 'react-router-dom';
import {
    Avatar,
    Box,
    Card,
    CardActionArea,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';

const scenarioCards = [
    {
        title: 'Семья подписки',
        subtitle: 'YouTube, Яндекс, Spotify',
        to: '/subscriptions',
        icon: <GridViewRoundedIcon />,
        color: '#DCEBFF',
    },
    {
        title: 'Семья тарифа',
        subtitle: 'Activ, Kcell, Beeline',
        to: '/tariffs',
        icon: <CellTowerRoundedIcon />,
        color: '#DDF7D4',
    },
    {
        title: 'Аккаунт',
        subtitle: 'GPT, Canva, Grok',
        to: '/accounts',
        icon: <StorefrontRoundedIcon />,
        color: '#E8DDFF',
    },
    {
        title: 'Гигабайты',
        subtitle: 'купить или продать ГБ',
        to: '/gigabytes',
        icon: <WifiRoundedIcon />,
        color: '#FFECC2',
    },
];

export function HomePage() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

    return (
        <Box sx={{ minHeight: '100dvh', bgcolor: '#F5F4EF', color: '#111', px: 2, pt: 1.6, pb: 14 }}>
            <Box sx={{ maxWidth: 430, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar
                            component={Link}
                            to="/profile"
                            src={user?.photo_url}
                            sx={{ width: 42, height: 42, bgcolor: '#111', color: '#fff', fontWeight: 800, textDecoration: 'none' }}
                        >
                            {(user?.first_name ?? 'S').charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography fontSize={24} fontWeight={820} lineHeight={1.05}>
                                Главная
                            </Typography>
                            <Typography fontSize={13} fontWeight={560} color="#74716A">
                                SubsMarket
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        component={Link}
                        to="/profile?section=settings"
                        aria-label="Настройки"
                        sx={{ width: 42, height: 42, bgcolor: '#fff', color: '#111', '&:hover': { bgcolor: '#fff' } }}
                    >
                        <SettingsRoundedIcon sx={{ fontSize: 21 }} />
                    </IconButton>
                </Box>

                <Card sx={{ bgcolor: '#fff', color: '#111', borderRadius: '28px', border: '0', mb: 1.4 }}>
                    <CardActionArea component={Link} to="/subscriptions" sx={{ p: 1.2 }}>
                        <Box
                            sx={{
                                height: 50,
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

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.6 }}>
                    {scenarioCards.map(card => (
                        <Card key={card.title} sx={{ bgcolor: '#fff', color: '#111', borderRadius: '26px', border: 0 }}>
                            <CardActionArea component={Link} to={card.to} sx={{ p: 1.4, minHeight: 98 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: '16px',
                                            bgcolor: card.color,
                                            display: 'grid',
                                            placeItems: 'center',
                                            color: '#111',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography fontSize={15.5} fontWeight={800} lineHeight={1.15} noWrap>
                                            {card.title}
                                        </Typography>
                                        <Typography fontSize={12.5} fontWeight={560} color="#77736B" noWrap>
                                            {card.subtitle}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>

                <Card sx={{ bgcolor: '#fff', color: '#111', borderRadius: '28px', border: 0, mb: 1.4 }}>
                    <CardActionArea component={Link} to="/requests" sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ width: 46, height: 46, borderRadius: '17px', bgcolor: '#FFECC2', display: 'grid', placeItems: 'center' }}>
                                <AssignmentRoundedIcon sx={{ fontSize: 22 }} />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography fontSize={18} fontWeight={820} lineHeight={1.1}>
                                    Требует действия
                                </Typography>
                                <Typography fontSize={13} fontWeight={560} color="#77736B">
                                    заявки, оплаты и доступы
                                </Typography>
                            </Box>
                            <Typography fontSize={13} fontWeight={800} color="#77736B">
                                0
                            </Typography>
                        </Box>
                    </CardActionArea>
                </Card>

                <Card sx={{ bgcolor: '#111', color: '#fff', borderRadius: '30px', border: 0 }}>
                    <Box sx={{ p: 1.8 }}>
                        <Typography fontSize={18} fontWeight={820} lineHeight={1.1}>
                            Правило сделки
                        </Typography>
                        <Stack spacing={1.1} sx={{ mt: 1.5 }}>
                            <RuleLine text="Сначала доступ или передача ГБ, потом оплата." />
                            <RuleLine text="Платформа не escrow." />
                            <RuleLine text="Чек нужен только для истории сделки." />
                        </Stack>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}

function RuleLine({ text }: { text: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <CheckCircleRoundedIcon sx={{ mt: '1px', fontSize: 18, color: '#B9F27D', flexShrink: 0 }} />
            <Typography fontSize={13.5} fontWeight={560} color="rgba(255,255,255,0.74)" lineHeight={1.35}>
                {text}
            </Typography>
        </Box>
    );
}

export default HomePage;
