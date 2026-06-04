import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default defineConfig({
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: true,
        allowedHosts: [
            '.trycloudflare.com',
            'dev.subsmarket.xyz',
        ],
        proxy: {
            '/api': {
                target: backendTarget,
                changeOrigin: true,
            },
            '/health': {
                target: backendTarget,
                changeOrigin: true,
            },
        },
    },
    build: {
        target: 'es2022',
        outDir: 'dist',
        sourcemap: false,
    },
});
