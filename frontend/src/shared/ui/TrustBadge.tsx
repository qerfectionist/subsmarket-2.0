/**
 * TrustBadge Component
 * 
 * Displays user's trust score and badges according to PROJECT_MASTER rules:
 * - Trust Score: 1.0-5.0 (initial: 5.0)
 * - Badges: Новичок, Проверенный, Опытный, Золотой, Платиновый
 */
import { FC, memo, useMemo } from 'react';

// === Types ===

export interface TrustBadgeData {
    id: string;
    name: string;
    icon: string;
}

export interface TrustBadgeProps {
    trustScore: number;
    dealsCount: number;
    /** Show only the score without badges */
    compact?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Show deal count */
    showDeals?: boolean;
    /** Additional class name */
    className?: string;
}

// === Badge Logic (from PROJECT_MASTER) ===

const BADGES = {
    newbie: { id: 'newbie', name: 'Новичок', icon: '🆕' },
    verified: { id: 'verified', name: 'Проверенный', icon: '✅' },
    experienced: { id: 'experienced', name: 'Опытный продавец', icon: '🥉' },
    gold: { id: 'gold', name: 'Золотой продавец', icon: '🥇' },
    platinum: { id: 'platinum', name: 'Платиновый продавец', icon: '💎' },
    fastResponse: { id: 'fast_response', name: 'Быстро отвечает', icon: '⚡' },
    topWeek: { id: 'top_week', name: 'Топ недели', icon: '🔥' },
} as const;

/**
 * Calculate badges based on deals count and trust score
 * According to PROJECT_MASTER section 1.2
 */
function calculateBadges(dealsCount: number, trustScore: number): TrustBadgeData[] {
    const badges: TrustBadgeData[] = [];

    // Platinum (500+ deals, 5.0 score)
    if (dealsCount >= 500 && trustScore >= 5.0) {
        badges.push(BADGES.platinum);
    }
    // Gold (100+ deals, 4.8+ score)
    else if (dealsCount >= 100 && trustScore >= 4.8) {
        badges.push(BADGES.gold);
    }
    // Experienced (50+ deals, 4.5+ score)
    else if (dealsCount >= 50 && trustScore >= 4.5) {
        badges.push(BADGES.experienced);
    }
    // Verified (10+ deals, 4.5+ score)
    else if (dealsCount >= 10 && trustScore >= 4.5) {
        badges.push(BADGES.verified);
    }
    // Newbie (0 deals)
    else if (dealsCount === 0) {
        badges.push(BADGES.newbie);
    }

    return badges;
}

/**
 * Get score color based on trust level
 * According to PROJECT_MASTER:
 * - < 2.0: banned/restricted (red)
 * - < 3.0: warning (orange)
 * - >= 4.5: excellent (green)
 * - >= 3.0: normal (yellow/default)
 */
function getScoreColor(score: number): string {
    if (score >= 4.5) return 'text-green-400';
    if (score >= 3.5) return 'text-yellow-400';
    if (score >= 2.0) return 'text-orange-400';
    return 'text-red-400';
}

function getScoreBgColor(score: number): string {
    if (score >= 4.5) return 'bg-green-500/20';
    if (score >= 3.5) return 'bg-yellow-500/20';
    if (score >= 2.0) return 'bg-orange-500/20';
    return 'bg-red-500/20';
}

// === Size Styles ===

const sizeStyles = {
    sm: {
        container: 'gap-1',
        score: 'text-xs',
        deals: 'text-xs',
        badge: 'text-sm',
    },
    md: {
        container: 'gap-1.5',
        score: 'text-sm font-medium',
        deals: 'text-xs',
        badge: 'text-base',
    },
    lg: {
        container: 'gap-2',
        score: 'text-base font-semibold',
        deals: 'text-sm',
        badge: 'text-lg',
    },
};

// === Component ===

