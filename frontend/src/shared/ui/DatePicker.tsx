import { DatePicker as HeroDatePicker, DateRangePicker } from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { cn } from '@/shared/lib/utils';

export interface DatePickerProps {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    label?: string;
    minDate?: Date;
    maxDate?: Date;
    isDisabled?: boolean;
    error?: string;
    className?: string;
}

// Helper to convert JS Date to CalendarDate
function toCalendarDate(date: Date): CalendarDate {
    return parseDate(date.toISOString().split('T')[0]);
}

// Helper to convert CalendarDate to JS Date
function toJsDate(date: CalendarDate): Date {
    return new Date(date.year, date.month - 1, date.day);
}

export function DatePicker({
    value,
    onChange,
    label,
    minDate,
    maxDate,
    isDisabled = false,
    error,
    className
}: DatePickerProps) {
    return (
        <HeroDatePicker
            label={label}
            value={value ? toCalendarDate(value) : null}
            onChange={(date) => onChange?.(date ? toJsDate(date) : null)}
            minValue={minDate ? toCalendarDate(minDate) : undefined}
            maxValue={maxDate ? toCalendarDate(maxDate) : undefined}
            isDisabled={isDisabled}
            errorMessage={error}
            isInvalid={!!error}
            variant="bordered"
            labelPlacement="outside"
            className={cn("max-w-full", className)}
            classNames={{
                inputWrapper: "bg-[var(--color-bg-content)]"
            }}
        />
    );
}

// Date Range Picker
export interface DateRangePickerProps {
    startDate?: Date | null;
    endDate?: Date | null;
    onChange?: (start: Date | null, end: Date | null) => void;
    label?: string;
    minDate?: Date;
    maxDate?: Date;
    isDisabled?: boolean;
    className?: string;
}

export function DateRangePickerComponent({
    startDate,
    endDate,
    onChange,
    label,
    minDate,
    maxDate,
    isDisabled = false,
    className
}: DateRangePickerProps) {
    const value = startDate && endDate ? {
        start: toCalendarDate(startDate),
        end: toCalendarDate(endDate)
    } : null;

    return (
        <DateRangePicker
            label={label}
            value={value}
            onChange={(range) => {
                if (range) {
                    onChange?.(toJsDate(range.start), toJsDate(range.end));
                } else {
                    onChange?.(null, null);
                }
            }}
            minValue={minDate ? toCalendarDate(minDate) : undefined}
            maxValue={maxDate ? toCalendarDate(maxDate) : undefined}
            isDisabled={isDisabled}
            variant="bordered"
            labelPlacement="outside"
            className={cn("max-w-full", className)}
        />
    );
}
