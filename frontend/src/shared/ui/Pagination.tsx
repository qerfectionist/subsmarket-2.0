import { Pagination as HeroPagination } from "@heroui/react";
import { triggerHaptic } from '@/shared/lib/utils';

export interface PaginationProps {
    total: number;
    page: number;
    onChange: (page: number) => void;
    siblings?: number;
    boundaries?: number;
    showControls?: boolean;
    isCompact?: boolean;
    isDisabled?: boolean;
    className?: string;
}

export function Pagination({
    total,
    page,
    onChange,
    siblings = 1,
    boundaries = 1,
    showControls = true,
    isCompact = false,
    isDisabled = false,
    className
}: PaginationProps) {
    return (
        <HeroPagination
            total={total}
            page={page}
            onChange={(p) => {
                triggerHaptic('light');
                onChange(p);
            }}
            siblings={siblings}
            boundaries={boundaries}
            showControls={showControls}
            isCompact={isCompact}
            isDisabled={isDisabled}
            className={className}
            classNames={{
                item: "bg-default-100",
                cursor: "bg-primary"
            }}
        />
    );
}
