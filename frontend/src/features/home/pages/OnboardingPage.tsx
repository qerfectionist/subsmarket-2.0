import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Button,
    Chip,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';

const slides = [
    {
        eyebrow: 'Маркет вместо чата',
        title: 'Свободные места рядом',
        body: 'YouTube, Яндекс, тарифы и ГБ в одном маркете. Без скролла чата, дублей и повторных вопросов.',
        stat: '24',
        statLabel: 'предложения сейчас',
    },
    {
        eyebrow: 'Сделка в карточке',
        title: 'Условия сразу в сделке',
        body: 'Цена, срок, чек и статус оплаты фиксируются в карточке. Оба участника видят одно и то же.',
        stat: '3',
        statLabel: 'шага до сделки',
    },
    {
        eyebrow: 'Доверие видно',
        title: 'Проверяй перед оплатой',
        body: 'Рейтинг, жалобы и история сделок помогают отсеять неактуальные объявления до перевода.',
        stat: '5.0',
        statLabel: 'рейтинг профиля',
    },
];

const previewItems = [
    { title: 'YouTube Premium', meta: '2 места в семье', price: '700 ₸', tag: 'проверено' },
    { title: 'Beeline / Tele2', meta: 'ГБ и семейные тарифы', price: 'от 500 ₸', tag: 'сегодня' },
    { title: 'Яндекс Плюс', meta: '1 свободное место', price: '900 ₸', tag: 'чек' },
];

export function OnboardingPage() {
    const [step, setStep] = useState(0);
    const slide = slides[step];
    const isLast = step === slides.length - 1;

    const progress = useMemo(() => ((step + 1) / slides.length) * 100, [step]);

    return (
        <Box
            sx={{
                minHeight: '100dvh',
                bgcolor: '#000',
                color: '#fff',
                px: 2,
                pt: 1.5,
                pb: 'calc(20px + env(safe-area-inset-bottom))',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 430,
                    minHeight: 'calc(100dvh - 36px)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography fontSize={18} fontWeight={900} lineHeight={1}>
                            SubsMarket
                        </Typography>
                        <Typography fontSize={12} fontWeight={700} color="rgba(255,255,255,0.48)">
                            Telegram mini app
                        </Typography>
                    </Box>
                    <Button component={Link} to="/clubs" variant="text" sx={{ color: 'rgba(255,255,255,0.58)', px: 1.5 }}>
                        Пропустить
                    </Button>
                </Box>

                <Box
                    sx={{
                        position: 'relative',
                        flex: 1,
                        minHeight: 380,
                        borderRadius: '30px',
                        overflow: 'hidden',
                        bgcolor: '#080808',
                        border: '1px solid rgba(255,255,255,0.06)',
                        px: 2.4,
                        pt: 2,
                        pb: 2.2,
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                'radial-gradient(circle at 50% 4%, rgba(255,255,255,0.18), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.04), transparent 38%)',
                            pointerEvents: 'none',
                        }}
                    />

                    <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                            <Chip
                                label={slide.eyebrow}
                                sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', height: 34 }}
                            />
                            <Box sx={{ flex: 1, height: 6, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                                <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: '#fff', borderRadius: 999, transition: 'width 240ms ease' }} />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'grid', gap: 1.35, mb: 3 }}>
                            <Typography
                                component="h1"
                                sx={{
                                    fontSize: { xs: 36, sm: 42 },
                                    lineHeight: 0.98,
                                    fontWeight: 950,
                                    letterSpacing: 0,
                                    maxWidth: 340,
                                }}
                            >
                                {slide.title}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.58)', fontSize: 15.5, lineHeight: 1.42, fontWeight: 650 }}>
                                {slide.body}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                width: 136,
                                height: 136,
                                mx: 'auto',
                                my: 1,
                                borderRadius: '50%',
                                bgcolor: '#fff',
                                color: '#000',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 24px 70px rgba(255,255,255,0.14)',
                            }}
                        >
                            <Typography sx={{ fontSize: 43, fontWeight: 950, lineHeight: 1 }}>{slide.stat}</Typography>
                            <Typography sx={{ fontSize: 11, fontWeight: 850, color: 'rgba(0,0,0,0.5)', textAlign: 'center', px: 2 }}>
                                {slide.statLabel}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 'auto' }}>
                            <Stack spacing={1.05}>
                                {previewItems.map((item, index) => (
                                    <PreviewRow key={item.title} item={item} active={index === step} />
                                ))}
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ pt: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 1.5 }}>
                        <QuickPill icon={<SearchRoundedIcon />} label="Найти место" />
                        <QuickPill icon={<WifiRoundedIcon />} label="Купить ГБ" />
                        <QuickPill icon={<ShieldRoundedIcon />} label="Сделка" />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box sx={{ display: 'flex', gap: 0.75, px: 0.5 }}>
                            {slides.map((item, index) => (
                                <Box
                                    key={item.title}
                                    sx={{
                                        width: index === step ? 22 : 7,
                                        height: 7,
                                        borderRadius: 999,
                                        bgcolor: index === step ? '#fff' : 'rgba(255,255,255,0.22)',
                                        transition: 'all 180ms ease',
                                    }}
                                />
                            ))}
                        </Box>

                        <Button
                            component={isLast ? Link : 'button'}
                            to={isLast ? '/clubs' : undefined}
                            onClick={isLast ? undefined : () => setStep(current => Math.min(current + 1, slides.length - 1))}
                            fullWidth
                            size="large"
                            endIcon={isLast ? <ArrowForwardRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
                            sx={{ bgcolor: '#fff', color: '#000', '&:hover': { bgcolor: '#f2f2f2' } }}
                        >
                            {isLast ? 'Открыть маркет' : 'Дальше'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function PreviewRow({
    item,
    active,
}: {
    item: (typeof previewItems)[number];
    active: boolean;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                p: 1.25,
                borderRadius: '22px',
                bgcolor: active ? '#fff' : 'rgba(255,255,255,0.08)',
                color: active ? '#000' : '#fff',
                transform: active ? 'scale(1)' : 'scale(0.985)',
                transition: 'all 220ms ease',
            }}
        >
            <Box
                sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    bgcolor: active ? '#000' : 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                }}
            >
                {active ? <CheckRoundedIcon sx={{ fontSize: 19 }} /> : <VerifiedRoundedIcon sx={{ fontSize: 18 }} />}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography fontSize={14.5} fontWeight={900} noWrap>
                    {item.title}
                </Typography>
                <Typography fontSize={12} fontWeight={750} color={active ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.48)'} noWrap>
                    {item.meta}
                </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Typography fontSize={14} fontWeight={950}>
                    {item.price}
                </Typography>
                <Typography fontSize={10.5} fontWeight={850} color={active ? 'rgba(0,0,0,0.42)' : 'rgba(255,255,255,0.4)'}>
                    {item.tag}
                </Typography>
            </Box>
        </Box>
    );
}

function QuickPill({ icon, label }: { icon: ReactNode; label: string }) {
    return (
        <Box
            sx={{
                height: 54,
                borderRadius: '20px',
                bgcolor: '#101010',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.25,
            }}
        >
            <IconButton size="small" sx={{ color: '#fff', p: 0, width: 20, height: 20 }}>
                {icon}
            </IconButton>
            <Typography fontSize={11} fontWeight={850} color="rgba(255,255,255,0.68)" noWrap>
                {label}
            </Typography>
        </Box>
    );
}

export default OnboardingPage;
