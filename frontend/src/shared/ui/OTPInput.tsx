import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
    error?: boolean;
    disabled?: boolean;
    className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
    length = 4,
    value,
    onChange,
    onComplete,
    error,
    disabled,
    className
}) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const haptic = useHaptic();

    const handleChange = (index: number, char: string) => {
        if (disabled) return;
        if (char && !/^\d$/.test(char)) return; // Only digits

        const newValue = value.split('');
        newValue[index] = char;
        const joined = newValue.join('');

        haptic.impact('light');
        onChange(joined.slice(0, length));

        if (char && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (joined.length === length && onComplete) {
            onComplete(joined);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className={cn('flex gap-3 justify-center', className)}>
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    disabled={disabled}
                    className={cn(
                        'w-12 h-14 text-center text-2xl font-bold rounded-xl border transition-all',
                        'bg-[var(--color-bg-content)] text-[var(--color-text-primary)]',
                        'focus:outline-none focus:border-[var(--color-button)] focus:ring-1 focus:ring-[var(--color-button)]/20',
                        error
                            ? 'border-[var(--color-destructive)]'
                            : 'border-[var(--color-separator)]',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                />
            ))}
        </div>
    );
};
