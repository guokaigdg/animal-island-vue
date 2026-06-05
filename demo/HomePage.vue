<script setup lang="ts">
import { ref } from 'vue';
import { Card, Divider, Button, Typewriter } from '../src';
import { useIsMobile } from './router';
import FeatureCard from './FeatureCard.vue';

import animalIconUrl from './img/animal_icon.png';
import nook1Url from './img/nook-phone/nook1.svg';
import shoppingUrl from './img/nook-phone/Property-Shopping.svg';
import cameraUrl from './img/nook-phone/Property-Camera.svg';
import recipesUrl from './img/nook-phone/Property-Recipes.svg';

const emit = defineEmits<{ navigate: [path: string] }>();
const isMobile = useIsMobile();
const showScrollHint = ref(true);
const pageRef = ref<HTMLDivElement | null>(null);

function handleScroll() {
    if (!pageRef.value) return;
    showScrollHint.value = pageRef.value.scrollTop <= 70;
}

function openGithub() {
    window.open('https://github.com/guokaigdg/animal-island-vue', '_blank');
}

const features = [
    { icon: nook1Url, title: 'Animal风格', desc: 'SVG 有机形状裁切，3D 按压按钮，温暖质朴的自然 UI 质感' },
    { icon: shoppingUrl, title: '19 个组件', desc: 'Button / Input / Switch / Modal / Typewriter / Card / Collapse / Cursor / Divider / Time / Phone / Footer / Icon / Checkbox / Select / Tabs / CodeBlock / Loading / Table' },
    { icon: cameraUrl, title: '主题定制', desc: '基于 Less 变量 + CSS 自定义属性，40+ 设计令牌运行时换肤无需重新构建' },
    { icon: recipesUrl, title: '开箱即用', desc: 'ESM + CJS 双格式输出，TypeScript 类型声明完整' },
];

const components = [
    { key: 'button', name: 'Button', desc: '5 种类型、3 种尺寸、加载/危险/幽灵模式' },
    { key: 'input', name: 'Input', desc: '前后缀、一键清空、校验状态' },
    { key: 'switch', name: 'Switch', desc: '受控/非受控、自定义文案、加载状态' },
    { key: 'checkbox', name: 'Checkbox', desc: '多选框组件，支持水平/垂直排列' },
    { key: 'select', name: 'Select', desc: '下拉选择器，支持搜索和禁用' },
    { key: 'tabs', name: 'Tabs', desc: '标签页组件，支持受控/非受控模式' },
    { key: 'modal', name: 'Modal', desc: 'SVG 有机形状弹窗、ESC 关闭' },
    { key: 'typewriter', name: 'Typewriter', desc: '逐字打字机效果，支持多行与富内容' },
    { key: 'card', name: 'Card', desc: '默认/标题两种卡片风格' },
    { key: 'collapse', name: 'Collapse', desc: 'FAQ 折叠面板、平滑展开动画' },
    { key: 'cursor', name: 'Cursor', desc: '自定义手指光标，支持多种尺寸' },
    { key: 'divider-comp', name: 'Divider', desc: '装饰性水平分割线' },
    { key: 'icon', name: 'Icon', desc: 'SVG 图标库' },
    { key: 'footer', name: 'Footer', desc: '页脚组件' },
    { key: 'time', name: 'Time', desc: '可爱风格时间显示' },
    { key: 'phone', name: 'Phone', desc: 'Phone 模拟器' },
    { key: 'codeblock', name: 'CodeBlock', desc: '代码语法高亮组件' },
    { key: 'loading', name: 'Loading', desc: '动森风格小岛加载动画' },
    { key: 'table', name: 'Table', desc: '泛型表格、悬浮动画、加载/空态' },
];

const installCode = `// 使用 npm 安装\nnpm install animal-island-vue`;
const usageCode = `// 1. 引入组件\nimport { Button, Modal, Switch } from 'animal-island-vue';\nimport 'animal-island-vue/style';\n\n<template>\n    <Button>开始</Button>\n</template>`;
const themeCode = `/* 覆盖 CSS 自定义属性即可换肤 */\n:root {\n    --animal-primary-color: #19c8b9;\n    --animal-text-color: #827157;\n    --animal-font-family: 'Noto Sans SC', sans-serif;\n    --animal-border-radius-base: 18px;\n    /* ... 40+ 设计令牌 */\n}`;

