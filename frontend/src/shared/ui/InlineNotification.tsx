import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { MSIcon } from './MSIcon';

export interface InlineNotificationProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
    icon?: React.ReactNode;
    action?: { label: string; onClick: () => void };
    dismissible?: boolean;
    onDismiss?: () => void;
    className?: string;
}

const STYLES = {
    info: { border: 'border-primary-200', bg: 'bg-primary-50', icon: 'info', color: 'text-primary' },
    success: { border: 'border-success-200', bg: 'bg-success-50', icon: 'check_circle', color: 'text-success' },
    warning: { border: 'border-warning-200', bg: 'bg-warning-50', icon: 'warning', color: 'text-warning' },
    error: { border: 'border-danger-200', bg: 'bg-danger-50', icon: 'cancel', color: 'text-danger' },
};

export const InlineNotification: React.FC<InlineNotificationProps> = ({
    type = 'info', title, message, icon, action, dismissible = false, onDismiss, className
}) => {
    const [visible, setVisible] = React.useState(true);
    const s = STYLES[type];

    if (!visible) return null;

    return (
        <div className={cn('border rounded-2xl p-4 flex gap-3 items-start', s.bg, s.border, className)}>
            <div className={cn('flex-shrink-0 mt-0.5', s.color)}>
                {icon || <MSIcon name={s.icon} size={20} filled />}
            </div>

            <div className="flex-1 min-w-0">
                {title && <h4 className="text-sm font-semibold text-foreground leading-tight mb-0.5">{title}</h4>}
                <p className="text-sm text-default-600 leading-snug">{message}</p>
                {action && (
                    <button
                        onClick={action.onClick}
                        className="mt-2 text-sm font-semibold text-foreground active:opacity-60 transition-opacity flex items-center gap-0.5"
                    >
                        {action.label}
                        <MSIcon name="chevron_right" size={16} />
                    </button>
                )}
            </div>

            {dismissible && (
                <button
                    onClick={() => { setVisible(false); onDismiss?.(); }}
                    className="flex-shrink-0 text-default-400 hover:text-default-600 transition-colors"
                >
                    <MSIcon name="close" size={18} />
                </button>
            )}
        </div>
    );
};
