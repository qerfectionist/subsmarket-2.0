import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
// Nunito Variable — rounded-шрифт с поддержкой RU + KZ кириллицы (Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ)
import '@fontsource-variable/nunito';
import '@/app/styles/index.css';

// Initialize Telegram WebApp
const tg = (window as any).Telegram?.WebApp as any;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#000000');
    tg.setBackgroundColor('#000000');
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);

