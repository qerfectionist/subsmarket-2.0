import type { FC, Key } from 'react';
import { Autocomplete as HeroAutocomplete, AutocompleteItem } from '@heroui/react';
import { cn } from '@/shared/lib/utils';

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
    options,
    selectedKey,
    onSelectionChange,
    label,
    placeholder = 'Поиск...',
    isDisabled = false,
    isLoading = false,
    className,
    containerClassName
}) => {
    const handleSelectionChange = (key: Key | null) => {
        if (!onSelectionChange) return;
        onSelectionChange(key as string | null);
    };

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
            {label && (
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">
                    {label}
                </label>
            )}
            <HeroAutocomplete
                placeholder={placeholder}
                selectedKey={selectedKey}
                onSelectionChange={handleSelectionChange}
                isDisabled={isDisabled}
                isLoading={isLoading}
                className={cn("max-w-full", className)}
                variant="bordered"
                labelPlacement="outside"
                inputProps={{
                    classNames: {
                        inputWrapper: "bg-[var(--color-bg-content)] border-[var(--color-separator)] min-h-[48px]",
                        input: "text-white placeholder:text-white/20",
                    }
                }}
                classNames={{
                    base: "w-full",
                    listbox: "bg-[#1c1c1e] border border-white/10",
                    popoverContent: "bg-[#1c1c1e] border border-white/10",
                }}
                label={undefined}
            >
                {options.map((option) => (
                    <AutocompleteItem
                        key={option.key}
                        textValue={option.label}
                        startContent={
                            option.icon ? (
                                <div className="w-6 h-6 rounded bg-white/5 overflow-hidden flex-shrink-0">
                                    <img src={option.icon} alt="" className="w-full h-full object-cover" />
                                </div>
                            ) : null
                        }
                    >
                        <div className="flex flex-col">
                            <span className="text-small font-medium">{option.label}</span>
                            {option.description && (
                                <span className="text-tiny text-default-400 capitalize">{option.description}</span>
                            )}
                        </div>
                    </AutocompleteItem>
                ))}
            </HeroAutocomplete>
        </div>
    );
};

Autocomplete.displayName = 'Autocomplete';
