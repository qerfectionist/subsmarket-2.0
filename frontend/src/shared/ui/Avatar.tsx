import { Avatar as HeroAvatar, AvatarProps as HeroAvatarProps } from "@heroui/react";

interface AvatarProps extends HeroAvatarProps {
  name?: string;
}

export function Avatar({ src, name, size = 'md', className, ...props }: AvatarProps) {
  return (
    <HeroAvatar
      src={src}
      name={name}
      size={size}
      className={className}
      showFallback={!src}
      {...props}
    />
  );
}
