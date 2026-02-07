import { Divider as HeroDivider } from "@heroui/react";
import { cn } from '@/shared/lib/utils';

export interface DividerProps {
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    label?: string;
}

export function Divider({ className, orientation = 'horizontal', label }: DividerProps) {
    if (label) {
        // HeroUI Divider doesn't support labels, so we keep custom implementation for labeled dividers
        return (
            <div className={cn('relative w-full my-4 flex items-center', className)}>
                <HeroDivider className="flex-1" />
                <span className="shrink-0 mx-4 text-xs font-bold text-foreground-400 uppercase tracking-wider">
                    {label}
                </span>
                <HeroDivider className="flex-1" />
            </div>
        );
    }

    return (
        <HeroDivider
            orientation={orientation}
            className={cn(
                orientation === 'vertical' ? 'mx-2' : 'my-4',
                className
            )}
        />
    );
}
