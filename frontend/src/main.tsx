import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
// Nunito Variable — rounded-шрифт с поддержкой RU + KZ кириллицы (Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ)
import '@fontsource-variable/nunito';
import '@/app/styles/index.css';

// NOTE: Telegram WebApp initialization (ready/expand/setHeaderColor) is handled
// in useTelegram hook to avoid duplicate calls and keep a single source of truth.

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
