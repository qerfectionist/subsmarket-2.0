import * as React from 'react';
import {
    Table as MuiTable, TableHead, TableBody, TableRow,
    TableCell as MuiTableCell, TableContainer, Paper, Typography,
} from '@mui/material';

export interface TableColumn {
    key: string;
    label: string;
    allowsSorting?: boolean;
}

export interface TableProps<T> {
    columns: TableColumn[];
    rows: T[];
    getRowKey: (row: T) => string | number;
    onRowClick?: (row: T) => void;
    isStriped?: boolean;
    isHeaderSticky?: boolean;
    selectionMode?: 'none' | 'single' | 'multiple';
    className?: string;
    emptyContent?: React.ReactNode;
}

export function Table<T extends Record<string, any>>({
    columns, rows, getRowKey, onRowClick, isStriped = false,
    isHeaderSticky = false, className, emptyContent = 'Нет данных',
}: TableProps<T>) {
    return (
        <TableContainer component={Paper} className={className} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 3 }}>
            <MuiTable stickyHeader={isHeaderSticky} size="small">
                <TableHead>
                    <TableRow>
                        {columns.map(col => (
                            <MuiTableCell key={col.key} sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, bgcolor: 'rgba(255,255,255,0.06)' }}>
                                {col.label}
                            </MuiTableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <MuiTableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                                <Typography color="text.disabled">{emptyContent}</Typography>
                            </MuiTableCell>
                        </TableRow>
                    ) : rows.map((row, i) => (
                        <TableRow
                            key={getRowKey(row)}
                            hover={!!onRowClick}
                            onClick={() => onRowClick?.(row)}
                            sx={{
                                cursor: onRowClick ? 'pointer' : 'default',
                                bgcolor: isStriped && i % 2 === 1 ? 'rgba(255,255,255,0.02)' : undefined,
                            }}
                        >
                            {columns.map(col => (
                                <MuiTableCell key={col.key}>{row[col.key]}</MuiTableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </MuiTable>
        </TableContainer>
    );
}
