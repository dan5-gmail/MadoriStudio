import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path' // ★追加

// https://vite.dev/config/
export default defineConfig({
    base: '/MadoriStudio/',
    build: {
        outDir: 'docs',
        emptyOutDir: true,
    },
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            // ★ @ が src フォルダを指すように設定する
            '@': path.resolve(__dirname, './src'),
        },
    },
});