<script setup lang="ts">
import { Footer } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const FOOTER_API: ApiRow[] = [
    { prop: 'text', desc: '版权文案，默认 All Rights Reserved.', type: 'string', defaultVal: "'All Rights Reserved.'" },
    { prop: 'year', desc: '年份，缺省取当前年份（动态获取）', type: 'number', defaultVal: '-' },
    { prop: 'className', desc: '自定义类名（attribute 透传）', type: 'string', defaultVal: '-' },
    { prop: 'style', desc: '自定义样式（attribute 透传）', type: 'CSSProperties', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { Footer } from 'animal-island-vue';
<\/script>

<template>
    <Footer />
    <Footer text="Pocket Projects Inc." />
    <Footer text="Acme Ltd." :year="2020" :style="{ background: '#f7f3ea', borderRadius: '8px' }" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Footer <span :style="tagStyle">版权栏</span></div>
        <div :style="labelStyle">Footer 组件 — 版权栏，渲染「© 年份 文案」，年份缺省取当前年份。</div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">默认（当前年份 + All Rights Reserved.）</div>
            <Footer />
        </div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">text 自定义文案</div>
            <Footer text="Pocket Projects Inc." />
        </div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">year 自定义年份</div>
            <Footer text="Acme" :year="2020" />
        </div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">自定义年份 + style（背景 / 圆角透传）</div>
            <Footer text="Acme Ltd." :year="2020" :style="{ background: '#f7f3ea', borderRadius: '8px' }" />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="FOOTER_API" />
    </div>
</template>
