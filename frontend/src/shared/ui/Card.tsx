import * as React from 'react';
import { Card as MuiCard, CardActionArea, CardContent } from '@mui/material';
import { triggerHaptic } from '@/shared/lib/utils';

interface CardProps {
    children?: React.ReactNode;
    clickable?: boolean;
    className?: string;
    onClick?: () => void;
    onPress?: () => void;
    style?: React.CSSProperties;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ children, clickable, className, onClick, onPress, style }, ref) => {
        const handleClick = () => {
            if (clickable) triggerHaptic('light');
            onClick?.();
            onPress?.();
        };

        if (clickable || onClick || onPress) {
            return (
                <MuiCard ref={ref} className={className} style={style}>
                    <CardActionArea onClick={handleClick} sx={{ p: 2 }}>
                        {children}
                    </CardActionArea>
                </MuiCard>
            );
        }

        return (
            <MuiCard ref={ref} className={className} style={style}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    {children}
                </CardContent>
            </MuiCard>
        );
    }
);
Card.displayName = 'Card';
