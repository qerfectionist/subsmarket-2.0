import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface ChartDataPoint {
    label: string;
    value: number;
}

export interface MarketChartProps {
    data: ChartDataPoint[];
    height?: number;
    color?: string;
    showLabels?: boolean;
    className?: string;
}

export const MarketChart: React.FC<MarketChartProps> = ({
    data,
    height = 60,
    color = '#34c759', // Success green (iOS)
    showLabels = false,
    className
}) => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - ((d.value - min) / (range || 1)) * 100
    }));

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <div style={{ height }} className="relative w-full overflow-visible">
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                >
                    {/* Only Line - Clean Style */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke" // Keeps line width constant
                        className="animate-in fade-in duration-700"
                    />

                    {/* End Dot */}
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="3"
                        fill={color}
                    />
                </svg>
            </div>

            {showLabels && (
                <div className="flex justify-between items-center px-1 pt-1 border-t border-[var(--color-separator)]">
                    <span className="text-[11px] font-medium text-[var(--color-text-tertiary)]">
                        {data[0].label}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] text-right">
                        {data[data.length - 1].label}
                    </span>
                </div>
            )}
        </div>
    );
};
