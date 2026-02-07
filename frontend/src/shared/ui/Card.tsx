import * as React from 'react';
import { Card as HeroCard, CardProps as HeroCardProps, CardBody } from "@heroui/react";
import { cn, triggerHaptic } from '@/shared/lib/utils';

interface CardProps extends HeroCardProps {
    clickable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, clickable, onPress, onClick, ...props }, ref) => {
        const handlePress = (e: any) => {
            if (clickable) triggerHaptic('light');
            if (onPress) onPress(e);
            if (onClick) onClick(e);
        };

        return (
            <HeroCard
                ref={ref}
                isPressable={clickable || !!onPress || !!onClick}
                onPress={handlePress}
                shadow="sm"
                className={cn(
                    "bg-[var(--color-bg-secondary)]",
                    "border border-[var(--color-separator)]",
                    clickable && "active:scale-[0.98] transition-transform",
                    className
                )}
                classNames={{
                    body: "p-4"
                }}
                {...props}
            >
                <CardBody className="p-4">
                    {children}
                </CardBody>
            </HeroCard>
        );
    }
);
Card.displayName = 'Card';
