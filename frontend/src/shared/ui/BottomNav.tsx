import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { preloadTab } from '@/app/routePreload';
import { Box, Drawer, Paper, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CellTowerRoundedIcon from '@mui/icons-material/CellTowerRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';

function pathToValue(pathname: string): string {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/my')) return 'my';
    if (pathname.startsWith('/requests')) return 'requests';
    return '';
}

const createActions = [
    {
        label: 'Семейная подписка',
        subtitle: 'YouTube, Яндекс, Spotify',
        to: '/clubs/create/subscription',
        icon: <GridViewRoundedIcon />,
        color: '#FFE15A',
        preload: 'subscriptions',
    },
    {
        label: 'Семейный тариф',
        subtitle: 'Activ, Kcell, Beeline',
        to: '/clubs/create/tariff',
        icon: <CellTowerRoundedIcon />,
        color: '#B9F27D',
        preload: 'tariffs',
    },
    {
        label: 'Продать ГБ',
        subtitle: 'лишние гигабайты',
        to: '/gigabytes?tab=sell',
        icon: <WifiRoundedIcon />,
        color: '#BFE7FF',
        preload: 'gigabytes',
    },
    {
        label: 'Продать аккаунт',
        subtitle: 'GPT, Canva, Grok',
        to: '/accounts?tab=create',
        icon: <StorefrontRoundedIcon />,
        color: '#D8C7FF',
        preload: 'accounts',
    },
];

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const [createOpen, setCreateOpen] = useState(false);
    const value = pathToValue(location.pathname);

    const navItems = [
        { value: 'home', label: 'Главная', icon: <HomeRoundedIcon />, to: '/', preload: 'home' },
        { value: 'my', label: 'Мои', icon: <Inventory2RoundedIcon />, to: '/my', preload: 'my' },
        { value: 'requests', label: 'Заявки', icon: <AssignmentRoundedIcon />, to: '/requests', preload: 'requests' },
    ];

    const go = (to: string) => {
        if (location.pathname + location.search === to) return;
        haptic.selection();
        navigate(to);
    };

    const openCreate = () => {
        haptic.impact('medium');
        setCreateOpen(true);
    };

    const chooseCreate = (to: string) => {
        haptic.selection();
        setCreateOpen(false);
        navigate(to);
    };

    return (
        <>
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 'calc(12px + env(safe-area-inset-bottom))',
                    left: 16,
                    right: 16,
                    zIndex: 100,
                    maxWidth: 420,
                    mx: 'auto',
                    borderRadius: 999,
                    backgroundImage: 'none',
                    border: '1px solid rgba(17,17,17,0.06)',
                    bgcolor: 'rgba(255,255,255,0.94)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 34px rgba(0,0,0,0.12)',
                    px: 1.2,
                    py: 0.8,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 76px 1fr',
                    alignItems: 'center',
                    gap: 0.25,
                }}
                elevation={0}
            >
                {navItems.slice(0, 2).map(item => (
                    <NavButton
                        key={item.value}
                        active={value === item.value}
                        label={item.label}
                        icon={item.icon}
                        onClick={() => go(item.to)}
                        onWarm={() => preloadTab(item.preload)}
                    />
                ))}

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box
                        component="button"
                        type="button"
                        aria-label="Создать"
                        onClick={openCreate}
                        onMouseEnter={() => createActions.forEach(action => preloadTab(action.preload))}
                        onTouchStart={() => createActions.forEach(action => preloadTab(action.preload))}
                        style={{
                            width: 58,
                            height: 58,
                            border: 0,
                            borderRadius: 22,
                            background: '#111',
                            color: '#fff',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 10px 24px rgba(0,0,0,0.22)',
                            cursor: 'pointer',
                        }}
                    >
                        <AddRoundedIcon sx={{ fontSize: 30 }} />
                    </Box>
                </Box>

                <NavButton
                    active={value === 'requests'}
                    label="Заявки"
                    icon={<AssignmentRoundedIcon />}
                    onClick={() => go('/requests')}
                    onWarm={() => preloadTab('requests')}
                />
            </Paper>

            <Drawer
                anchor="bottom"
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                PaperProps={{
                    sx: {
                        maxWidth: 430,
                        mx: 'auto',
                        width: '100%',
                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,
                        bgcolor: '#F5F4EF',
                        px: 2,
                        pt: 1.2,
                        pb: 'calc(18px + env(safe-area-inset-bottom))',
                    },
                }}
            >
                <Box sx={{ width: 46, height: 5, borderRadius: 999, bgcolor: '#D7D3CA', mx: 'auto', mb: 1.6 }} />
                <Typography fontSize={22} fontWeight={800} lineHeight={1.1} sx={{ mb: 0.5 }}>
                    Что создать?
                </Typography>
                <Typography fontSize={14} fontWeight={560} color="#77736B" sx={{ mb: 1.6 }}>
                    Выберите тип предложения. Категории не смешиваются.
                </Typography>

                <Box sx={{ display: 'grid', gap: 1 }}>
                    {createActions.map(action => (
                        <Box
                            key={action.to}
                            component="button"
                            type="button"
                            onClick={() => chooseCreate(action.to)}
                            onMouseEnter={() => preloadTab(action.preload)}
                            onTouchStart={() => preloadTab(action.preload)}
                            sx={{
                                border: 0,
                                bgcolor: '#fff',
                                color: '#111',
                                borderRadius: '24px',
                                p: 1.25,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.2,
                                textAlign: 'left',
                                cursor: 'pointer',
                            }}
                        >
                            <Box sx={{ width: 46, height: 46, borderRadius: '17px', bgcolor: action.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                {action.icon}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography fontSize={16} fontWeight={800} lineHeight={1.1}>
                                    {action.label}
                                </Typography>
                                <Typography fontSize={13} color="#77736B" fontWeight={560}>
                                    {action.subtitle}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Drawer>
        </>
    );
}

function NavButton({
    active,
    label,
    icon,
    onClick,
    onWarm,
}: {
    active: boolean;
    label: string;
    icon: ReactNode;
    onClick: () => void;
    onWarm: () => void;
}) {
    return (
        <Box
            component="button"
            type="button"
            onClick={onClick}
            onMouseEnter={onWarm}
            onTouchStart={onWarm}
            sx={{
                minWidth: 0,
                border: 0,
                bgcolor: 'transparent',
                color: active ? '#111' : '#999690',
                height: 58,
                borderRadius: 22,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                px: 0.25,
            }}
        >
            <Box sx={{ display: 'grid', placeItems: 'center', '& svg': { fontSize: 25 } }}>
                {icon}
            </Box>
            <Typography fontSize={11.2} fontWeight={active ? 850 : 720} lineHeight={1}>
                {label}
            </Typography>
        </Box>
    );
}
