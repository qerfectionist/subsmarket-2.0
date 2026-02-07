import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface RatingStarsProps {
    value: number;
    maxValue?: number;
    size?: 'sm' | 'md' | 'lg';
    onChange?: (value: number) => void;
    readonly?: boolean;
    showValue?: boolean;
    className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    value,
    maxValue = 5,
    size = 'md',
    onChange,
    readonly = false,
    showValue = false,
    className
}) => {
    const haptic = useHaptic();
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const sizes = {
        sm: 16,
        md: 24,
        lg: 32
    };

    const starSize = sizes[size];
    const displayValue = hoverValue ?? value;

    const handleClick = (starIndex: number) => {
        if (readonly || !onChange) return;
        haptic.impact('light');
        onChange(starIndex + 1);
    };

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {Array.from({ length: maxValue }).map((_, index) => {
                const filled = index < displayValue;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readonly}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => !readonly && setHoverValue(index + 1)}
                        onMouseLeave={() => setHoverValue(null)}
                        className={cn(
                            'relative transition-transform duration-100',
                            !readonly && 'cursor-pointer active:scale-110',
                            readonly && 'cursor-default'
                        )}
                    >
                        <svg
                            width={starSize}
                            height={starSize}
                            viewBox="0 0 24 24"
                            fill={filled ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className={cn(
                                filled ? 'text-[#ffcc00]' : 'text-[var(--color-text-tertiary)]'
                            )}
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </button>
                );
            })}

            {showValue && (
                <span className={cn(
                    'ml-2 font-bold text-[var(--color-text-primary)]',
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
