import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface Operator {
    id: string;
    name: string;
    color: string;
    logo?: React.ReactNode;
}

export interface OperatorSelectProps {
    operators: Operator[];
    selectedId?: string;
    onSelect: (id: string) => void;
    className?: string;
}

export const OperatorSelect: React.FC<OperatorSelectProps> = ({
    operators,
    selectedId,
    onSelect,
    className
}) => {
    const haptic = useHaptic();

    return (
        <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
            {operators.map((op) => {
                const isSelected = selectedId === op.id;
                return (
                    <button
                        key={op.id}
                        type="button"
                        onClick={() => {
                            haptic.impact('light');
                            onSelect(op.id);
                        }}
                        className={cn(
                            'relative h-16 rounded-xl transition-all duration-200',
                            'flex items-center justify-start px-4 gap-3 border outline-none',
                            'active:scale-95',
                            isSelected
                                ? 'bg-primary/10 border-primary shadow-sm'
                                : 'bg-content1 border-default-200 hover:bg-default-100 text-default-500'
                        )}
                    >
                        {/* Logo Circle */}
                        <div
                            className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                                isSelected ? 'bg-background shadow-sm' : 'bg-default-100 grayscale opacity-70'
                            )}
                            style={isSelected ? { color: op.color } : undefined}
                        >
                            {op.logo || op.name.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Name */}
                        <span className={cn(
                            'text-sm font-semibold truncate',
                            isSelected ? 'text-primary' : 'text-default-600'
                        )}>
                            {op.name}
                        </span>

                        {/* Check icon */}
                        {isSelected && (
                            <div className="absolute right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground animate-in zoom-in">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
