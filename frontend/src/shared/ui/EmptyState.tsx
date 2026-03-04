import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { Button } from '@heroui/react';
import { MSIcon } from './MSIcon';

export interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    onAction?: () => void;
    actionLabel?: string;
    className?: string;
    /** If no icon prop, show this Material Symbol name. Default: 'inbox' */
    iconName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon,
    onAction,
    actionLabel,
    className,
    iconName = 'inbox',
}) => {
    const haptic = useHaptic();

    return (
        <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
            <div className="mb-5 w-20 h-20 rounded-3xl bg-content2 border border-default-100 flex items-center justify-center text-default-400">
                {icon || <MSIcon name={iconName} size={40} filled className="opacity-60" />}
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1.5">{title}</h3>

            {description && (
                <p className="text-sm text-default-500 mb-8 leading-relaxed max-w-[260px]">{description}</p>
            )}

            {onAction && actionLabel && (
                <Button
                    color="primary"
                    variant="flat"
                    onPress={() => { haptic.impact('light'); onAction(); }}
                    endContent={<MSIcon name="chevron_right" size={18} />}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
