import type { FC } from 'react';
import type { SelectProps as HeroSelectProps, Selection } from '@heroui/react';
import { Select as HeroSelect, SelectItem } from '@heroui/react';
import { cn } from '@/shared/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<HeroSelectProps, 'children' | 'onChange' | 'value'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  containerClassName?: string;
}

export const Select: FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  className,
  containerClassName,
  ...props
}) => {
  const handleSelectionChange = (keys: Selection) => {
    if (!onChange) return;

    const selectedValue = Array.from(keys)[0] as string;
    if (selectedValue) {
      onChange(selectedValue);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">
          {label}
        </label>
      )}
      <HeroSelect
        placeholder={placeholder}
        className={cn("max-w-full", className)}
        selectedKeys={value ? [value] : []}
        onSelectionChange={handleSelectionChange}
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          trigger: "bg-[var(--color-bg-content)] border-[var(--color-separator)] min-h-[48px]",
          value: "text-white",
          label: "hidden"
        }}
        {...props}
        label={undefined}
      >
        {options.map((option) => (
          <SelectItem key={option.value} className="text-white">
            {option.label}
          </SelectItem>
        ))}
      </HeroSelect>
    </div>
  );
};

Select.displayName = 'Select';
