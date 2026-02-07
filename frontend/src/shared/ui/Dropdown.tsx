import {
    Dropdown as HeroDropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection,
} from "@heroui/react";
import { triggerHaptic } from '@/shared/lib/utils';

export interface DropdownItemData {
    key: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    isDisabled?: boolean;
}

export interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItemData[];
    onAction: (key: string) => void;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
    className?: string;
}

export function Dropdown({ trigger, items, onAction, placement = 'bottom-end', className }: DropdownProps) {
    return (
        <HeroDropdown placement={placement}>
            <DropdownTrigger>
                {trigger}
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Actions"
                onAction={(key) => {
                    triggerHaptic('light');
                    onAction(key as string);
                }}
                className={className}
            >
                {items.map((item) => (
                    <DropdownItem
                        key={item.key}
                        description={item.description}
                        startContent={item.icon}
                        color={item.color}
                        isDisabled={item.isDisabled}
                    >
                        {item.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </HeroDropdown>
    );
}

// Re-export for custom implementations
export { HeroDropdown as DropdownBase, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection };
