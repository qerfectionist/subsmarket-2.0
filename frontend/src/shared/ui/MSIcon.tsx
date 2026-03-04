import { cn } from '@/shared/lib/utils';

// ─── MSIcon ────────────────────────────────────────────────────────────────────
// Material Symbols Rounded variable font wrapper.
// Requires the font to be loaded in index.html via Google Fonts.
//
// Usage:
//   <MSIcon name="home" />
//   <MSIcon name="arrow_back" size={20} filled className="text-primary" />

export interface MSIconProps {
    /** Icon name from Material Symbols catalogue: https://fonts.google.com/icons */
    name: string;
    /** Filled (true) or Outline (false). Default: false */
    filled?: boolean;
    /** Font size in px. Default: 24 */
    size?: number;
    /** Extra Tailwind classes (e.g. color, margin) */
    className?: string;
    /** Font weight axis 100–700. Default: filled→500, outline→350 */
    weight?: number;
}

export function MSIcon({ name, filled = true, size = 24, className, weight }: MSIconProps) {
    const w = weight ?? (filled ? 500 : 350);
    return (
        <span
            className={cn('material-symbols-rounded select-none leading-none', className)}
            style={{
                fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${w}, 'GRAD' 0, 'opsz' ${size}`,
                fontSize: size,
                lineHeight: 1,
            }}
            aria-hidden="true"
        >
            {name}
        </span>
    );
}
