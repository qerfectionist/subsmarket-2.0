import { TextField, InputAdornment, IconButton } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

interface NumberInputProps {
    value?: number;
    onChange?: (value: number) => void;
    label?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    error?: string;
    className?: string;
    isDisabled?: boolean;
}

export function NumberInput({ value = 0, onChange, label, placeholder, min, max, step = 1, error, className, isDisabled }: NumberInputProps) {
    const decrement = () => { const v = value - step; onChange?.(min !== undefined ? Math.max(min, v) : v); };
    const increment = () => { const v = value + step; onChange?.(max !== undefined ? Math.min(max, v) : v); };

    return (
        <TextField
            type="number"
            label={label}
            placeholder={placeholder}
            value={value}
            disabled={isDisabled}
            error={!!error}
            helperText={error}
            className={className}
            fullWidth
            size="small"
            onChange={e => {
                const v = Number(e.target.value);
                if (min !== undefined && v < min) return;
                if (max !== undefined && v > max) return;
                onChange?.(v);
            }}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <IconButton size="small" onClick={decrement} disabled={min !== undefined && value <= min}><RemoveRoundedIcon fontSize="small" /></IconButton>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={increment} disabled={max !== undefined && value >= max}><AddRoundedIcon fontSize="small" /></IconButton>
                        </InputAdornment>
                    ),
                }
            }}
        />
    );
}
