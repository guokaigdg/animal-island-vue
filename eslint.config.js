import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

export default tseslint.config(
    // 忽略构建产物与依赖
    {
        ignores: [
            'dist/**',
            'demo-dist/**',
            'coverage/**',
            'node_modules/**',
            '*.config.js',
            '*.config.ts',
            // 第三方压缩库 + 对应声明文件（来自 Loading/island/）
            '**/*.min.js',
            '**/*.min.d.ts',
            'src/components/Loading/island/**',
        ],
    },

    // 基础规则
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // Vue 规则（用 vue-eslint-parser 解析 .vue 文件）
    ...vue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tseslint.parser,
                ecmaVersion: 2022,
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
        },
    },

    // 业务源码
    {
        files: ['src/**/*.{ts,vue}', 'demo/**/*.{ts,vue}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            // TypeScript 严格化（与 tsconfig strict 对齐）
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',

            // 通用代码质量
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'warn',
            eqeqeq: ['error', 'always'],

            // Vue 规则放宽（与 Vue 3 + script setup 风格对齐）
            'vue/max-attributes-per-line': 'off',
            'vue/no-multiple-template-root': 'off',
            'vue/no-unused-vars': 'warn',
            'vue/html-self-closing': 'off',
            'vue/attributes-order': 'warn',
            'vue/multi-word-component-names': 'off',
            // demo 与 NotificationView 中内嵌的 VNodeRenderer 等函数式组件是合理实践
            'vue/one-component-per-file': 'off',
            // Vue 3 严格类型 props 已表达 optional，强制 default 反而冗余
            'vue/require-default-prop': 'off',
            // CodeBlock 的 v-html 是设计意图（开发者已对内容做 sanitize）
            'vue/no-v-html': 'off',
            // 关掉所有与 prettier 冲突的格式化类规则，让 prettier 全权负责
            'vue/html-indent': 'off',
            'vue/script-indent': 'off',
            'vue/html-closing-bracket-newline': 'off',
            'vue/html-closing-bracket-spacing': 'off',
            'vue/html-newline': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            'vue/max-len': 'off',
            'vue/no-multi-spaces': 'off',
            'vue/no-spaces-around-equal-signs-in-attribute': 'off',
            'vue/object-curly-spacing': 'off',
            'vue/arrow-spacing': 'off',
            'vue/block-spacing': 'off',
            'vue/brace-style': 'off',
            'vue/comma-dangle': 'off',
            'vue/key-spacing': 'off',
            'vue/keyword-spacing': 'off',
            'vue/space-in-parens': 'off',
            'vue/space-unary-ops': 'off',
            'vue/spaced-comment': 'off',
            'vue/no-empty': 'off',
        },
    },

    // 测试文件放宽
    {
        files: ['**/*.test.ts', 'test/**/*.{ts,vue}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off',
        },
    },

    // 演示站点 —— 不进 npm 产物，规则放宽以保持 demo 代码简洁
    {
        files: ['demo/**/*.{ts,vue}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-console': 'off',
            'no-useless-escape': 'off',
        },
    },

    // 脚本目录 (Node ESM) —— 放行未用参数 / 显式 any
    {
        files: ['scripts/**/*.{js,mjs,cjs,ts}'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off',
        },
    }
);
