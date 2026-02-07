import {
    Table as HeroTable,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    getKeyValue,
} from "@heroui/react";

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
    columns,
    rows,
    getRowKey,
    onRowClick,
    isStriped = false,
    isHeaderSticky = false,
    selectionMode = 'none',
    className,
    emptyContent = 'Нет данных'
}: TableProps<T>) {
    return (
        <HeroTable
            aria-label="Data table"
            isStriped={isStriped}
            isHeaderSticky={isHeaderSticky}
            selectionMode={selectionMode}
            className={className}
            classNames={{
                wrapper: "bg-content1 rounded-lg",
                th: "bg-default-100",
            }}
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.key} allowsSorting={column.allowsSorting}>
                        {column.label}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={rows} emptyContent={emptyContent}>
                {(item) => (
                    <TableRow
                        key={getRowKey(item)}
                        onClick={() => onRowClick?.(item)}
                        className={onRowClick ? 'cursor-pointer hover:bg-default-100' : ''}
                    >
                        {(columnKey) => (
                            <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </HeroTable>
    );
}

// Re-export for custom implementations
export { HeroTable as TableBase, TableHeader, TableColumn as HeroTableColumn, TableBody, TableRow, TableCell };
