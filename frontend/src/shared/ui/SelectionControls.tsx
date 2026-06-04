import {
    Switch as MuiSwitch, Checkbox as MuiCheckbox,
    Radio as MuiRadio, RadioGroup as MuiRadioGroup,
    FormControlLabel, FormControl, FormLabel,
    Typography,
} from '@mui/material';
import { triggerHaptic } from '@/shared/lib/utils';

/* ── Switch ────────────────────────────────────────────────────────────── */
export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function Switch({ checked, onChange, disabled, label, className }: SwitchProps) {
    return (
        <FormControlLabel
            className={className}
            control={
                <MuiSwitch
                    checked={checked}
                    disabled={disabled}
                    onChange={(_, val) => { triggerHaptic('light'); onChange(val); }}
                    color="success"
                />
            }
            label={label}
        />
    );
}

/* ── Checkbox ──────────────────────────────────────────────────────────── */
export interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function Checkbox({ checked, onChange, disabled, label, className }: CheckboxProps) {
    return (
        <FormControlLabel
            className={className}
            control={
                <MuiCheckbox
                    checked={checked}
                    disabled={disabled}
                    onChange={(_, val) => { triggerHaptic('light'); onChange(val); }}
                />
            }
            label={label}
        />
    );
}

/* ── Radio ─────────────────────────────────────────────────────────────── */
export interface RadioProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    label?: string;
    value: string;
    name?: string;
    className?: string;
}

export function Radio({ onChange, disabled, label, value, className }: RadioProps) {
    return (
        <FormControlLabel
            className={className}
            value={value}
            control={
                <MuiRadio
                    disabled={disabled}
                    onChange={() => { triggerHaptic('light'); onChange(); }}
                />
            }
            label={label}
        />
    );
}

/* ── RadioGroup ─────────────────────────────────────────────────────────── */
export interface RadioGroupOption {
    value: string;
    label: string;
}

export interface RadioGroupProps {
    options: RadioGroupOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export function RadioGroup({ options, value, onChange, label, orientation = 'vertical', className }: RadioGroupProps) {
    return (
        <FormControl className={className}>
            {label && <FormLabel><Typography variant="caption" fontWeight={700}>{label}</Typography></FormLabel>}
            <MuiRadioGroup
                value={value}
                row={orientation === 'horizontal'}
                onChange={(_, val) => { triggerHaptic('light'); onChange(val); }}
            >
                {options.map(opt => (
                    <FormControlLabel key={opt.value} value={opt.value} control={<MuiRadio />} label={opt.label} />
                ))}
            </MuiRadioGroup>
        </FormControl>
    );
}