export const TrustBadge: FC<TrustBadgeProps> = memo(({
    trustScore,
    dealsCount,
    compact = false,
    size = 'md',
    showDeals = true,
    className = '',
}) => {
    const badges = useMemo(
        () => calculateBadges(dealsCount, trustScore),
        [dealsCount, trustScore]
    );

    const styles = sizeStyles[size];
    // Force convert to number to handle API string responses
    const safeScore = Number(trustScore ?? 5.0);
    const safeDeals = Number(dealsCount ?? 0);
    const scoreColor = getScoreColor(safeScore);
    const scoreBg = getScoreBgColor(safeScore);

    return (
        <div className={`inline-flex items-center ${styles.container} ${className}`}>
            {/* Trust Score */}
            <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${scoreBg}`}
            >
                <span className="text-yellow-400">⭐</span>
                <span className={scoreColor + ' ' + styles.score}>
                    {safeScore.toFixed(1)}
                </span>
            </span>

            {/* Deal Count */}
            {showDeals && (
                <span className={`text-gray-400 ${styles.deals}`}>
                    ({safeDeals})
                </span>
            )}

            {/* Badges */}
            {!compact && badges.length > 0 && (
                <span className={`${styles.badge}`} title={badges[0].name}>
                    {badges[0].icon}
                </span>
            )}
        </div>
    );
});

TrustBadge.displayName = 'TrustBadge';

// === Detailed Trust Badge ===

export interface TrustBadgeDetailedProps {
    trustScore: number;
    dealsCount: number;
    successRate?: number;
    scamReports?: number;
    memberSince?: string;
    className?: string;
}

/**
 * Detailed trust card for profile pages
 */
export const TrustBadgeDetailed: FC<TrustBadgeDetailedProps> = memo(({
    trustScore,
    dealsCount,
    successRate = 100,
    scamReports = 0,
    memberSince,
    className = '',
}) => {
    const safeScore = Number(trustScore ?? 5.0);
    const safeDeals = Number(dealsCount ?? 0);

    const badges = useMemo(
        () => calculateBadges(safeDeals, safeScore),
        [safeDeals, safeScore]
    );

    const scoreColor = getScoreColor(safeScore);
    const isLowScore = safeScore < 3.0;

    return (
        <div className={`bg-slate-800/50 rounded-xl p-4 ${className}`}>
            {/* Header with score */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Рейтинг доверия</h3>
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-xl">⭐</span>
                    <span className={`text-2xl font-bold ${scoreColor}`}>
                        {safeScore.toFixed(1)}
                    </span>
                </div>
            </div>

            {/* Warning for low score */}
            {isLowScore && (
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
                    <p className="text-orange-400 text-sm">
                        ⚠️ Низкий рейтинг. Пользователь может быть ненадёжным.
                    </p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-xl font-bold text-white">{safeDeals}</div>
                    <div className="text-xs text-gray-400">Сделок</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{successRate}%</div>
                    <div className="text-xs text-gray-400">Успешных</div>
                </div>
                <div className="text-center">
                    <div className={`text-xl font-bold ${scamReports > 0 ? 'text-red-400' : 'text-white'}`}>
                        {scamReports}
                    </div>
                    <div className="text-xs text-gray-400">Жалоб</div>
                </div>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {badges.map((badge) => (
                        <span
                            key={badge.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700/50 rounded-full text-sm"
                        >
                            <span>{badge.icon}</span>
                            <span className="text-gray-300">{badge.name}</span>
                        </span>
                    ))}
                </div>
            )}

            {/* Member since */}
            {memberSince && (
                <div className="text-xs text-gray-500 text-center">
                    На платформе с {new Date(memberSince).toLocaleDateString('ru-RU', {
                        month: 'long',
                        year: 'numeric'
                    })}
                </div>
            )}
        </div>
    );
});

TrustBadgeDetailed.displayName = 'TrustBadgeDetailed';

export default TrustBadge;
