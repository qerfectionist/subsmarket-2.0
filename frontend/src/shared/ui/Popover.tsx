import * as React from 'react';
import { Popover as MuiPopover, Tooltip as MuiTooltip } from '@mui/material';

export interface PopoverProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
    showArrow?: boolean;
    offset?: number;
    className?: string;
}

export function Popover({ trigger, children, className }: PopoverProps) {
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    return (
        <>
            {React.cloneElement(trigger as React.ReactElement<any>, {
                onClick: (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget),
            })}
            <MuiPopover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                slotProps={{ paper: { sx: { bgcolor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, p: 1.5 } } }}
                className={className}
            >
                {children}
            </MuiPopover>
        </>
    );
}

export interface TooltipProps {
    content: string;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
    return (
        <MuiTooltip title={content} placement={placement} arrow>
            <span>{children}</span>
        </MuiTooltip>
    );
}
