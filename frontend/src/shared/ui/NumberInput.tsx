import { NumberInput as HeroNumberInput, NumberInputProps as HeroNumberInputProps } from "@heroui/react";
import { cn } from '@/shared/lib/utils';

interface NumberInputProps extends Omit<HeroNumberInputProps, 'onChange'> {
    value?: number;
    onChange?: (value: number) => void;
    label?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    error?: string;
    className?: string;
}

export function NumberInput({
    value,
    onChange,
    label,
    placeholder,
    min,
    max,
    step = 1,
    error,
    className,
    ...props
}: NumberInputProps) {
    return (
        <HeroNumberInput
            value={value}
            onValueChange={(val) => onChange?.(val)}
            label={label}
            placeholder={placeholder}
            minValue={min}
            maxValue={max}
            step={step}
            errorMessage={error}
            isInvalid={!!error}
            variant="bordered"
            labelPlacement="outside"
            className={cn("max-w-full", className)}
            classNames={{
                inputWrapper: [
                    "bg-[var(--color-bg-content)]",
                    "border-[var(--color-separator)]",
                ].join(" ")
            }}
            {...props}
        />
    );
}
