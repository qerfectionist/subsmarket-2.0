// import { clsx, type ClassValue } from 'clsx';
// import { twMerge } from 'tailwind-merge';

/**
 * Simple CN utility (Safe Mode)
 * Falls back to simple joining if libraries fail
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(' ');
}

/**
 * Format price
 */
export function formatPrice(amount: number, currency = 'KZT'): string {
    return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Haptic trigger helper
 */
export function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
}

export function triggerNotification(type: 'success' | 'warning' | 'error') {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    }
}

export function triggerSelection() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
}
