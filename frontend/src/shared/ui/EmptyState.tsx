import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    onAction?: () => void;
    actionLabel?: string;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon,
    onAction,
    actionLabel,
    className,
}) => {
    const haptic = useHaptic();

    return (
        <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
            <div className="mb-6">
                {icon ? (
                    <div className="text-[var(--color-text-secondary)] opacity-20">
                        {icon}
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-[var(--color-bg-content)] rounded-3xl flex items-center justify-center text-[var(--color-text-tertiary)] border border-[var(--color-separator)]">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed max-w-[260px]">
                    {description}
                </p>
            )}

            {onAction && actionLabel && (
                <button
                    onClick={() => {
                        haptic.impact('light');
                        onAction();
                    }}
                    className={cn(
                        'px-8 py-3.5 bg-[var(--color-button)] text-[var(--color-button-text)] font-bold rounded-2xl',
                        'transition-all active:opacity-80 active:scale-95'
                    )}
                >
                    <span className="flex items-center gap-2">
                        {actionLabel}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </button>
            )}
        </div>
    );
};
