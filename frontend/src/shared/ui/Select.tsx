import type { FC } from 'react';
import { Select as MuiSelect, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  containerClassName?: string;
  className?: string;
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

export const Select: FC<SelectProps> = ({
  options, value, onChange, placeholder, label, className, error, isRequired, isDisabled,
}) => (
  <FormControl fullWidth error={!!error} required={isRequired} disabled={isDisabled} size="small" className={className}>
    {label && <InputLabel>{label}</InputLabel>}
    <MuiSelect
      value={value ?? ''}
      label={label}
      displayEmpty={!label}
      onChange={e => onChange?.(e.target.value as string)}
    >
      {placeholder && !label && <MenuItem value="" disabled>{placeholder}</MenuItem>}
      {options.map(opt => (
        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
      ))}
    </MuiSelect>
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);

Select.displayName = 'Select';
