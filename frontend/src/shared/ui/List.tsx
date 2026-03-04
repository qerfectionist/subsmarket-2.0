import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';
import { ChevronRight } from 'lucide-react';
import { Card, CardBody } from '@heroui/react';

/* =============================================
 * List Section
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
                    <div className="px-4 mb-2 text-xs font-bold text-default-500 uppercase tracking-wider ml-1">
                        {title}
                    </div>
                )}
                <Card shadow="sm" className="bg-content1 rounded-[24px]">
                    <CardBody className="p-0 overflow-hidden">
                        {children}
                    </CardBody>
                </Card>
                {footer && (
                    <div className="px-4 mt-2 text-xs text-default-400 leading-snug ml-1">
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
    value?: React.ReactNode;
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
                    'flex items-center px-4 min-h-[56px] transition-colors line-clamp-1',
                    'active:bg-default-100/50 cursor-pointer',
                    'border-b border-default-100 last:border-b-0',
                    disabled && 'opacity-50 pointer-events-none',
                    className
                )}
                onClick={handleClick}
                {...props}
            >
                {icon && <span className="mr-4 text-default-500">{icon}</span>}

                <div className="flex-1 flex items-center justify-between py-3 min-w-0">
                    <div className="flex flex-col min-w-0 mr-3">
                        <span className={cn('text-base font-medium truncate', destructive ? 'text-danger' : 'text-foreground')}>{label}</span>
                        {subLabel && <span className="text-xs text-default-400 truncate">{subLabel}</span>}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        {value && <span className="text-sm text-default-500">{value}</span>}
                        {rightElement}

                        {hasArrow && (
                            <ChevronRight size={18} className="text-default-400" />
                        )}

                        {toggle && (
                            <div
                                className={cn(
                                    "w-[50px] h-[30px] rounded-full p-[2px] transition-colors duration-300",
                                    isOn ? "bg-success" : "bg-default-200"
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
