import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';

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
        <MuiBreadcrumbs separator={separator} className={className}>
            {items.map(item => item.isCurrent
                ? <Typography key={item.key} color="text.primary" fontSize={14}>{item.label}</Typography>
                : (
                    <Link
                        key={item.key}
                        href={item.href || '#'}
                        underline="hover"
                        color="text.secondary"
                        fontSize={14}
                        onClick={e => { if (onAction) { e.preventDefault(); onAction(item.key); } }}
                        sx={{ cursor: 'pointer' }}
                    >
                        {item.label}
                    </Link>
                )
            )}
        </MuiBreadcrumbs>
    );
}
