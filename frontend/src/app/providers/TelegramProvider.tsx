import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Type definition based on Telegram WebApp SDK
interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
        };
        start_param?: string;
    };
    version: string;
    platform: string;
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
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;
    BackButton: {
        isVisible: boolean;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
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
        showProgress: (leaveActive: boolean) => void;
        hideProgress: () => void;
    };
    HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        selectionChanged: () => void;
    };
    ready: () => void;
    expand: () => void;
    close: () => void;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
    }
}

interface TelegramContextType {
    webApp?: TelegramWebApp;
    user?: TelegramWebApp['initDataUnsafe']['user'];
    isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({ isReady: false });

export function TelegramProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const [webApp, setWebApp] = useState<TelegramWebApp | undefined>();

    useEffect(() => {
        const app = window.Telegram?.WebApp;
        
        if (app) {
            app.ready();
            app.expand(); // Auto-expand on launch
            setWebApp(app);
            setIsReady(true);

            // Sync theme with CSS variables for Tailwind
            const root = document.documentElement;
            const theme = app.themeParams;

            if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
            if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color);
            if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
            if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color);
            if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
            if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
            if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
        }
    }, []);

    return (
        <TelegramContext.Provider value={{ webApp, user: webApp?.initDataUnsafe?.user, isReady }}>
            {children}
        </TelegramContext.Provider>
    );
}

export const useTelegram = () => useContext(TelegramContext);
