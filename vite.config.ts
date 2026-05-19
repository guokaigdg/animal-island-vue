import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 与 React 版保持一致：去掉 fontsource CSS 里 woff 备份，仅保留 woff2。
 */
function stripWoffFallbackPlugin(): Plugin {
    return {
        name: 'strip-woff-fallback',
        enforce: 'pre',
        transform(code, id) {
            if (!id.includes('@fontsource')) return null;
            if (!id.endsWith('.css') && !/\.css\?/.test(id)) return null;
            const transformed = code.replace(
                /,\s*url\([^)]+\.woff\)\s*format\(['"]woff['"]\)/g,
                '',
            );
            return transformed === code ? null : { code: transformed, map: null };
        },
        generateBundle(_, bundle) {
            for (const key of Object.keys(bundle)) {
                const asset = bundle[key];
                if (asset.type === 'asset' && /\.woff$/i.test(key)) {
                    delete bundle[key];
                }
            }
        },
    };
}

export default defineConfig({
    plugins: [
        vue(),
        stripWoffFallbackPlugin(),
        libAssetsPlugin({
            outputPath: 'files',
            name: '[name].[contenthash:8].[ext]',
            limit: 0,
        }),
        dts({
            entryRoot: 'src',
            outDir: 'dist/types',
            include: ['src/**/*.ts', 'src/**/*.vue'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
            tsconfigPath: 'tsconfig.build.json',
            staticImport: true,
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es', 'cjs'],
            fileName: (format) =>
                `${format === 'es' ? 'es' : 'cjs'}/index.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: ['vue'],
            // lib 模式同时输出 es + cjs，libAssetsPlugin 会在两个输出里 emit
            // 同名同内容的共享资源，触发 "overwrites a previously emitted file"
            // 警告。该警告无害（contenthash 一致即内容一致），这里直接过滤。
            onwarn(warning, defaultHandler) {
                if (
                    warning.message?.includes(
                        'overwrites a previously emitted file',
                    )
                ) {
                    return;
                }
                defaultHandler(warning);
            },
            output: {
                globals: { vue: 'Vue' },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.css')) return 'index.css';
                    return assetInfo.name!;
                },
            },
        },
        cssCodeSplit: false,
    },
});
