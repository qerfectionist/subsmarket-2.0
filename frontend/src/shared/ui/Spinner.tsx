import { CircularProgress, Box, Typography } from '@mui/material';

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    label?: string;
    className?: string;
}

const sizePx = { sm: 20, md: 32, lg: 48 };
const colorMap: Record<string, string> = { default: 'inherit', primary: 'primary', secondary: 'secondary', success: 'success', warning: 'warning', danger: 'error' };

export function Spinner({ size = 'md', color = 'primary', label, className }: SpinnerProps) {
    return (
        <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 1 }} className={className}>
            <CircularProgress size={sizePx[size] ?? 32} color={colorMap[color] as any} />
            {label && <Typography variant="caption" color="text.secondary">{label}</Typography>}
        </Box>
    );
}

export function LoadingScreen({ label = 'Загрузка...' }: { label?: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <Spinner size="lg" label={label} />
        </Box>
    );
}
