import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface FilterChip {
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
}

export interface FilterChipsProps {
    chips: FilterChip[];
    selected: string[];
    onChange: (selected: string[]) => void;
    multiSelect?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
    chips,
    selected,
    onChange,
    multiSelect = false,
    size = 'md',
    className
}) => {
    const haptic = useHaptic();

    const handleSelect = (chipId: string) => {
        haptic.impact('light');

        if (multiSelect) {
            const newSelected = selected.includes(chipId)
                ? selected.filter(id => id !== chipId)
                : [...selected, chipId];
            onChange(newSelected);
        } else {
            onChange(selected.includes(chipId) ? [] : [chipId]);
        }
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2'
    };

    return (
        <div className={cn(
            'flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1',
            className
        )}>
            {chips.map((chip) => {
                const isSelected = selected.includes(chip.id);

                return (
                    <button
                        key={chip.id}
                        onClick={() => handleSelect(chip.id)}
                        className={cn(
                            'flex-shrink-0 flex items-center rounded-full font-medium',
                            'border transition-all duration-200 active:scale-95',
                            sizes[size],
                            isSelected
                                ? 'bg-[var(--color-button)] border-[var(--color-button)] text-[var(--color-button-text)]'
                                : 'bg-[var(--color-bg-secondary)] border-[var(--color-separator)] text-[var(--color-text-secondary)]'
                        )}
                    >
                        {chip.icon && (
                            <span className={cn(
                                'flex-shrink-0',
                                size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
                            )}>
                                {chip.icon}
                            </span>
                        )}
                        {chip.label}
                        {chip.count !== undefined && (
                            <span className={cn(
                                'rounded-full font-bold',
                                isSelected ? 'bg-white/20' : 'bg-white/10',
                                size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
                            )}>
                                {chip.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
