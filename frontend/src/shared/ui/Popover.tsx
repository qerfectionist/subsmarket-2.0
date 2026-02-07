import {
    Popover as HeroPopover,
    PopoverTrigger,
    PopoverContent,
} from "@heroui/react";
import { cn } from '@/shared/lib/utils';

export interface PopoverProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
    showArrow?: boolean;
    offset?: number;
    className?: string;
}

export function Popover({
    trigger,
    children,
    placement = 'bottom',
    showArrow = true,
    offset = 10,
    className
}: PopoverProps) {
    return (
        <HeroPopover
            placement={placement}
            showArrow={showArrow}
            offset={offset}
        >
            <PopoverTrigger>
                {trigger}
            </PopoverTrigger>
            <PopoverContent className={cn("bg-content1 p-3", className)}>
                {children}
            </PopoverContent>
        </HeroPopover>
    );
}

// Tooltip variant (simpler popover)
export interface TooltipProps {
    content: string;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
    return (
        <Popover trigger={children} placement={placement}>
            <span className="text-sm">{content}</span>
        </Popover>
    );
}

// Re-export for custom implementations
export { HeroPopover as PopoverBase, PopoverTrigger, PopoverContent };
