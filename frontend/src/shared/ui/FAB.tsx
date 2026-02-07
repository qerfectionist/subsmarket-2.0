import * as React from 'react';
import { cn, triggerHaptic } from '@/shared/lib/utils';
import { Plus } from 'lucide-react';

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
    label?: string;
    size?: 'md' | 'lg';
    position?: 'bottom-right' | 'bottom-center';
}

export const FAB: React.FC<FABProps> = ({
    icon,
    label,
    size = 'lg',
    position = 'bottom-right',
    className,
    onClick,
    ...props
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        triggerHaptic('medium');
        onClick?.(e);
    };

    const positions = {
        'bottom-right': 'fixed bottom-24 right-4',
        'bottom-center': 'fixed bottom-24 left-1/2 -translate-x-1/2'
    };

    return (
        <div className={cn(positions[position], 'z-40')}>
            <button
                onClick={handleClick}
                className={cn(
                    'flex items-center justify-center gap-2',
                    'rounded-full shadow-[0_8px_30px_rgba(124,58,237,0.5)]', // Purple Glow
                    'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white', // Vivid Gradient
                    'transition-transform duration-200 active:scale-90 hover:scale-105',
                    size === 'md' ? 'w-12 h-12' : 'w-16 h-16',
                    className
                )}
                {...props}
            >
                {icon || <Plus size={28} strokeWidth={2.5} />}
            </button>
        </div>
    );
};

export const FABPlusIcon = () => (
    <Plus size={24} />
);
