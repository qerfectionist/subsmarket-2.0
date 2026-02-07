import {
    Switch as HeroSwitch,
    Checkbox as HeroCheckbox,
    Radio as HeroRadio,
    RadioGroup as HeroRadioGroup
} from "@heroui/react";
import { triggerHaptic } from '@/shared/lib/utils';

/* =============================================
 * SWITCH (TOGGLE)
 * ============================================= */

export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function Switch({ checked, onChange, disabled, label, className }: SwitchProps) {
    return (
        <HeroSwitch
            isSelected={checked}
            onValueChange={(val) => {
                triggerHaptic('light');
                onChange(val);
            }}
            isDisabled={disabled}
            className={className}
            classNames={{
                wrapper: "group-data-[selected=true]:bg-success"
            }}
        >
            {label}
        </HeroSwitch>
    );
}

/* =============================================
 * CHECKBOX
 * ============================================= */

export interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function Checkbox({ checked, onChange, disabled, label, className }: CheckboxProps) {
    return (
        <HeroCheckbox
            isSelected={checked}
            onValueChange={(val) => {
                triggerHaptic('light');
                onChange(val);
            }}
            isDisabled={disabled}
            className={className}
        >
            {label}
        </HeroCheckbox>
    );
}

/* =============================================
 * RADIO
 * ============================================= */

export interface RadioProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    label?: string;
    value: string;
    name?: string;
    className?: string;
}

export function Radio({ checked: _checked, onChange, disabled, label, value, className }: RadioProps) {
    return (
        <HeroRadio
            value={value}
            isDisabled={disabled}
            className={className}
            onChange={() => {
                triggerHaptic('light');
                onChange();
            }}
        >
            {label}
        </HeroRadio>
    );
}

/* =============================================
 * RADIO GROUP (new helper)
 * ============================================= */

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
        <HeroRadioGroup
            label={label}
            value={value}
            onValueChange={(val) => {
                triggerHaptic('light');
                onChange(val);
            }}
            orientation={orientation}
            className={className}
        >
            {options.map((opt) => (
                <HeroRadio key={opt.value} value={opt.value}>
                    {opt.label}
                </HeroRadio>
            ))}
        </HeroRadioGroup>
    );
}
