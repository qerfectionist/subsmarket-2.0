import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { Button } from './Button';

/* =============================================
 * DIALOG (MODAL)
 * ============================================= */

export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    showCloseButton = true
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
            />

            {/* Dialog Content */}
            <div
                className={cn(
                    'relative w-full max-w-sm overflow-hidden z-10',
                    'bg-[var(--color-bg-content)] border border-[var(--color-separator)] rounded-2xl shadow-2xl',
                    'animate-in zoom-in-95 duration-200'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1 rounded-full text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-primary)] transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}

                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{title}</h2>
                    {description && (
                        <p className="text-[15px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                            {description}
                        </p>
                    )}
                    {children}
                </div>

                {footer && (
                    <div className="px-6 pb-6 pt-0 flex gap-3 justify-center">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

/* =============================================
 * PROGRESS BAR
 * ============================================= */

export interface ProgressBarProps {
    value: number; // 0 to 100
    max?: number;
    showLabel?: boolean;
    className?: string;
    color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    showLabel,
    className,
    color = 'var(--color-button)'
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    <span>Progress</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
};

/* =============================================
 * ALERT DIALOG (PRE-STYLED)
 * ============================================= */

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDangerous?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDangerous
}) => {
    const haptic = useHaptic();

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} fullWidth>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={isDangerous ? 'destructive' : 'primary'}
                        onClick={() => {
                            haptic.notification(isDangerous ? 'warning' : 'success');
                            onConfirm();
                        }}
                        fullWidth
                    >
                        {confirmLabel}
                    </Button>
                </>
            }
        />
    );
};
