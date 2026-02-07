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
                        onClick={() => {
                            haptic.impact('light');
                            onSelect(op.id);
                        }}
                        className={cn(
                            'relative h-[72px] rounded-2xl overflow-hidden transition-all duration-200',
                            'flex flex-col items-center justify-center gap-1.5 p-2',
                            'active:scale-95',
                            isSelected
                                ? 'bg-white/10 ring-1 ring-white/20'
                                : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-primary)]'
                        )}
                    >
                        {/* Selected Indicator Background */}
                        {isSelected && (
                            <div className="absolute inset-0 bg-white/5 z-0 animate-in fade-in" />
                        )}

                        {/* Glow */}
                        <div
                            className="absolute -bottom-6 -right-6 w-16 h-16 blur-2xl opacity-10 rounded-full"
                            style={{ backgroundColor: op.color }}
                        />

                        {/* Logo Circle */}
                        <div
                            className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] tracking-tighter z-10',
                                isSelected ? 'ring-2 ring-white/20' : ''
                            )}
                            style={{ backgroundColor: `${op.color}22`, color: op.color }}
                        >
                            {op.logo || op.name.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Name */}
                        <span className={cn(
                            'text-xs uppercase font-bold tracking-widest z-10',
                            isSelected ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'
                        )}>
                            {op.name}
                        </span>

                        {/* Check icon */}
                        {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#34c759] flex items-center justify-center shadow-lg z-20 animate-in zoom-in">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
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
