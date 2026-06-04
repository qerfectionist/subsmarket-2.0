import * as React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { triggerHaptic } from '@/shared/lib/utils';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
    variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    onPress?: (e?: any) => void;
}

const variantMap: Record<string, Pick<MuiButtonProps, 'variant' | 'color'>> = {
    primary: { variant: 'contained', color: 'primary' },
    secondary: { variant: 'contained', color: 'inherit' },
    glass: { variant: 'outlined', color: 'inherit' },
    ghost: { variant: 'text', color: 'inherit' },
    destructive: { variant: 'contained', color: 'error' },
};
const sizeMap: Record<string, MuiButtonProps['size']> = { sm: 'small', md: 'medium', lg: 'large' };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', isLoading, fullWidth, onClick, onPress, children, startIcon, disabled, sx, ...props }, ref) => {
        const muiProps = variantMap[variant] ?? variantMap.primary;
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            triggerHaptic('light');
            onClick?.(e);
            onPress?.(e);
        };
        return (
            <MuiButton
                ref={ref}
                {...muiProps}
                size={sizeMap[size]}
                fullWidth={fullWidth}
                disabled={disabled || isLoading}
                onClick={handleClick}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : startIcon}
                sx={{ textTransform: 'none', fontWeight: 700, ...sx }}
                {...props}
            >
                {children}
            </MuiButton>
        );
    }
);
Button.displayName = 'Button';
