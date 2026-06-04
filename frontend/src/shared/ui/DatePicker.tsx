import { TextField } from '@mui/material';

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

function toInputValue(date?: Date | null): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

export function DatePicker({ value, onChange, label, minDate, maxDate, isDisabled = false, error, className }: DatePickerProps) {
    return (
        <TextField
            type="date"
            label={label}
            value={toInputValue(value)}
            onChange={e => onChange?.(e.target.value ? new Date(e.target.value) : null)}
            disabled={isDisabled}
            error={!!error}
            helperText={error}
            className={className}
            fullWidth
            size="small"
            slotProps={{
                input: {
                    inputProps: {
                        min: toInputValue(minDate) || undefined,
                        max: toInputValue(maxDate) || undefined,
                    }
                },
                inputLabel: { shrink: true }
            }}
        />
    );
}

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

export function DateRangePickerComponent({ startDate, endDate, onChange, label, minDate, maxDate, isDisabled = false, className }: DateRangePickerProps) {
    return (
        <div style={{ display: 'flex', gap: 8 }} className={className}>
            <DatePicker label={label ? `${label} (от)` : 'Начало'} value={startDate} onChange={s => onChange?.(s, endDate ?? null)} minDate={minDate} maxDate={maxDate} isDisabled={isDisabled} />
            <DatePicker label={label ? `${label} (до)` : 'Конец'} value={endDate} onChange={e => onChange?.(startDate ?? null, e)} minDate={startDate ?? minDate} maxDate={maxDate} isDisabled={isDisabled} />
        </div>
    );
}
