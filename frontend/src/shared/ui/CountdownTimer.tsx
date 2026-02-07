import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
    const difference = targetDate.getTime() - Date.now();

    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference
    };
};

export interface CountdownTimerProps {
    targetDate: Date;
    onComplete?: () => void;
    size?: 'sm' | 'md' | 'lg';
    showLabels?: boolean;
    compact?: boolean;
    className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
    targetDate,
    onComplete,
    size = 'md',
    showLabels = true,
    compact = false,
    className
}) => {
    const [timeLeft, setTimeLeft] = React.useState<TimeLeft>(() => calculateTimeLeft(targetDate));
    const completedRef = React.useRef(false);

    React.useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft(targetDate);
            setTimeLeft(newTimeLeft);

            if (newTimeLeft.total <= 0 && !completedRef.current) {
                completedRef.current = true;
                onComplete?.();
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    const sizes = {
        sm: { digit: 'text-lg font-bold', label: 'text-[9px]', box: 'w-10 h-10' },
        md: { digit: 'text-2xl font-black', label: 'text-[10px]', box: 'w-14 h-14' },
        lg: { digit: 'text-4xl font-black', label: 'text-xs', box: 'w-20 h-20' }
    };

    const sizeConfig = sizes[size];

    const TimeBlock: React.FC<{ value: number; label: string }> = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div className={cn(
                'flex items-center justify-center',
                'bg-[var(--color-bg-content)] rounded-xl',
                'text-[var(--color-text-primary)] tabular-nums',
                sizeConfig.box,
                sizeConfig.digit
            )}>
                {String(value).padStart(2, '0')}
            </div>
            {showLabels && (
                <span className={cn(
                    'mt-1 uppercase tracking-wider text-[var(--color-text-secondary)]',
                    sizeConfig.label
                )}>
                    {label}
                </span>
            )}
        </div>
    );

    const Separator = () => (
        <span className={cn(
            'text-[var(--color-text-secondary)] font-bold self-start mt-2',
            sizeConfig.digit
        )}>
            :
        </span>
    );

    if (compact) {
        const parts = [];
        if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
        if (timeLeft.hours > 0 || parts.length > 0) parts.push(`${timeLeft.hours}h`);
        parts.push(`${timeLeft.minutes}m`);
        parts.push(`${timeLeft.seconds}s`);

        return (
            <div className={cn('font-mono font-bold text-[var(--color-text-primary)] tabular-nums', className)}>
                {parts.join(' ')}
            </div>
        );
    }

    return (
        <div className={cn('flex items-start gap-2', className)}>
            {timeLeft.days > 0 && (
                <>
                    <TimeBlock value={timeLeft.days} label="Days" />
                    <Separator />
                </>
            )}
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <Separator />
            <TimeBlock value={timeLeft.minutes} label="Mins" />
            <Separator />
            <TimeBlock value={timeLeft.seconds} label="Secs" />
        </div>
    );
};
