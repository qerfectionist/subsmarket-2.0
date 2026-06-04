import * as React from 'react';
import { Check, Circle } from 'lucide-react';
import { Box, Card, CardContent, Typography } from '@mui/material';

export interface TimelineItem {
    id: string;
    title: string;
    description?: string;
    time?: string;
    status: 'completed' | 'current' | 'pending';
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
}

export interface TimelineProps {
    items: TimelineItem[];
    className?: string;
}

const colorMap: Record<string, string> = {
    primary: '#2196F3', success: '#4CAF50', warning: '#FF9800', danger: '#F44336', default: '#9E9E9E',
};

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => (
    <Card className={className}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const color = colorMap[item.color || 'primary'];
                return (
                    <Box key={item.id} sx={{ position: 'relative', display: 'flex', gap: 2, p: 2 }}>
                        {!isLast && (
                            <Box sx={{ position: 'absolute', left: 27, top: 44, bottom: 0, width: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />
                        )}
                        <Box sx={{ position: 'relative', zIndex: 1, flexShrink: 0, mt: 0.25 }}>
                            {item.status === 'completed' && (
                                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <Check size={14} strokeWidth={3} />
                                </Box>
                            )}
                            {item.status === 'current' && (
                                <Box sx={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${color}`, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, animation: 'pulse 1.5s infinite' }} />
                                </Box>
                            )}
                            {item.status === 'pending' && (
                                <Box sx={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Circle size={8} style={{ opacity: 0.2 }} />
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                <Typography fontSize={14} fontWeight={600} color={item.status === 'pending' ? 'text.disabled' : 'text.primary'}>
                                    {item.title}
                                </Typography>
                                {item.time && <Typography variant="caption" color="text.disabled">{item.time}</Typography>}
                            </Box>
                            {item.description && (
                                <Typography variant="caption" color="text.secondary" mt={0.5} display="block" lineHeight={1.5}>
                                    {item.description}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            })}
        </CardContent>
    </Card>
);
