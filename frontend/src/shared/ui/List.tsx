import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { ChevronRight } from 'lucide-react';

/* =============================================
 * List Section (Glass)
 * ============================================= */

interface ListSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    footer?: string;
}

export const ListSection = React.forwardRef<HTMLDivElement, ListSectionProps>(
    ({ className, title, footer, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('mb-6', className)} {...props}>
                {title && (
                    <div className="px-4 mb-2 text-[13px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                        {title}
                    </div>
                )}
                <div className="glass rounded-[24px] overflow-hidden border border-white/5">
                    {children}
                </div>
                {footer && (
                    <div className="px-4 mt-2 text-[13px] text-[var(--color-text-tertiary)] leading-snug">
                        {footer}
                    </div>
                )}
            </div>
        );
    }
);
ListSection.displayName = 'ListSection';

/* =============================================
 * List Item
 * ============================================= */

interface ListItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onToggle'> {
    icon?: React.ReactNode;
    label: string;
    value?: string;
    subLabel?: string;
    hasArrow?: boolean;
    toggle?: boolean;
    isOn?: boolean;
    onToggle?: (val: boolean) => void;
    destructive?: boolean;
    disabled?: boolean;
    rightElement?: React.ReactNode;
}

export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
    ({ className, icon, label, value, subLabel, hasArrow, toggle, isOn, onToggle, destructive, disabled, onClick, rightElement, ...props }, ref) => {
        const haptic = useHaptic();

        const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (disabled) return;

            if (toggle && onToggle) {
                haptic.impact('light');
                onToggle(!isOn);
                return;
            }

            if (onClick) {
                haptic.selection();
                onClick(e);
            }
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'flex items-center px-4 min-h-[56px] transition-colors',
                    'active:bg-white/5 cursor-pointer',
                    'border-b border-white/5 last:border-b-0',
                    disabled && 'opacity-50 pointer-events-none',
                    className
                )}
                onClick={handleClick}
                {...props}
            >
                {icon && <span className="mr-4 text-[var(--color-text-secondary)]">{icon}</span>}

                <div className="flex-1 flex items-center justify-between py-3">
                    <div className="flex flex-col">
                        <span className={cn('text-[16px] font-medium text-white', destructive && 'text-red-500')}>{label}</span>
                        {subLabel && <span className="text-[13px] text-[var(--color-text-secondary)]">{subLabel}</span>}
                    </div>

                    <div className="flex items-center gap-3">
                        {value && <span className="text-[16px] text-[var(--color-text-secondary)]">{value}</span>}
                        {rightElement}

                        {hasArrow && (
                            <ChevronRight size={18} className="text-[var(--color-text-tertiary)]" />
                        )}

                        {toggle && (
                            <div
                                className={cn(
                                    "w-[50px] h-[30px] rounded-full p-[2px] transition-colors duration-300",
                                    isOn ? "bg-[var(--color-success)]" : "bg-white/10"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-[26px] h-[26px] bg-white rounded-full shadow-lg transition-transform duration-300",
                                        isOn ? "translate-x-[20px]" : "translate-x-0"
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);
ListItem.displayName = 'ListItem';
