import { Accordion as HeroAccordion, AccordionItem as HeroAccordionItem } from "@heroui/react";
import { cn } from '@/shared/lib/utils';
import { triggerHaptic } from '@/shared/lib/utils';

export interface AccordionItemData {
    key: string;
    title: string;
    content: React.ReactNode;
}

export interface AccordionProps {
    items: AccordionItemData[];
    defaultExpandedKeys?: string[];
    selectionMode?: 'single' | 'multiple';
    className?: string;
}

export function Accordion({
    items,
    defaultExpandedKeys = [],
    selectionMode = 'single',
    className
}: AccordionProps) {
    return (
        <HeroAccordion
            selectionMode={selectionMode}
            defaultExpandedKeys={defaultExpandedKeys}
            className={cn("bg-content1 rounded-xl px-0", className)}
            variant="splitted"
            onSelectionChange={() => triggerHaptic('light')}
        >
            {items.map((item) => (
                <HeroAccordionItem
                    key={item.key}
                    aria-label={item.title}
                    title={item.title}
                    classNames={{
                        title: "text-[17px] font-medium",
                        content: "text-[15px] text-foreground-500 leading-relaxed pb-4"
                    }}
                >
                    {item.content}
                </HeroAccordionItem>
            ))}
        </HeroAccordion>
    );
}

// Legacy export for backward compatibility
export interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

export function AccordionItem({ title, children, className }: AccordionItemProps) {
    return (
        <HeroAccordion
            className={cn("bg-content1 rounded-xl", className)}
            variant="light"
        >
            <HeroAccordionItem
                key="1"
                aria-label={title}
                title={title}
                classNames={{
                    title: "text-[17px] font-medium",
                    content: "text-[15px] text-foreground-500 leading-relaxed pb-4"
                }}
            >
                {children}
            </HeroAccordionItem>
        </HeroAccordion>
    );
}
