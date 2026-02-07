import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import type { TextAreaProps as HeroTextAreaProps } from '@heroui/react';
import { Textarea as HeroTextarea } from '@heroui/react';
import { cn } from '@/shared/lib/utils';

interface TextareaProps extends Omit<HeroTextAreaProps, 'errorMessage'> {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, containerClassName, label, error, ...props }, ref: ForwardedRef<HTMLTextAreaElement>) => (
        <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
            {label && (
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">
                    {label}
                </label>
            )}
            <HeroTextarea
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
                        "group-data-[focus=true]:border-[var(--color-button)]"
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

Textarea.displayName = 'Textarea';
