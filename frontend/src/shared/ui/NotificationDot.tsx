import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface NotificationDotProps {
    count?: number;
    max?: number;
    show?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: 'red' | 'blue' | 'green' | 'orange';
    pulse?: boolean;
    className?: string;
    children: React.ReactNode;
}

export const NotificationDot: React.FC<NotificationDotProps> = ({
    count,
    max = 99,
    show = true,
    size = 'md',
    color = 'red',
    pulse = false,
    className,
    children
}) => {
    const displayCount = count !== undefined
        ? count > max ? `${max}+` : count.toString()
        : undefined;

    const showDot = show && (count === undefined || count > 0);

    const sizes = {
        sm: 'min-w-[14px] h-[14px] text-[9px] -top-1 -right-1',
        md: 'min-w-[18px] h-[18px] text-[10px] -top-1.5 -right-1.5',
        lg: 'min-w-[22px] h-[22px] text-[11px] -top-2 -right-2'
    };

    const colors = {
        red: 'bg-[#ff3b30]',
        blue: 'bg-[#007aff]',
        green: 'bg-[#34c759]',
        orange: 'bg-[#ff9500]'
    };

    return (
        <div className={cn('relative inline-flex', className)}>
            {children}

            {showDot && (
                <div
                    className={cn(
                        'absolute flex items-center justify-center',
                        'rounded-full font-bold text-white px-1',
                        'ring-2 ring-[var(--color-bg-primary)]',
                        sizes[size],
                        colors[color],
                        pulse && 'animate-pulse'
                    )}
                >
                    {displayCount}
                </div>
            )}
        </div>
    );
};
