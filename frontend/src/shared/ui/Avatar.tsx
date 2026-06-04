import * as React from 'react';
import { Avatar as MuiAvatar } from '@mui/material';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const sizeMap = { sm: 32, md: 40, lg: 56 };

export function Avatar({ src, name, size = 'md', className, style }: AvatarProps) {
  const px = sizeMap[size] ?? 40;
  const initials = name ? name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : undefined;
  return (
    <MuiAvatar
      src={src}
      alt={name}
      className={className}
      style={style}
      sx={{ width: px, height: px, fontSize: px * 0.4 }}
    >
      {!src && initials}
    </MuiAvatar>
  );
}
