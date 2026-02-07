import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

interface NumPadProps {
    onInput: (value: string) => void;
    onDelete: () => void;
    className?: string;
    maxLength?: number;
    value?: string;
}

export const NumPad: React.FC<NumPadProps> = ({ onInput, onDelete, className, maxLength = 10, value = '' }) => {
    const haptic = useHaptic();
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'delete'];

    const handlePress = (key: string) => {
        haptic.impact('light');
        if (key === 'delete') {
            onDelete();
        } else {
            if (value.length < maxLength) {
                onInput(key);
            }
        }
    };

    return (
        <div className={cn("grid grid-cols-3 gap-y-4 gap-x-6 p-4 mx-auto max-w-[320px]", className)}>
            {keys.map((key) => {
                const isSpecial = key === 'delete' || key === '.';

                return (
                    <div key={key} className="flex items-center justify-center">
                        <button
                            onClick={() => handlePress(key)}
                            className={cn(
                                "flex items-center justify-center",
                                "w-16 h-16 rounded-full",
                                "transition-all active:scale-90 active:bg-[var(--color-bg-tertiary)]",
                                isSpecial
                                    ? "bg-transparent text-[var(--color-text-secondary)]"
                                    : "bg-[var(--color-bg-content)] text-[var(--color-text-primary)] text-3xl font-light shadow-sm"
                            )}
                        >
                            {key === 'delete' ? (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                                    <line x1="18" y1="9" x2="12" y2="15" />
                                    <line x1="12" y1="9" x2="18" y2="15" />
                                </svg>
                            ) : (
                                <span className={key === '.' ? "pb-4 text-3xl" : ""}>
                                    {key}
                                </span>
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
