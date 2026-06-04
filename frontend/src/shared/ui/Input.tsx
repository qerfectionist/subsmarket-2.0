import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface InputProps extends Omit<TextFieldProps, 'label' | 'error'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  placeholder?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, containerClassName, isInvalid, isRequired, className, ...props }, ref: ForwardedRef<HTMLInputElement>) => (
    <TextField
      inputRef={ref}
      label={label}
      error={!!(error || isInvalid)}
      helperText={error}
      required={isRequired}
      className={className}
      fullWidth
      variant="outlined"
      size="small"
      {...props}
    />
  )
);

Input.displayName = 'Input';
