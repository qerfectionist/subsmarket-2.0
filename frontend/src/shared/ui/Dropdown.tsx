import * as React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
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
    placement?: string;
    className?: string;
}

export function Dropdown({ trigger, items, onAction, className }: DropdownProps) {
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
    const handleClose = () => setAnchor(null);

    return (
        <>
            {React.cloneElement(trigger as React.ReactElement<any>, {
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                    const originalOnClick = (trigger as React.ReactElement<any>).props.onClick;
                    if (originalOnClick) originalOnClick(e);
                    handleOpen(e);
                }
            })}
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={handleClose}
                className={className}
                slotProps={{ paper: { sx: { bgcolor: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 } } }}
            >
                {items.map(item => (
                    <MenuItem
                        key={item.key}
                        disabled={item.isDisabled}
                        onClick={() => {
                            triggerHaptic('light');
                            onAction(item.key);
                            handleClose();
                        }}
                        sx={{ color: item.color === 'danger' ? 'error.main' : undefined }}
                    >
                        {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                        <ListItemText
                            primary={item.label}
                            secondary={item.description}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
