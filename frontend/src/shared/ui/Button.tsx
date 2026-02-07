import * as React from 'react';
import { Button as HeroButton, ButtonProps as HeroButtonProps } from "@heroui/react";
import { cn, triggerHaptic } from '@/shared/lib/utils';

interface ButtonProps extends Omit<HeroButtonProps, 'variant' | 'color'> {
    variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'destructive' | HeroButtonProps['variant'];
    color?: HeroButtonProps['color'];
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, onPress, onClick, ...props }, ref) => {

        const handlePress = (e: any) => {
            triggerHaptic('light');
            if (onPress) onPress(e);
            if (onClick) onClick(e);
        };

        // Map custom variants to HeroUI props
        let heroVariant: HeroButtonProps['variant'] = 'solid';
        let heroColor: HeroButtonProps['color'] = 'primary';
        let customClass = '';

        switch (variant) {
            case 'primary':
                heroVariant = 'shadow';
                heroColor = 'primary';
                customClass = 'font-semibold';
                break;
            case 'secondary':
                heroVariant = 'flat';
                heroColor = 'default';
                break;
            case 'glass':
                heroVariant = 'bordered';
                customClass = 'bg-white/5 border-white/20 text-white';
                break;
            case 'ghost':
                heroVariant = 'light';
                heroColor = 'default';
                break;
            case 'destructive':
                heroVariant = 'shadow';
                heroColor = 'danger';
                customClass = 'font-semibold';
                break;
            default:
                heroVariant = variant as HeroButtonProps['variant'];
                break;
        }

        return (
            <HeroButton
                ref={ref}
                className={cn(
                    "transition-all duration-200",
                    customClass,
                    className
                )}
                variant={heroVariant}
                color={heroColor}
                size={size}
                onPress={handlePress}
                {...props}
            >
                {children}
            </HeroButton>
        );
    }
);
Button.displayName = 'Button';
