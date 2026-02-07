import { Spinner as HeroSpinner } from "@heroui/react";

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    label?: string;
    className?: string;
}

export function Spinner({ size = 'md', color = 'primary', label, className }: SpinnerProps) {
    return (
        <HeroSpinner
            size={size}
            color={color}
            label={label}
            className={className}
        />
    );
}

// Centered loading spinner for full-page loading states
export function LoadingScreen({ label = 'Загрузка...' }: { label?: string }) {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <Spinner size="lg" label={label} />
        </div>
    );
}
