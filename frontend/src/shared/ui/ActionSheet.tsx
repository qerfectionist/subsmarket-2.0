import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface ActionSheetAction {
    id: string;
    label: string;
    icon?: React.ReactNode;
    destructive?: boolean;
    disabled?: boolean;
    onClick: () => void;
}

export interface ActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    actions: ActionSheetAction[];
    cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    actions,
    cancelLabel = 'Cancel'
}) => {
    const haptic = useHaptic();
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setVisible(true);
        } else {
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleAction = (action: ActionSheetAction) => {
        if (action.disabled) return;
        haptic.impact('light');
        action.onClick();
        onClose();
    };

    if (!visible) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 z-50 transition-opacity duration-200",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 transition-transform duration-300",
                    isOpen ? "translate-y-0" : "translate-y-full"
                )}
            >
                {/* Actions Group */}
                <div className="bg-[var(--color-bg-content)] rounded-2xl overflow-hidden mb-2">
                    {(title || subtitle) && (
                        <div className="px-4 py-4 text-center border-b border-[var(--color-separator)]">
                            {title && (
                                <div className="text-[13px] font-semibold text-[var(--color-text-secondary)]">
                                    {title}
                                </div>
                            )}
                            {subtitle && (
                                <div className="text-[12px] text-[var(--color-text-tertiary)] mt-1">
                                    {subtitle}
                                </div>
                            )}
                        </div>
                    )}

                    {actions.map((action, index) => (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action)}
                            disabled={action.disabled}
                            className={cn(
                                'w-full px-4 py-4 flex items-center justify-center gap-3',
                                'text-[17px] font-medium',
                                'active:bg-[var(--color-bg-primary)]',
                                action.destructive
                                    ? 'text-[var(--color-destructive)]'
                                    : 'text-[var(--color-button)]',
                                action.disabled && 'opacity-40 cursor-not-allowed',
                                index < actions.length - 1 && 'border-b border-[var(--color-separator)]'
                            )}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    className={cn(
                        'w-full px-4 py-4',
                        'bg-[var(--color-bg-content)] rounded-2xl',
                        'text-[17px] font-semibold text-[var(--color-text-primary)]',
                        'active:bg-[var(--color-bg-primary)]'
                    )}
                >
                    {cancelLabel}
                </button>
            </div>
        </>,
        document.body
    );
};
