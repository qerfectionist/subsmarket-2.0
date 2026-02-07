import * as React from 'react';
import { useHaptic } from '@/shared/hooks/useHaptic';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, className }) => {
    const haptic = useHaptic();
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    // Simplified version without drag gesture for stability
    // Real implementation would need complex touch event handling
    const handleRefreshClick = async () => {
        haptic.impact('medium');
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    return (
        <div className={className}>
            {/* Manual refresh trigger for now */}
            <div className="flex justify-center py-2">
                <button 
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider disabled:opacity-50"
                >
                    {isRefreshing ? 'Refreshing...' : 'Tap to Refresh'}
                </button>
            </div>
            {children}
        </div>
    );
};
