import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface BankCardProps {
    bankName: 'Kaspi' | 'Halyk' | 'Other';
    cardNumber?: string;
    holderName?: string;
    expiry?: string;
    balance?: string;
    currency?: string;
    className?: string;
    onCopy?: () => void;
}

export const BankCard: React.FC<BankCardProps> = ({
    bankName,
    cardNumber = '•••• 4242',
    holderName = 'CARD HOLDER',
    expiry = '12/28',
    balance,
    currency = '₸',
    className,
    onCopy,
}) => {
    const haptic = useHaptic();

    const handleCopy = () => {
        haptic.impact('light');
        onCopy?.();
    };

    const bankStyles = {
        Kaspi: {
            bg: 'bg-[#d93025]', // Muted Red
            logo: 'Kaspi.kz',
            text: 'text-white'
        },
        Halyk: {
            bg: 'bg-[#00704a]', // Darker Green
            logo: 'Halyk',
            text: 'text-white'
        },
        Other: {
            bg: 'bg-[#2c2c2e]', // iOS Dark Gray
            logo: 'Bank',
            text: 'text-white'
        }
    };

    const { bg, logo, text } = bankStyles[bankName];

    return (
        <div
            className={cn(
                'relative w-full aspect-[1.58/1] rounded-xl overflow-hidden', // Radius 2xl -> xl (меньше скругление)
                bg,
                text,
                className
            )}
        >
            <div className="relative h-full p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="text-lg font-semibold tracking-tight">
                        {logo}
                    </span>
                    {balance && (
                        <div className="text-right">
                            <div className="text-xl font-bold tracking-tight">
                                {balance} <span className="text-base font-normal opacity-80">{currency}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-mono opacity-90">
                            {cardNumber}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopy();
                            }}
                            className="p-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="flex justify-between items-end text-[11px] font-medium opacity-70 uppercase tracking-wider">
                        <span>{holderName}</span>
                        <span>{expiry}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
