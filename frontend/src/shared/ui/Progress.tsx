import { LinearProgress, CircularProgress as MuiCircular, Box, Typography } from '@mui/material';

export interface ProgressProps {
    value: number;
    maxValue?: number;
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    label?: string;
    showValueLabel?: boolean;
    isIndeterminate?: boolean;
    className?: string;
}

const colorMap: Record<string, string> = { default: 'inherit', primary: 'primary', secondary: 'secondary', success: 'success', warning: 'warning', danger: 'error' };
const heightMap = { sm: 4, md: 6, lg: 10 };

export function Progress({ value, maxValue = 100, size = 'md', color = 'primary', label, showValueLabel = false, isIndeterminate = false, className }: ProgressProps) {
    const pct = Math.min(100, (value / maxValue) * 100);
    return (
        <Box className={className} sx={{ width: '100%' }}>
            {(label || showValueLabel) && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    {label && <Typography variant="caption" color="text.secondary">{label}</Typography>}
                    {showValueLabel && <Typography variant="caption" color="text.secondary">{Math.round(pct)}%</Typography>}
                </Box>
            )}
            <LinearProgress
                variant={isIndeterminate ? 'indeterminate' : 'determinate'}
                value={isIndeterminate ? undefined : pct}
                color={colorMap[color] as any}
                sx={{ height: heightMap[size] ?? 6, borderRadius: 99 }}
            />
        </Box>
    );
}

export interface CircularProgressProps {
    value: number;
    maxValue?: number;
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    showValueLabel?: boolean;
    label?: string;
    className?: string;
}

const circleSize = { sm: 32, md: 48, lg: 64 };

export function CircularProgressBar({ value, maxValue = 100, size = 'md', color = 'primary', showValueLabel = true, label, className }: CircularProgressProps) {
    const pct = Math.min(100, (value / maxValue) * 100);
    const px = circleSize[size] ?? 48;
    return (
        <Box className={className} sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <MuiCircular variant="determinate" value={pct} size={px} color={colorMap[color] as any} />
                {showValueLabel && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" fontWeight={700} fontSize={px * 0.22}>{Math.round(pct)}%</Typography>
                    </Box>
                )}
            </Box>
            {label && <Typography variant="caption" color="text.secondary">{label}</Typography>}
        </Box>
    );
}