// React 版自定义代码块的精确像素：13px / lh 1.8 / 20px 28px padding / 20px radius
type Seg = { text: string; color?: string };
const HL: { re: RegExp; color: string }[] = [
    { re: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, color: '#6b5e50' },
    { re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, color: '#a8d4a0' },
    { re: /(<\/?[\w.]+|\/?>)/g, color: '#f0a870' },
    { re: /\b(import|from|const|let|var|function|return|export|default|true|false|null|undefined)\b/g, color: '#d4a0e0' },
    { re: /\b(npm|yarn|pnpm)\b/g, color: '#f0a870' },
    { re: /(install|uninstall|run|add|remove)\b/g, color: '#a8d4a0' },
    { re: /(\{|\})/g, color: '#d4b896' },
    { re: /(=>)/g, color: '#d4a0e0' },
    { re: /(--[\w-]+)(?=\s*:)/g, color: '#e8c87a' },
    { re: /(:root)/g, color: '#f0a870' },
    { re: /(#[0-9a-fA-F]{3,8})\b/g, color: '#8ab8e0' },
];

function highlight(code: string): Seg[][] {
    return code.split('\n').map(line => {
        const segs: { start: number; end: number; color: string }[] = [];
        for (const t of HL) {
            const re = new RegExp(t.re.source, t.re.flags);
            let m: RegExpExecArray | null;
            while ((m = re.exec(line)) !== null) {
                const text = m[1] ?? m[0];
                const start = m.index + (m[1] ? m[0].indexOf(text) : 0);
                segs.push({ start, end: start + text.length, color: t.color });
            }
        }
        segs.sort((a, b) => a.start - b.start);
        const merged: typeof segs = [];
        for (const s of segs) {
            if (!merged.length || s.start >= merged[merged.length - 1].end) merged.push(s);
        }
        const out: Seg[] = [];
        let i = 0;
        for (const s of merged) {
            if (s.start > i) out.push({ text: line.slice(i, s.start) });
            out.push({ text: line.slice(s.start, s.end), color: s.color });
            i = s.end;
        }
        if (i < line.length) out.push({ text: line.slice(i) });
        return out;
    });
}
</script>

<template>
    <div ref="pageRef" class="page" @scroll="handleScroll">
        <!-- Hero -->
        <div class="hero">
            <div :class="isMobile ? 'hero-content-mobile' : 'hero-content'">
                <div v-if="isMobile" style="text-align:center">
                    <img :src="animalIconUrl" style="width:180px;height:112px" alt="logo" decoding="async" />
                </div>
                <div :class="isMobile ? 'hero-text-center' : 'hero-text'">
                    <h1 class="hero-title" :style="{ fontSize: isMobile ? '37px' : '60px' }">
                        <template v-if="isMobile">Animal Island UI</template>
                        <template v-else>Animal <br /> Island UI</template>
                        <span class="hero-version">v0.1.0</span>
                    </h1>
                    <Typewriter :speed="60">
                        <p class="hero-subtitle" :style="{ fontSize: isMobile ? '14px' : '17px' }">
                            Animal 风格的 Vue 3 组件库，基于 TypeScript + Vite + Less 构建，让 Web 应用充满温暖质感
                        </p>
                    </Typewriter>
                    <div class="hero-actions" :style="{ justifyContent: isMobile ? 'center' : 'flex-start' }">
                        <Button type="primary" size="large" @click="emit('navigate', '/button')">
                            开始使用 →
                        </Button>
                    </div>
                </div>
                <div v-if="!isMobile" style="text-align:center">
                    <img :src="animalIconUrl" style="width:320px;height:200px" alt="logo" decoding="async" />
                </div>
            </div>
        </div>

        <div
            class="scroll-hint"
            :style="{
                animation: showScrollHint ? 'bounce 2s ease-in-out infinite' : 'none',
                opacity: showScrollHint ? 1 : 0,
                pointerEvents: showScrollHint ? 'auto' : 'none',
            }"
        >
            <span>向下滑动</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="#FFF9E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>

        <!-- Features -->
        <div class="section" :style="{ padding: isMobile ? '32px 16px' : '48px 40px' }">
            <div class="section-title">特性</div>
            <div class="section-desc">为什么选择 animal-island-vue</div>
            <div class="features">
                <FeatureCard v-for="f in features" :key="f.title" :feature="f" />
            </div>
        </div>

        <Divider :style="{ width: isMobile ? '90%' : '800px', margin: '0 auto' }" />

        <!-- Components -->
        <div class="section" :style="{ padding: isMobile ? '32px 16px' : '48px 40px' }">
            <div class="section-title">组件一览</div>
            <div class="section-desc">点击卡片查看详细文档和在线演示</div>
            <div class="comp-grid">
                <Card
                    v-for="c in components"
                    :key="c.key"
                    :style="{ padding: '16px 20px', cursor: 'pointer' }"
                    @click="emit('navigate', `/${c.key}`)"
                >
                    <div class="comp-name">{{ c.name }}</div>
                    <div class="comp-desc">{{ c.desc }}</div>
                </Card>
            </div>
        </div>

        <Divider :style="{ width: isMobile ? '90%' : '800px', margin: '0 auto' }" />

        <!-- Install -->
        <div class="section" :style="{ padding: isMobile ? '32px 16px' : '48px 40px' }">
            <div class="section-title">安装</div>
            <div class="section-desc">一行命令即可安装</div>
            <pre class="code-box"><template v-for="(line, li) in highlight(installCode)" :key="li"><span v-for="(seg, si) in line" :key="si" :style="seg.color ? { color: seg.color } : undefined">{{ seg.text }}</span><br v-if="li < highlight(installCode).length - 1" /></template></pre>
        </div>

        <Divider :style="{ width: isMobile ? '90%' : '800px', margin: '0 auto' }" />

        <!-- Quick Start -->
        <div class="section" :style="{ padding: isMobile ? '32px 16px' : '48px 40px' }">
            <div class="section-title">快速上手</div>
            <div class="section-desc">引入组件即可使用，样式自动加载</div>
            <pre class="code-box"><template v-for="(line, li) in highlight(usageCode)" :key="li"><span v-for="(seg, si) in line" :key="si" :style="seg.color ? { color: seg.color } : undefined">{{ seg.text }}</span><br v-if="li < highlight(usageCode).length - 1" /></template></pre>
        </div>

        <Divider :style="{ width: isMobile ? '90%' : '800px', margin: '0 auto' }" />

        <!-- Theme -->
        <div class="section" :style="{ padding: isMobile ? '32px 16px' : '48px 40px' }">
            <div class="section-title">主题定制</div>
            <div class="section-desc">通过覆盖 CSS 自定义属性实现运行时换肤，无需重新构建</div>
            <pre class="code-box"><template v-for="(line, li) in highlight(themeCode)" :key="li"><span v-for="(seg, si) in line" :key="si" :style="seg.color ? { color: seg.color } : undefined">{{ seg.text }}</span><br v-if="li < highlight(themeCode).length - 1" /></template></pre>
        </div>

        <!-- Footer -->
        <div class="page-footer" :style="{ padding: isMobile ? '24px 16px' : '32px 40px' }">
            <div class="footer-links">
                <span class="footer-link" @click="emit('navigate', '/button')">组件文档</span>
                <span class="footer-link" @click="openGithub">GitHub</span>
            </div>
            <div>MIT License · Vue 3 + TypeScript + Vite + Less</div>
        </div>
    </div>
</template>

<style scoped>
.page {
    width: 100%;
    height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
}

.hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 60px 40px 40px;
    position: relative;
}
.hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 150px;
    align-items: center;
    max-width: 880px;
    width: 100%;
}
.hero-content-mobile {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    align-items: center;
    max-width: 880px;
    width: 100%;
}
.hero-text { text-align: left; }
.hero-text-center { text-align: center; }

