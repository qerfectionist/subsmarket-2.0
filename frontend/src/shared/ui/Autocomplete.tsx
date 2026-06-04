import type { FC } from 'react';
import { Autocomplete as MuiAutocomplete, TextField, CircularProgress } from '@mui/material';

export interface AutocompleteOption {
    key: string;
    label: string;
    description?: string;
    icon?: string;
}

export interface AutocompleteProps {
    options: AutocompleteOption[];
    selectedKey?: string;
    onSelectionChange?: (key: string | null) => void;
    label?: string;
    placeholder?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    className?: string;
    containerClassName?: string;
}

export const Autocomplete: FC<AutocompleteProps> = ({
    options, selectedKey, onSelectionChange, label, placeholder = 'Поиск...',
    isDisabled = false, isLoading = false, className,
}) => {
    const selected = options.find(o => o.key === selectedKey) ?? null;
    return (
        <MuiAutocomplete
            options={options}
            value={selected}
            disabled={isDisabled}
            loading={isLoading}
            getOptionLabel={o => o.label}
            onChange={(_, val) => onSelectionChange?.(val?.key ?? null)}
            className={className}
            fullWidth
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    size="small"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {isLoading && <CircularProgress size={16} />}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            renderOption={(props, option) => (
                <li {...props} key={option.key}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{option.label}</span>
                        {option.description && <span style={{ fontSize: 11, opacity: 0.5 }}>{option.description}</span>}
                    </div>
                </li>
            )}
        />
    );
};

Autocomplete.displayName = 'Autocomplete';
