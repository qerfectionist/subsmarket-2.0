import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface ActionItemData {
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}

export interface ActionRowProps {
    items: ActionItemData[];
    className?: string;
}

export const ActionRow: React.FC<ActionRowProps> = ({ items, className }) => {
    return (
        <div className={cn('flex justify-around items-center py-4', className)}>
            {items.map((item) => (
                <ActionItem
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    onClick={item.onClick}
                    disabled={item.disabled}
                />
            ))}
        </div>
    );
};

ActionRow.displayName = 'ActionRow';

export interface ActionItemProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'default' | 'primary' | 'ghost';
    className?: string;
}

export const ActionItem: React.FC<ActionItemProps> = ({
    icon,
    label,
    onClick,
    disabled = false,
    variant = 'default',
    className,
}) => {
    const haptic = useHaptic();
    
    const handleClick = () => {
        if (!disabled && onClick) {
            haptic.impact('light');
            onClick();
        }
    };

    const variants: Record<string, string> = {
        default: 'bg-[var(--color-bg-content)]',
        primary: 'bg-[var(--color-button)]',
        ghost: 'bg-transparent',
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={cn(
                'flex flex-col items-center gap-2',
                'transition-transform duration-100',
                'active:scale-95',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <div
                className={cn(
                    'w-12 h-12 flex items-center justify-center rounded-full',
                    'transition-colors duration-150',
                    variants[variant]
                )}
            >
                <span className="w-6 h-6 text-[var(--color-text-primary)]">{icon}</span>
            </div>
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)] uppercase">
                {label}
            </span>
        </button>
    );
};

ActionItem.displayName = 'ActionItem';