.hero-title {
    font-family: Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-weight: 800;
    line-height: 1.1;
    color: #FFF9E6;
    text-shadow: 0px 4px 1px rgba(0, 0, 0, 0.4);
    margin: 0 0 12px;
}
.hero-version {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 10px;
    background: #e6f9f6;
    color: #19c8b9;
    margin-left: 8px;
    vertical-align: middle;
    text-shadow: none;
}
.hero-subtitle {
    color: #7c5734;
    line-height: 1.7;
    margin: 0 0 28px;
    max-width: 520px;
}
.hero-actions {
    display: flex;
    gap: 16px;
    align-items: center;
}

.scroll-hint {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: opacity 0.3s ease;
    color: #FFF9E6;
    font-size: 12px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.section {
    max-width: 960px;
    margin: 0 auto;
}
.section-title {
    font-family: Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #725d42;
    margin: 0 0 8px;
    text-align: center;
}
.section-desc {
    font-size: 14px;
    color: #7c5734;
    text-align: center;
    margin-bottom: 32px;
}

.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.comp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}
.comp-name {
    font-size: 15px;
    font-weight: 700;
    color: #725d42;
    margin-bottom: 4px;
}
.comp-desc {
    font-size: 12px;
    color: #7c5734;
    line-height: 1.5;
}

.code-box {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px 28px;
    background: #2b2118;
    border: 1px solid #3d3028;
    border-radius: 20px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 13px;
    font-weight: 600;
    color: #e8d5bc;
    text-align: left;
    line-height: 1.8;
    white-space: pre;
    overflow: auto;
    tab-size: 4;
}

.page-footer {
    text-align: center;
    font-size: 12px;
    color: #7c5734;
    margin-top: 32px;
}
.footer-links {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 12px;
}
.footer-link {
    font-size: 13px;
    color: #7c5734;
    cursor: pointer;
}
</style>

<style>
/* 非 scoped：keyframes 需保持全局名称，否则内联 :style 中的 animation-name 无法匹配 */
@keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
    50% { transform: translateX(-50%) translateY(-8px); opacity: 0.7; }
}
</style>
