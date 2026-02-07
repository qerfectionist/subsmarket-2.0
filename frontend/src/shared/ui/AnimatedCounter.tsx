import * as React from 'react';

export interface AnimatedCounterProps {
    value: number;
    precision?: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    precision = 0,
    className,
    prefix = '',
    suffix = '',
}) => {
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
        const startTime = Date.now();
        const startValue = displayValue;
        const endValue = value;
        const duration = 500;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * easeOut;
            
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return (
        <span className={className}>
            {prefix}{displayValue.toFixed(precision)}{suffix}
        </span>
    );
};
