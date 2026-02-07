import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface InlineNotificationProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    dismissible?: boolean;
    onDismiss?: () => void;
    className?: string;
}

export const InlineNotification: React.FC<InlineNotificationProps> = ({
    type = 'info',
    title,
    message,
    icon,
    action,
    dismissible = false,
    onDismiss,
    className
}) => {
    const [visible, setVisible] = React.useState(true);

    const handleDismiss = () => {
        setVisible(false);
        onDismiss?.();
    };

    if (!visible) return null;

    const styles = {
        info: { border: 'border-[#007aff]/30', bg: 'bg-[#007aff]/10', iconColor: 'text-[#007aff]' },
        success: { border: 'border-[#34c759]/30', bg: 'bg-[#34c759]/10', iconColor: 'text-[#34c759]' },
        warning: { border: 'border-[#ffcc00]/30', bg: 'bg-[#ffcc00]/10', iconColor: 'text-[#ffcc00]' },
        error: { border: 'border-[#ff3b30]/30', bg: 'bg-[#ff3b30]/10', iconColor: 'text-[#ff3b30]' },
    };

    const style = styles[type];

    return (
        <div
            className={cn(
                'border rounded-2xl p-4 flex gap-4 items-start',
                style.bg,
                style.border,
                className
            )}
        >
            <div className={cn('mt-0.5 flex-shrink-0', style.iconColor)}>
                {icon || (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                )}
            </div>

            <div className="flex-1 min-w-0">
                {title && (
                    <h4 className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-tight mb-0.5">
                        {title}
                    </h4>
                )}
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-snug">
                    {message}
                </p>
                {action && (
                    <button
                        onClick={action.onClick}
                        className="mt-2 text-[13px] font-semibold text-[var(--color-text-primary)] active:opacity-60 transition-opacity flex items-center gap-0.5"
                    >
                        {action.label}
                        <span className="opacity-50">›</span>
                    </button>
                )}
            </div>

            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className="mt-0.5 flex-shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </div>
    );
};
