import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface SegmentOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SegmentControlProps {
    options: SegmentOption[];
    value: string;
    onChange: (value: string) => void;
    size?: 'sm' | 'md';
    fullWidth?: boolean;
    className?: string;
}

export const SegmentControl: React.FC<SegmentControlProps> = ({
    options,
    value,
    onChange,
    size = 'md',
    fullWidth = false,
    className,
}) => {
    const haptic = useHaptic();

    const handleChange = (newValue: string) => {
        if (newValue !== value) {
            haptic.selection();
            onChange(newValue);
        }
    };

    const sizes = {
        sm: { container: 'p-0.5 rounded-lg', button: 'px-3 py-1.5 text-xs rounded-md' },
        md: { container: 'p-0.5 rounded-xl', button: 'px-4 py-2 text-sm rounded-lg' },
    };

    const sizeStyles = sizes[size];

    return (
        <div
            role="tablist"
            className={cn(
                'relative inline-flex bg-[var(--color-bg-tertiary)]',
                sizeStyles.container,
                fullWidth && 'w-full',
                className
            )}
        >
            {/* Active Indicator (Absolute) */}
            <div 
                className={cn(
                    'absolute bg-[var(--color-bg-content)] shadow-sm transition-all duration-300 ease-out',
                    size === 'sm' ? 'rounded-md top-0.5 bottom-0.5' : 'rounded-lg top-0.5 bottom-0.5'
                )}
                style={{
                    width: `${100 / options.length}%`,
                    left: `${(options.findIndex(o => o.value === value) * 100) / options.length}%`
                }}
            />

            {options.map((option) => {
                const isSelected = option.value === value;

                return (
                    <button
                        key={option.value}
                        role="tab"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        onClick={() => handleChange(option.value)}
                        className={cn(
                            'relative z-10',
                            'font-semibold transition-colors duration-150',
                            sizeStyles.button,
                            fullWidth && 'flex-1',
                            isSelected
                                ? 'text-[var(--color-text-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                            option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};
