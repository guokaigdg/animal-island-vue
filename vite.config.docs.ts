import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: resolve(__dirname, 'demo'),
    publicDir: resolve(__dirname, 'demo/html'),
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        host: true,
        port: 5173,
    },
    build: {
        outDir: resolve(__dirname, 'demo-dist'),
        emptyOutDir: true,
    },
});
