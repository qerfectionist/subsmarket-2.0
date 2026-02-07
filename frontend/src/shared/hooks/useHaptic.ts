/**
 * Hook for Telegram WebApp haptic feedback.
 * Provides tactile feedback on user interactions.
 */
export function useHaptic() {
    const tg = window.Telegram?.WebApp;

    return {
        /**
         * Impact feedback - for UI interactions
         * @param style - 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
         */
        impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
            tg?.HapticFeedback?.impactOccurred(style);
        },

        /**
         * Notification feedback - for success/error/warning
         * @param type - 'success' | 'warning' | 'error'
         */
        notification: (type: 'success' | 'warning' | 'error') => {
            tg?.HapticFeedback?.notificationOccurred(type);
        },

        /**
         * Selection feedback - for selection changes
         */
        selection: () => {
            tg?.HapticFeedback?.selectionChanged();
        },
    };
}
