import { Pagination as MuiPagination } from '@mui/material';
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

export function Pagination({ total, page, onChange, siblings = 1, showControls = true, isCompact = false, isDisabled = false, className }: PaginationProps) {
    return (
        <MuiPagination
            count={total}
            page={page}
            disabled={isDisabled}
            siblingCount={siblings}
            hidePrevButton={!showControls}
            hideNextButton={!showControls}
            size={isCompact ? 'small' : 'medium'}
            color="primary"
            className={className}
            onChange={(_, p) => { triggerHaptic('light'); onChange(p); }}
        />
    );
}
