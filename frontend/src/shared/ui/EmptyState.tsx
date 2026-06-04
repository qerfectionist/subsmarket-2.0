import * as React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { MSIcon } from './MSIcon';

export interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    onAction?: () => void;
    actionLabel?: string;
    className?: string;
    iconName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title, description, icon, onAction, actionLabel, className, iconName = 'inbox',
}) => {
    const haptic = useHaptic();
    return (
        <Box
            className={className}
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6, textAlign: 'center' }}
        >
            <Box sx={{ mb: 2.5, width: 80, height: 80, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
                {icon || <MSIcon name={iconName} size={40} filled className="opacity-60" />}
            </Box>
            <Typography fontWeight={800} fontSize={17} mb={0.75}>{title}</Typography>
            {description && (
                <Typography variant="body2" color="text.secondary" mb={3} sx={{ lineHeight: 1.6, maxWidth: 260 }}>{description}</Typography>
            )}
            {onAction && actionLabel && (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => { haptic.impact('light'); onAction(); }}
                    sx={{ fontWeight: 700, borderRadius: 3 }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
};
