import * as React from 'react';
import { Chip, ChipProps } from "@heroui/react";
import { cn } from '@/shared/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {

  // Map variant to HeroUI Chip color/variant
  let color: ChipProps['color'] = 'default';

  switch (variant) {
    case 'success': color = 'success'; break;
    case 'warning': color = 'warning'; break;
    case 'error': color = 'danger'; break;
    case 'info': color = 'primary'; break; // or secondary
    case 'default': default: color = 'default'; break;
  }

  return (
    <Chip
      size={size}
      color={color}
      variant="flat" // flat looks closest to bg-color/20 text-color
      className={cn("font-medium", className)}
    >
      {children}
    </Chip>
  );
}
