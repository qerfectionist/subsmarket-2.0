import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface PriceTagProps {
    amount: number;
    currency?: string;
    period?: 'month' | 'year' | 'week' | 'one-time';
    originalAmount?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    label?: string;
    icon?: React.ReactNode;
    showAmount?: boolean;
    discount?: number;
}

const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    RUB: '₽',
    KZT: '₸',
    TON: '',
};

const periodLabels: Record<string, string> = {
    month: '/mo',
    year: '/yr',
    week: '/wk',
    'one-time': '',
};

export const PriceTag: React.FC<PriceTagProps> = ({
    amount,
    currency = 'KZT',
    period = 'month',
    originalAmount,
    size = 'md',
    className,
    label,
    icon,
    showAmount = true,
    discount
}) => {
    const symbol = currencySymbols[currency] || (currency === 'TON' ? '' : currency);
    const isTon = currency === 'TON';
    const periodLabel = periodLabels[period] || '';
    const hasDiscount = originalAmount && originalAmount > amount;
    const discountPercent = discount || (hasDiscount
        ? Math.round(((originalAmount - amount) / originalAmount) * 100)
        : 0);

    return (
        <div className={cn('flex flex-col items-end gap-1', className)}>
            <div className="flex items-center gap-2">
                {icon ? (
                    <div className="flex items-center justify-center text-[#007aff]">
                        {icon}
                    </div>
                ) : isTon && (
                    <div className="w-5 h-5 flex items-center justify-center bg-[#0098EA]/15 rounded-full text-[#0098EA]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                )}
                <div className="flex items-baseline gap-1">
                    {label ? (
                        <span className={cn(
                            'font-bold text-[var(--color-text-primary)] tracking-tight',
                            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl'
                        )}>
                            {label}
                        </span>
                    ) : showAmount && (
                        <span className={cn(
                            'font-bold text-[var(--color-text-primary)] tracking-tight',
                            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl'
                        )}>
                            {symbol}{amount.toLocaleString()}
                        </span>
                    )}
                    {periodLabel && showAmount && !label && (
                        <span className="text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">
                            {periodLabel.replace('/', '')}
                        </span>
                    )}
                </div>
            </div>

            {(hasDiscount || (discountPercent && discountPercent > 0)) && (
                <div className="flex items-center gap-2">
                    {hasDiscount && (
                        <span className="text-xs text-[var(--color-text-tertiary)] line-through">
                            {symbol}{originalAmount?.toLocaleString()}
                        </span>
                    )}
                    {discountPercent && discountPercent > 0 && (
                        <span className="text-xs font-bold text-[#34c759] bg-[#34c759]/10 px-1.5 py-0.5 rounded-md">
                            -{discountPercent}%
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

// Compact inline price
export interface InlinePriceProps {
    amount: number;
    currency?: string;
    className?: string;
}

export const InlinePrice: React.FC<InlinePriceProps> = ({
    amount,
    currency = 'KZT',
    className
}) => {
    const symbol = currencySymbols[currency] || (currency === 'TON' ? '' : currency);

    return (
        <span className={cn('font-semibold text-[var(--color-text-primary)] flex items-center gap-1', className)}>
            {currency === 'TON' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#0098EA]">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
            )}
            {symbol}{amount.toLocaleString()}
        </span>
    );
};
