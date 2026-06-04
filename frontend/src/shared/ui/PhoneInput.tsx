import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { formatKzPhone } from '@/shared/lib/phone';

type PhoneInputProps = Omit<TextFieldProps, 'value' | 'onChange' | 'type'> & {
    value: string;
    onChange: (value: string) => void;
};

export function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
    return (
        <TextField
            {...props}
            value={value}
            onChange={event => onChange(formatKzPhone(event.target.value))}
            type="tel"
            placeholder="+7 (777) 123-45-67"
            inputProps={{
                inputMode: 'tel',
                autoComplete: 'tel',
                ...props.inputProps,
            }}
        />
    );
}
