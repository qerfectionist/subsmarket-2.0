import { Skeleton as HeroSkeleton } from "@heroui/react";
import { cn } from '@/shared/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({ className, width, height, circle }: SkeletonProps) {
  return (
    <HeroSkeleton
      className={cn(
        circle ? "rounded-full" : "rounded-lg",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}
