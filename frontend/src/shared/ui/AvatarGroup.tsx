import { AvatarGroup as HeroAvatarGroup, Avatar } from "@heroui/react";

export interface AvatarGroupProps {
    avatars: { src?: string; alt?: string; fallback?: string }[];
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function AvatarGroup({
    avatars,
    max = 3,
    size = 'md',
    className
}: AvatarGroupProps) {
    return (
        <HeroAvatarGroup
            max={max}
            size={size}
            className={className}
            renderCount={(count) => (
                <p className="text-small text-foreground font-medium ms-2">+{count}</p>
            )}
        >
            {avatars.map((avatar, i) => (
                <Avatar
                    key={i}
                    src={avatar.src}
                    name={avatar.fallback || avatar.alt}
                    showFallback={!avatar.src}
                />
            ))}
        </HeroAvatarGroup>
    );
}
