import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { useHaptic } from '@/shared/hooks/useHaptic';

export interface CalendarEvent {
    id: string;
    date: Date;
    title: string;
    amount?: string | number;
    currency?: string;
    type: 'success' | 'warning' | 'info' | 'accent' | 'error';
    category?: string;
}

export interface CalendarProps {
    value?: Date;
    onChange?: (date: Date) => void;
    events?: CalendarEvent[];
    className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
    value,
    onChange,
    events = [],
    className,
}) => {
    const haptic = useHaptic();
    const [viewDate, setViewDate] = React.useState(value || new Date());

    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (m: number, y: number) => (new Date(y, m, 1).getDay() + 6) % 7;

    const handlePrevMonth = () => {
        setViewDate(new Date(year, month - 1, 1));
        haptic.selection();
    };

    const handleNextMonth = () => {
        setViewDate(new Date(year, month + 1, 1));
        haptic.selection();
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(year, month, day);
        onChange?.(newDate);
        haptic.selection();
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const isSelected = (day: number) => {
        return value && day === value.getDate() && month === value.getMonth() && year === value.getFullYear();
    };

    const getEventsForDay = (day: number) => {
        return events.filter(e => {
            const d = new Date(e.date);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });
    };

    const days = Array.from({ length: daysInMonth(month, year) }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDayOfMonth(month, year) }, (_, i) => i);

    const selectedDayEvents = value ? events.filter(e => {
        const d = new Date(e.date);
        return d.getDate() === value.getDate() && d.getMonth() === value.getMonth() && d.getFullYear() === value.getFullYear();
    }) : [];

    const eventColors = {
        success: 'bg-[#34c759]',
        warning: 'bg-[#ffcc00]',
        error: 'bg-[#ff3b30]',
        info: 'bg-[#007aff]',
        accent: 'bg-[var(--color-button)]'
    };

    return (
        <div className={cn('w-full bg-[var(--color-bg-content)] rounded-2xl overflow-hidden', className)}>
            {/* Header */}
            <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-wider">
                            {year}
                        </span>
                        <h3 className="text-white text-2xl font-bold">
                            {monthNames[month]}
                        </h3>
                    </div>
                    <div className="flex items-center bg-[var(--color-bg-primary)] rounded-xl p-1">
                        <button
                            onClick={handlePrevMonth}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg text-white transition-all active:scale-90"
                        >
                            ‹
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg text-white transition-all active:scale-90"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* Week Days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-y-1">
                    {padding.map(i => (
                        <div key={`p-${i}`} className="aspect-square" />
                    ))}
                    {days.map(day => {
                        const dayEvents = getEventsForDay(day);
                        const selected = isSelected(day);
                        const today = isToday(day);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={cn(
                                    'aspect-square flex flex-col items-center justify-center rounded-xl text-[15px] transition-all relative',
                                    selected
                                        ? 'bg-[var(--color-button)] text-white font-bold'
                                        : today
                                            ? 'text-[var(--color-button)] font-bold'
                                            : 'text-[var(--color-text-primary)] hover:bg-white/5',
                                )}
                            >
                                <span>{day}</span>
                                {dayEvents.length > 0 && (
                                    <div className={cn(
                                        "w-1 h-1 rounded-full mt-0.5",
                                        selected ? "bg-white/50" : eventColors[dayEvents[0].type]
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Events List */}
            <div className="border-t border-[var(--color-separator)] p-4">
                <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-3">
                    {value ? value.toLocaleDateString('en-US', { day: 'numeric', month: 'long' }) : 'Select Date'}
                </h4>
                
                {selectedDayEvents.length > 0 ? (
                    <div className="space-y-2">
                        {selectedDayEvents.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-primary)]"
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                    eventColors[event.type] + "/20"
                                )}>
                                    <span className="text-lg">
                                        {event.type === 'success' ? '↑' : event.type === 'warning' ? '⏱' : '💳'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">
                                        {event.title}
                                    </p>
                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                        {event.category || 'Subscription'}
                                    </span>
                                </div>
                                {event.amount && (
                                    <div className="text-right">
                                        <p className="text-[15px] font-bold text-[var(--color-text-primary)]">
                                            {event.amount}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-[var(--color-text-secondary)]">
                        No events for this day
                    </div>
                )}
            </div>
        </div>
    );
};
