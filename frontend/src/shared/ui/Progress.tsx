import { Progress as HeroProgress, CircularProgress } from "@heroui/react";

export interface ProgressProps {
    value: number;
    maxValue?: number;
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    label?: string;
    showValueLabel?: boolean;
    isIndeterminate?: boolean;
    className?: string;
}

export function Progress({
    value,
    maxValue = 100,
    size = 'md',
    color = 'primary',
    label,
    showValueLabel = false,
    isIndeterminate = false,
    className
}: ProgressProps) {
    return (
        <HeroProgress
            value={value}
            maxValue={maxValue}
            size={size}
            color={color}
            label={label}
            showValueLabel={showValueLabel}
            isIndeterminate={isIndeterminate}
            className={className}
            classNames={{
                track: "bg-default-100",
                indicator: "bg-gradient-to-r from-primary-500 to-primary-400"
            }}
        />
    );
}

// Circular progress variant
export interface CircularProgressProps {
    value: number;
    maxValue?: number;
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    showValueLabel?: boolean;
    label?: string;
    className?: string;
}

export function CircularProgressBar({
    value,
    maxValue = 100,
    size = 'md',
    color = 'primary',
    showValueLabel = true,
    label,
    className
}: CircularProgressProps) {
    return (
        <CircularProgress
            value={value}
            maxValue={maxValue}
            size={size}
            color={color}
            showValueLabel={showValueLabel}
            label={label}
            className={className}
        />
    );
}
