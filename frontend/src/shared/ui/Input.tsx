import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import type { InputProps as HeroInputProps } from '@heroui/react';
import { Input as HeroInput } from '@heroui/react';
import { cn } from '@/shared/lib/utils';

interface InputProps extends Omit<HeroInputProps, 'errorMessage'> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, error, ...props }, ref: ForwardedRef<HTMLInputElement>) => (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">
          {label}
        </label>
      )}
      <HeroInput
        ref={ref}
        errorMessage={error}
        isInvalid={!!error}
        className={className}
        variant="bordered"
        labelPlacement="outside"
        classNames={{
          inputWrapper: [
            "bg-[var(--color-bg-content)]",
            "border-[var(--color-separator)]",
            "data-[hover=true]:border-[var(--color-button)]",
            "group-data-[focus=true]:border-[var(--color-button)]",
            "min-h-[48px]"
          ].join(" "),
          input: "text-white placeholder:text-white/20",
          label: "hidden"
        }}
        {...props}
        label={undefined}
      />
    </div>
  )
);

Input.displayName = 'Input';
