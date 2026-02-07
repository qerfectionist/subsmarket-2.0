import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface PageIndicatorProps {
    total: number;
    current: number;
    onChange?: (index: number) => void;
    variant?: 'dots' | 'lines' | 'pills';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({
    total,
    current,
    onChange,
    variant = 'dots',
    size = 'md',
    className
}) => {
    const sizes = {
        sm: { dot: 6, line: { w: 16, h: 3 }, pill: { w: 20, h: 6 }, gap: 6 },
        md: { dot: 8, line: { w: 24, h: 4 }, pill: { w: 28, h: 8 }, gap: 8 },
        lg: { dot: 10, line: { w: 32, h: 5 }, pill: { w: 36, h: 10 }, gap: 10 }
    };

    const sizeConfig = sizes[size];

    return (
        <div className={cn('flex items-center justify-center', className)} style={{ gap: sizeConfig.gap }}>
            {Array.from({ length: total }).map((_, index) => {
                const isActive = index === current;

                if (variant === 'dots') {
                    return (
                        <button
                            key={index}
                            onClick={() => onChange?.(index)}
                            className={cn(
                                'rounded-full transition-all duration-300',
                                isActive ? 'bg-[var(--color-button)] scale-100 opacity-100' : 'bg-[var(--color-text-secondary)] scale-75 opacity-40'
                            )}
                            style={{ width: sizeConfig.dot, height: sizeConfig.dot }}
                        />
                    );
                }

                if (variant === 'lines') {
                    return (
                        <button
                            key={index}
                            onClick={() => onChange?.(index)}
                            className="rounded-full bg-white/20 overflow-hidden"
                            style={{ width: sizeConfig.line.w, height: sizeConfig.line.h }}
                        >
                            <div
                                className={cn(
                                    "h-full bg-[var(--color-button)] origin-left transition-transform duration-300",
                                    isActive ? "scale-x-100" : "scale-x-0"
                                )}
                            />
                        </button>
                    );
                }

                // Pills
                return (
                    <button
                        key={index}
                        onClick={() => onChange?.(index)}
                        className={cn(
                            'rounded-full transition-all duration-300',
                            isActive ? 'bg-[var(--color-button)] opacity-100' : 'bg-[var(--color-text-secondary)] opacity-40'
                        )}
                        style={{ 
                            height: sizeConfig.pill.h,
                            width: isActive ? sizeConfig.pill.w : sizeConfig.pill.h 
                        }}
                    />
                );
            })}
        </div>
    );
};
