import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface TextareaProps extends Omit<TextFieldProps, 'label' | 'error'> {
    label?: string;
    error?: string;
    isInvalid?: boolean;
    minRows?: number;
    maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, isInvalid, className, minRows = 3, maxRows = 8, ...props }, ref: ForwardedRef<HTMLTextAreaElement>) => (
        <TextField
            inputRef={ref}
            label={label}
            error={!!(error || isInvalid)}
            helperText={error}
            multiline
            minRows={minRows}
            maxRows={maxRows}
            className={className}
            fullWidth
            variant="outlined"
            {...props}
        />
    )
);

Textarea.displayName = 'Textarea';
