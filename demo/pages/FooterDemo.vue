<script setup lang="ts">
import { Footer } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const FOOTER_API: ApiRow[] = [
    { prop: 'text', desc: '版权文案，默认 All Rights Reserved.', type: 'string', defaultVal: 'All Rights Reserved.' },
    { prop: 'year', desc: '年份，默认取当前年份（动态获取）', type: 'number', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { Footer } from 'animal-island-vue';
<\/script>

<template>
    <Footer />                     {/* © 2026 All Rights Reserved. */}
    <Footer text="Pocket Projects Inc." />  {/* 自定义文案 */}
    <Footer text="Acme" :year="2020" />     {/* 自定义年份 */}
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Footer <span :style="tagStyle">版权栏</span></div>
        <div :style="labelStyle">
            Footer 版权栏 — 默认展示 © 当前年份 All Rights Reserved.，年份动态获取、文案可传参自定义。
        </div>

        <div :style="labelStyle">默认</div>
        <div :style="demoBodyStyle">
            <Footer />
        </div>

        <div :style="labelStyle">自定义文案</div>
        <div :style="demoBodyStyle">
            <Footer text="Pocket Projects Inc." />
        </div>

        <div :style="labelStyle">自定义年份</div>
        <div :style="demoBodyStyle">
            <Footer text="Acme Ltd." :year="2020" />
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="FOOTER_API" />
    </div>
</template>
