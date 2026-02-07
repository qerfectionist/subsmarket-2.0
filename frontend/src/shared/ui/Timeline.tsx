import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Check, Circle } from 'lucide-react';

export interface TimelineItem {
    id: string;
    title: string;
    description?: string;
    time?: string;
    status: 'completed' | 'current' | 'pending';
}

export interface TimelineProps {
    items: TimelineItem[];
    className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
    return (
        <div className={cn('glass-card p-0 overflow-hidden', className)}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={item.id} className="relative flex gap-4 p-4">
                        {/* Line */}
                        {!isLast && (
                            <div className="absolute left-[29px] top-10 bottom-0 w-[2px] bg-[var(--color-border)]" />
                        )}

                        {/* Icon */}
                        <div className="relative z-10 flex-shrink-0">
                            {item.status === 'completed' && (
                                <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                            )}
                            {item.status === 'current' && (
                                <div className="w-7 h-7 rounded-full bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                                </div>
                            )}
                            {item.status === 'pending' && (
                                <div className="w-7 h-7 rounded-full border-2 border-[var(--color-text-tertiary)] flex items-center justify-center opacity-50">
                                    <Circle size={8} fill="currentColor" className="text-transparent" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start gap-2">
                                <h4 className={cn(
                                    "text-[15px] font-semibold leading-tight",
                                    item.status === 'pending' ? 'text-[var(--color-text-secondary)]' : 'text-white'
                                )}>
                                    {item.title}
                                </h4>
                                {item.time && (
                                    <span className="text-[12px] text-[var(--color-text-tertiary)] font-medium">
                                        {item.time}
                                    </span>
                                )}
                            </div>
                            {item.description && (
                                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1 leading-snug">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
