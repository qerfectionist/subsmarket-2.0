import * as React from 'react';
import { Chip } from '@mui/material';
import { cn } from '@/shared/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const colorMap = {
  default: 'default',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'primary',
} as const;

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <Chip
      label={children}
      size={size === 'sm' ? 'small' : 'medium'}
      color={colorMap[variant]}
      variant="outlined"
      className={cn('font-medium', className)}
    />
  );
}
