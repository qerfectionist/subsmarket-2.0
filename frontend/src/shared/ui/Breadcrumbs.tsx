import { Breadcrumbs as HeroBreadcrumbs, BreadcrumbItem } from "@heroui/react";

export interface BreadcrumbItemData {
    key: string;
    label: string;
    href?: string;
    isCurrent?: boolean;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItemData[];
    onAction?: (key: string) => void;
    separator?: React.ReactNode;
    className?: string;
}

export function Breadcrumbs({ items, onAction, separator, className }: BreadcrumbsProps) {
    return (
        <HeroBreadcrumbs
            separator={separator}
            onAction={(key) => onAction?.(key as string)}
            className={className}
            classNames={{
                list: "gap-1"
            }}
        >
            {items.map((item) => (
                <BreadcrumbItem
                    key={item.key}
                    href={item.href}
                    isCurrent={item.isCurrent}
                >
                    {item.label}
                </BreadcrumbItem>
            ))}
        </HeroBreadcrumbs>
    );
}
