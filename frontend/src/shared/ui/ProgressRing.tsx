import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    className?: string;
    showValue?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 48,
    strokeWidth = 4,
    className,
    showValue = false,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    const color = progress > 70 ? 'var(--color-button)' : progress > 30 ? '#ffcc00' : '#ff3b30';

    return (
        <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-[var(--color-text-secondary)] opacity-10"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-in-out"
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[var(--color-text-primary)]">
                    {Math.round(progress)}%
                </div>
            )}
        </div>
    );
};
