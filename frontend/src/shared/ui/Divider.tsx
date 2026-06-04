import { Divider as MuiDivider, Box, Typography } from '@mui/material';
import { cn } from '@/shared/lib/utils';

export interface DividerProps {
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    label?: string;
}

export function Divider({ className, orientation = 'horizontal', label }: DividerProps) {
    if (label) {
        return (
            <Box className={cn('relative w-full my-4 flex items-center', className)} sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                <MuiDivider sx={{ flex: 1 }} />
                <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ mx: 2, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    {label}
                </Typography>
                <MuiDivider sx={{ flex: 1 }} />
            </Box>
        );
    }

    return (
        <MuiDivider
            orientation={orientation}
            className={className}
            sx={orientation === 'vertical' ? { mx: 1 } : { my: 2 }}
        />
    );
}
