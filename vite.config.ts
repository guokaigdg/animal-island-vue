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

/**
 * 为 `animal-island-vue/style` 子路径产出空的 .d.ts，
 * 避免下游 TS 项目报 "找不到模块" 的类型错误。
 */
function emitStyleDtsPlugin(): Plugin {
    let emitted = false;
    return {
        name: 'emit-style-dts',
        apply: 'build',
        generateBundle() {
            if (emitted) return;
            emitted = true;
            this.emitFile({
                type: 'asset',
                fileName: 'style.d.ts',
                source:
                    '// Side-effect only stylesheet entry. No runtime exports.\nexport {};\n',
            });
        },
    };
}

// ============================================================
// 双 build 配置：
//   - 默认 (mode=es)  : ES 产物 + preserveModules，每个 .vue/.css 独立
//                       chunk，配合 package.json 的 sideEffects 实现下游
//                       JS + CSS 的真正按需加载。
//   - mode=cjs        : 单 bundle CJS 产物，并把所有样式聚合为
//                       dist/index.css，保留向后兼容的
//                       `import 'animal-island-vue/style'` 用法。
// ============================================================
export default defineConfig(({ mode }) => {
    const isCjs = mode === 'cjs';

    return {
        plugins: [
            vue(),
            stripWoffFallbackPlugin(),
            // 仅在 ES 一次构建里产出 d.ts 与 style.d.ts，避免重复
            ...(isCjs
                ? []
                : [
                      emitStyleDtsPlugin(),
                      dts({
                          entryRoot: 'src',
                          outDir: 'dist/types',
                          include: ['src/**/*.ts', 'src/**/*.vue'],
                          exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
                          tsconfigPath: 'tsconfig.build.json',
                          staticImport: true,
                      }),
                  ]),
            libAssetsPlugin({
                outputPath: 'files',
                name: '[name].[contenthash:8].[ext]',
                limit: 0,
            }),
        ],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
            },
        },
        build: {
            // 第一次（ES）清空 dist，第二次（CJS）保留 ES 产物
            emptyOutDir: !isCjs,
            cssCodeSplit: !isCjs,
            lib: {
                entry: resolve(__dirname, 'src/index.ts'),
                formats: isCjs ? ['cjs'] : ['es'],
                fileName: () => (isCjs ? 'cjs/index.cjs' : 'es/index.js'),
            },
            rollupOptions: {
                external: ['vue'],
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
                output: isCjs
                    ? {
                          globals: { vue: 'Vue' },
                          // CJS 走聚合：所有样式合到 dist/index.css
                          assetFileNames: (assetInfo) => {
                              if (assetInfo.name?.endsWith('.css'))
                                  return 'index.css';
                              return assetInfo.name!;
                          },
                      }
                    : {
                          globals: { vue: 'Vue' },
                          // 关键：保留源码模块结构，让每个 .vue 独立产出
                          // .js + 同名 .css，下游就能只装 Button.css。
                          preserveModules: true,
                          preserveModulesRoot: 'src',
                          entryFileNames: 'es/[name].js',
                          // CSS / 字体等资源沿用 [name] 默认文件名以避免哈希漂移
                          assetFileNames: (assetInfo) => {
                              if (assetInfo.name?.endsWith('.css'))
                                  return 'es/[name][extname]';
                              return 'files/[name][extname]';
                          },
                      },
            },
        },
    };
});
