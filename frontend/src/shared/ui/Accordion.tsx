import * as React from 'react';
import { Accordion as MuiAccordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
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

export function Accordion({ items, defaultExpandedKeys = [], selectionMode = 'single', className }: AccordionProps) {
    const [expanded, setExpanded] = React.useState<string[]>(defaultExpandedKeys);

    const handleChange = (key: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
        triggerHaptic('light');
        if (selectionMode === 'single') {
            setExpanded(isExpanded ? [key] : []);
        } else {
            setExpanded(prev => isExpanded ? [...prev, key] : prev.filter(k => k !== key));
        }
    };

    return (
        <Box className={className} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map(item => (
                <MuiAccordion
                    key={item.key}
                    expanded={expanded.includes(item.key)}
                    onChange={handleChange(item.key)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '12px !important', '&:before': { display: 'none' }, border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                        <Typography fontWeight={600} fontSize={17}>{item.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography fontSize={15} color="text.secondary" lineHeight={1.7}>{item.content}</Typography>
                    </AccordionDetails>
                </MuiAccordion>
            ))}
        </Box>
    );
}

export interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

export function AccordionItem({ title, children, defaultOpen = false, className }: AccordionItemProps) {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
        <MuiAccordion
            expanded={open}
            onChange={(_, v) => { triggerHaptic('light'); setOpen(v); }}
            className={className}
            sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '12px !important', '&:before': { display: 'none' }, border: '1px solid rgba(255,255,255,0.06)' }}
        >
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography fontWeight={600} fontSize={17}>{title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography fontSize={15} color="text.secondary" lineHeight={1.7}>{children}</Typography>
            </AccordionDetails>
        </MuiAccordion>
    );
}
