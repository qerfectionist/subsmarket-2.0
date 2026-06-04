import { AvatarGroup as MuiAvatarGroup, Avatar as MuiAvatar, Box } from '@mui/material';

export interface AvatarGroupProps {
    avatars: { src?: string; alt?: string; fallback?: string }[];
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = { sm: 28, md: 36, lg: 48 };

export function AvatarGroup({ avatars, max = 3, size = 'md', className }: AvatarGroupProps) {
    const px = sizeMap[size] ?? 36;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} className={className}>
            <MuiAvatarGroup max={max} sx={{ '& .MuiAvatar-root': { width: px, height: px, fontSize: px * 0.38 } }}>
                {avatars.map((av, i) => (
                    <MuiAvatar key={i} src={av.src} alt={av.alt || av.fallback}>
                        {!av.src && (av.fallback || av.alt || '?')[0]?.toUpperCase()}
                    </MuiAvatar>
                ))}
            </MuiAvatarGroup>
        </Box>
    );
}
