import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Check, Circle } from 'lucide-react';
import { Card, CardBody } from '@heroui/react';

export interface TimelineItem {
    id: string;
    title: string;
    description?: string;
    time?: string;
    status: 'completed' | 'current' | 'pending';
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
}

export interface TimelineProps {
    items: TimelineItem[];
    className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
    return (
        <Card shadow="sm" className={cn("bg-content1 border-none", className)}>
            <CardBody className="p-0 overflow-hidden">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isCompleted = item.status === 'completed';
                    const isCurrent = item.status === 'current';
                    const isPending = item.status === 'pending';
                    const color = item.color || 'primary';

                    return (
                        <div key={item.id} className="relative flex gap-4 p-4">
                            {/* Line */}
                            {!isLast && (
                                <div className="absolute left-[30px] top-10 bottom-0 w-[2px] bg-default-100" />
                            )}

                            {/* Icon */}
                            <div className="relative z-10 flex-shrink-0 mt-0.5">
                                {isCompleted && (
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center text-white",
                                        `bg-${color}`
                                    )}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center border-2",
                                        `border-${color} bg-${color}/10`
                                    )}>
                                        <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", `bg-${color}`)} />
                                    </div>
                                )}
                                {isPending && (
                                    <div className="w-7 h-7 rounded-full border-2 border-default-200 flex items-center justify-center bg-transparent">
                                        <Circle size={8} fill="currentColor" className="text-transparent" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className={cn(
                                        "text-sm font-semibold leading-tight",
                                        isPending ? 'text-default-400' : 'text-foreground'
                                    )}>
                                        {item.title}
                                    </h4>
                                    {item.time && (
                                        <span className="text-xs text-default-400 font-medium">
                                            {item.time}
                                        </span>
                                    )}
                                </div>
                                {item.description && (
                                    <p className="text-xs text-default-500 mt-1 leading-snug">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardBody>
        </Card>
    );
};
