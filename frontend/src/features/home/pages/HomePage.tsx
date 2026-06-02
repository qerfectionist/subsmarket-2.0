import { Link } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActionArea,
    Chip,
    Stack,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CreditScoreRoundedIcon from '@mui/icons-material/CreditScoreRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';

const serviceTiles = [
    { title: 'Подписки', subtitle: 'семейные места', to: '/clubs', icon: GridViewRoundedIcon, color: '#FFE36E' },
    { title: 'ГБ', subtitle: 'трафик и тарифы', to: '/gb-market', icon: WifiRoundedIcon, color: '#B9F27D' },
    { title: 'Доступы', subtitle: 'инвайты и аккаунты', to: '/accounts', icon: StorefrontRoundedIcon, color: '#D8C7FF' },
    { title: 'Сделки', subtitle: 'чек и статус', to: '/deals', icon: ShieldRoundedIcon, color: '#BFE7FF' },
];

const liveOffers = [
    { title: 'YouTube Premium', meta: '2 места в семье', price: '700 ₸', to: '/clubs?type=digital' },
    { title: 'Beeline / Tele2', meta: 'ГБ и семейные тарифы', price: 'от 500 ₸', to: '/gb-market' },
    { title: 'Яндекс Плюс', meta: '1 место · актуально', price: '900 ₸', to: '/clubs?type=digital' },
];

export function HomePage() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

    return (
        <Box sx={{ bgcolor: '#F5F4EF', color: '#111', px: 2, pt: 1.6, pb: 2 }}>
            <Box sx={{ maxWidth: 430, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar src={user?.photo_url} sx={{ width: 38, height: 38, bgcolor: '#111', color: '#fff', fontWeight: 700 }}>
                            {(user?.first_name ?? 'S').charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography fontSize={17} fontWeight={760} lineHeight={1.05}>
                                SubsMarket
                            </Typography>
                            <Typography fontSize={12.5} fontWeight={520} color="#74716A">
                                подписки, тарифы, ГБ
                            </Typography>
                        </Box>
                    </Box>
                    <Chip label="KZ" sx={{ height: 34, bgcolor: '#fff', color: '#111', fontWeight: 650 }} />
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
                                Найти YouTube, Яндекс, Beeline...
                            </Typography>
                        </Box>
                    </CardActionArea>
                </Card>

                <Card sx={{ bgcolor: '#FFE15A', color: '#111', borderRadius: '32px', border: 0, mb: 1.4 }}>
                    <CardActionArea component={Link} to="/clubs" sx={{ p: 2.2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: 30, lineHeight: 1.04, fontWeight: 760, letterSpacing: 0, mb: 1 }}>
                                    Свободные места без хаоса в чате
                                </Typography>
                                <Typography fontSize={15} lineHeight={1.42} fontWeight={520} color="rgba(0,0,0,0.58)">
                                    Цена, условия и продавец сразу видны в карточке.
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

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontSize={21} fontWeight={760} lineHeight={1.15}>
                        Сейчас в маркете
                    </Typography>
                    <Button component={Link} to="/clubs" endIcon={<ArrowForwardRoundedIcon />} sx={{ color: '#111', px: 1 }}>
                        Все
                    </Button>
                </Box>

                <Stack spacing={1}>
                    {liveOffers.map((item, index) => (
                        <Card key={item.title} sx={{ bgcolor: '#fff', color: '#111', borderRadius: '24px', border: 0 }}>
                            <CardActionArea component={Link} to={item.to} sx={{ p: 1.45, display: 'flex', alignItems: 'center', gap: 1.25 }}>
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
                                    {index === 1 ? <WifiRoundedIcon sx={{ fontSize: 21 }} /> : <CreditScoreRoundedIcon sx={{ fontSize: 21 }} />}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography fontSize={15.5} fontWeight={720} lineHeight={1.2} noWrap>
                                        {item.title}
                                    </Typography>
                                    <Typography fontSize={12.5} fontWeight={520} color="#77736B" noWrap>
                                        {item.meta}
                                    </Typography>
                                </Box>
                                <Typography fontSize={15} fontWeight={760}>
                                    {item.price}
                                </Typography>
                            </CardActionArea>
                        </Card>
                    ))}
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1.2 }}>
                    <Button
                        component={Link}
                        to="/clubs/create"
                        size="large"
                        startIcon={<AddRoundedIcon />}
                        sx={{ bgcolor: '#111', color: '#fff', '&:hover': { bgcolor: '#222' } }}
                    >
                        Создать
                    </Button>
                    <Button
                        component={Link}
                        to="/tools/receipt-analyzer"
                        size="large"
                        startIcon={<ReceiptLongRoundedIcon />}
                        sx={{ bgcolor: '#fff', color: '#111', '&:hover': { bgcolor: '#fff' } }}
                    >
                        Чек
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default HomePage;
