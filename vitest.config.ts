import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
const vuePlugin = vue() as never;

export default defineConfig({
    plugins: [vuePlugin],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.test.ts'],
        // 默认 + 自定义 table reporter 并行输出
        reporters: ['default', './scripts/vitest-table-reporter.mjs'],
    },
});
