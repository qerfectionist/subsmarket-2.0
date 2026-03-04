import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { MSIcon } from './MSIcon';

export interface RatingStarsProps {
    value: number;
    maxValue?: number;
    size?: 'sm' | 'md' | 'lg';
    onChange?: (value: number) => void;
    readonly?: boolean;
    showValue?: boolean;
    className?: string;
}

const SIZE_MAP = { sm: 18, md: 24, lg: 32 };

export const RatingStars: React.FC<RatingStarsProps> = ({
    value, maxValue = 5, size = 'md', onChange, readonly = false, showValue = false, className
}) => {
    const haptic = useHaptic();
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const px = SIZE_MAP[size];
    const displayValue = hoverValue ?? value;

    return (
        <div className={cn('flex items-center gap-0.5', className)}>
            {Array.from({ length: maxValue }).map((_, i) => (
                <button
                    key={i}
                    type="button"
                    disabled={readonly}
                    onClick={() => { if (!readonly && onChange) { haptic.impact('light'); onChange(i + 1); } }}
                    onMouseEnter={() => !readonly && setHoverValue(i + 1)}
                    onMouseLeave={() => setHoverValue(null)}
                    className={cn(
                        'transition-transform duration-100',
                        readonly ? 'cursor-default' : 'cursor-pointer active:scale-110'
                    )}
                >
                    <MSIcon
                        name="star"
                        size={px}
                        filled={i < displayValue}
                        className={i < displayValue ? 'text-warning' : 'text-default-300'}
                    />
                </button>
            ))}
            {showValue && (
                <span className={cn(
                    'ml-1.5 font-bold text-foreground',
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base'
                )}>
                    {value.toFixed(1)}
                </span>
            )}
        </div>
    );
};
