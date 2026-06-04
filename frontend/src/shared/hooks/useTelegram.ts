/**
 * Telegram WebApp integration hook
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface LocalTelegramWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    colorScheme: 'light' | 'dark';
    themeParams: {
        bg_color?: string;
        text_color?: string;
        hint_color?: string;
        link_color?: string;
        button_color?: string;
        button_text_color?: string;
        secondary_bg_color?: string;
    };
    initData: string;
    initDataUnsafe: {
        query_id?: string;
        user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
        };
        auth_date?: number;
        hash?: string;
    };
    BackButton: {
        isVisible: boolean;
        show: () => void;
        hide: () => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
    };
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        isProgressVisible: boolean;
        setText: (text: string) => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        enable: () => void;
        disable: () => void;
        showProgress: (leaveActive?: boolean) => void;
        hideProgress: () => void;
    };
    HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        selectionChanged: () => void;
    };
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    enableClosingConfirmation: () => void;
    disableClosingConfirmation: () => void;
    showPopup: (params: {
        title?: string;
        message: string;
        buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text?: string;
        }>;
    }, callback?: (buttonId: string) => void) => void;
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
    showAlert: (message: string, callback?: () => void) => void;
    isVersionAtLeast?: (version: string) => boolean;
}

/**
 * Hook for Telegram WebApp integration
 */
export function useTelegram() {
    const webapp = (window as any).Telegram?.WebApp as LocalTelegramWebApp | undefined;
    const navigate = useNavigate();

    // Initialize on mount
    useEffect(() => {
        if (webapp) {
            webapp.ready();
            webapp.expand();

            // Set theme colors
            webapp.setHeaderColor('#F5F4EF');
            webapp.setBackgroundColor('#F5F4EF');
        }
    }, [webapp]);

    // Back button handler
    const showBackButton = useCallback((onBack?: () => void) => {
        if (!webapp) return;

        const handler = () => {
            if (onBack) {
                onBack();
            } else {
                navigate(-1);
            }
        };

        webapp.BackButton.onClick(handler);
        webapp.BackButton.show();

        return () => {
            webapp.BackButton.offClick(handler);
            webapp.BackButton.hide();
        };
    }, [webapp, navigate]);

    // Main button
    const showMainButton = useCallback((
        text: string,
        onClick: () => void,
        options?: { disabled?: boolean; loading?: boolean }
    ) => {
        if (!webapp) return;

        webapp.MainButton.setText(text);
        webapp.MainButton.onClick(onClick);

        if (options?.disabled) {
            webapp.MainButton.disable();
        } else {
            webapp.MainButton.enable();
        }

        if (options?.loading) {
            webapp.MainButton.showProgress();
        } else {
            webapp.MainButton.hideProgress();
        }

        webapp.MainButton.show();

        return () => {
            webapp.MainButton.offClick(onClick);
            webapp.MainButton.hide();
        };
    }, [webapp]);

    const hideMainButton = useCallback(() => {
        webapp?.MainButton.hide();
    }, [webapp]);

    // Popup
    const showPopup = useCallback((message: string, title?: string) => {
        return new Promise<string>((resolve) => {
            if (webapp?.showPopup && webapp.isVersionAtLeast?.('6.2')) {
                webapp.showPopup({
                    title,
                    message,
                    buttons: [{ type: 'ok' }],
                }, (buttonId: string) => resolve(buttonId));
            } else {
                alert(message);
                resolve('ok');
            }
        });
    }, [webapp]);

    // Confirm
    const showConfirm = useCallback((message: string) => {
        return new Promise<boolean>((resolve) => {
            if (webapp?.showConfirm && webapp.isVersionAtLeast?.('6.2')) {
                webapp.showConfirm(message, (confirmed: boolean) => resolve(confirmed));
            } else {
                resolve(confirm(message));
            }
        });
    }, [webapp]);

    return {
        webapp,
        user: webapp?.initDataUnsafe?.user,
        colorScheme: webapp?.colorScheme || 'light',
        showBackButton,
        showMainButton,
        hideMainButton,
        showPopup,
        showConfirm,
    };
}
