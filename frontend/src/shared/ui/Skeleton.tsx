import { Skeleton as MuiSkeleton } from '@mui/material';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({ className, width, height, circle }: SkeletonProps) {
  return (
    <MuiSkeleton
      variant={circle ? 'circular' : 'rectangular'}
      width={width}
      height={height}
      className={className}
      sx={{ borderRadius: circle ? '50%' : 1.5 }}
    />
  );
}
