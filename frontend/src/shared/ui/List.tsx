import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { ChevronRight } from 'lucide-react';
import { Box, Typography, Card, Switch } from '@mui/material';

/* ── ListSection ─────────────────────────────────────────────────────── */
interface ListSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    footer?: string;
}

export const ListSection = React.forwardRef<HTMLDivElement, ListSectionProps>(
    ({ className, title, footer, children, ...props }, ref) => (
        <div ref={ref} className={cn('mb-6', className)} {...props}>
            {title && (
                <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 2, pl: 0.5, mb: 1, display: 'block' }}>
                    {title}
                </Typography>
            )}
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {children}
            </Card>
            {footer && (
                <Typography variant="caption" color="text.disabled" sx={{ pl: 0.5, mt: 1, display: 'block', lineHeight: 1.5 }}>
                    {footer}
                </Typography>
            )}
        </div>
    )
);
ListSection.displayName = 'ListSection';

/* ── ListItem ────────────────────────────────────────────────────────── */
interface ListItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onToggle'> {
    icon?: React.ReactNode;
    label: string;
    value?: React.ReactNode;
    subLabel?: string;
    hasArrow?: boolean;
    toggle?: boolean;
    isOn?: boolean;
    onToggle?: (val: boolean) => void;
    destructive?: boolean;
    disabled?: boolean;
    rightElement?: React.ReactNode;
}

export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
    ({ className, icon, label, value, subLabel, hasArrow, toggle, isOn, onToggle, destructive, disabled, onClick, rightElement, ...props }, ref) => {
        const haptic = useHaptic();

        const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (disabled) return;
            if (toggle && onToggle) { haptic.impact('light'); onToggle(!isOn); return; }
            if (onClick) { haptic.selection(); onClick(e); }
        };

        return (
            <Box
                ref={ref}
                className={cn('flex items-center px-4 min-h-[56px] transition-colors', className)}
                sx={{
                    display: 'flex', alignItems: 'center', px: 2, minHeight: 56,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: (onClick || toggle) ? 'pointer' : 'default',
                    opacity: disabled ? 0.5 : 1,
                    pointerEvents: disabled ? 'none' : 'auto',
                    '&:last-child': { borderBottom: 'none' },
                    '&:active': { bgcolor: 'rgba(255,255,255,0.04)' },
                }}
                onClick={handleClick}
                {...props}
            >
                {icon && <Box sx={{ mr: 2, color: 'text.secondary', display: 'flex' }}>{icon}</Box>}

                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, mr: 1 }}>
                        <Typography fontSize={16} fontWeight={500} color={destructive ? 'error.main' : 'text.primary'} noWrap>
                            {label}
                        </Typography>
                        {subLabel && <Typography variant="caption" color="text.secondary" noWrap>{subLabel}</Typography>}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        {value && <Typography variant="body2" color="text.secondary">{value}</Typography>}
                        {rightElement}
                        {hasArrow && <ChevronRight size={18} style={{ opacity: 0.4 }} />}
                        {toggle && (
                            <Switch
                                checked={!!isOn}
                                size="small"
                                color="success"
                                onChange={(_, val) => { haptic.impact('light'); onToggle?.(val); }}
                                onClick={e => e.stopPropagation()}
                            />
                        )}
                    </Box>
                </Box>
            </Box>
        );
    }
);
ListItem.displayName = 'ListItem';
