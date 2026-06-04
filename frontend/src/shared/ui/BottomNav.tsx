import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { preloadTab } from '@/app/routePreload';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';

function pathToValue(pathname: string): string {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/clubs')) return 'market';
    if (pathname.startsWith('/accounts')) return 'market';
    if (pathname.startsWith('/gb-market')) return 'gb';
    if (pathname.startsWith('/deals')) return 'deals';
    if (pathname.startsWith('/profile')) return '';
    return 'home';
}

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const value = pathToValue(location.pathname);
    const navItems = [
        { value: 'home', label: 'Главная', icon: <HomeRoundedIcon /> },
        { value: 'market', label: 'Маркет', icon: <GridViewRoundedIcon /> },
        { value: 'gb', label: 'ГБ', icon: <StorefrontRoundedIcon /> },
        { value: 'deals', label: 'Сделки', icon: <ReceiptLongRoundedIcon /> },
    ];

    const handleChange = (_: React.SyntheticEvent, newValue: string) => {
        const paths: Record<string, string> = {
            home: '/',
            market: '/clubs',
            gb: '/gb-market',
            deals: '/deals',
        };
        const targetPath = paths[newValue];
        if (location.pathname === targetPath) return;

        haptic.selection();
        navigate(targetPath);
    };

    return (
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
                overflow: 'hidden',
                backgroundImage: 'none',
                border: '1px solid rgba(17,17,17,0.06)',
                bgcolor: 'rgba(255,255,255,0.94)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 10px 34px rgba(0,0,0,0.12)',
            }}
            elevation={0}
        >
            <BottomNavigation value={value} onChange={handleChange} showLabels>
                {navItems.map(item => (
                    <BottomNavigationAction
                        key={item.value}
                        value={item.value}
                        label={item.label}
                        icon={item.icon}
                        onMouseEnter={() => preloadTab(item.value)}
                        onTouchStart={() => preloadTab(item.value)}
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
}
