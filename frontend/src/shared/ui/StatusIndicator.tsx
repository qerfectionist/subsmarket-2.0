import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type StatusType = 'online' | 'offline' | 'away' | 'busy' | 'invisible';

export interface StatusIndicatorProps {
    status: StatusType;
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    showLabel?: boolean;
    className?: string;
}

const statusColors: Record<StatusType, string> = {
    online: 'bg-[#22c55e]',
    offline: 'bg-[#6b7280]',
    away: 'bg-[#eab308]',
    busy: 'bg-[#ef4444]',
    invisible: 'bg-transparent border-2 border-[var(--color-text-tertiary)]'
};

const statusLabels: Record<StatusType, string> = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    busy: 'Do not disturb',
    invisible: 'Invisible'
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    size = 'md',
    pulse = false,
    showLabel = false,
    className
}) => {
    const sizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="relative inline-flex">
                <span className={cn(
                    'rounded-full',
                    sizes[size],
                    statusColors[status]
                )} />
                {pulse && status === 'online' && (
                    <span className={cn(
                        'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                        statusColors[status]
                    )} />
                )}
            </span>
            {showLabel && (
                <span className="text-sm text-[var(--color-text-secondary)]">
                    {statusLabels[status]}
                </span>
            )}
        </div>
    );
};
