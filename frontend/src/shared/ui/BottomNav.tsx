import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

function pathToValue(pathname: string): string {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/clubs')) return 'clubs';
    if (pathname.startsWith('/gb-market')) return 'gb';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'home';
}

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const haptic = useHaptic();
    const value = pathToValue(location.pathname);

    const handleChange = (_: React.SyntheticEvent, newValue: string) => {
        const paths: Record<string, string> = {
            home: '/', clubs: '/clubs', gb: '/gb-market', profile: '/profile',
        };
        const targetPath = paths[newValue];
        if (location.pathname === targetPath) return; // Already at the root of the tab

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
                <BottomNavigationAction value="home" label="Главная" icon={<HomeRoundedIcon />} />
                <BottomNavigationAction value="clubs" label="Места" icon={<GridViewRoundedIcon />} />
                <BottomNavigationAction value="gb" label="ГБ" icon={<StorefrontRoundedIcon />} />
                <BottomNavigationAction value="profile" label="Профиль" icon={<PersonRoundedIcon />} />
            </BottomNavigation>
        </Paper>
    );
}
