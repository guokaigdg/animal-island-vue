<script setup lang="ts">
import { Footer } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const FOOTER_API: ApiRow[] = [
    { prop: 'type', desc: 'Footer 类型', type: "'sea' | 'tree'", defaultVal: "'tree'" },
];

const code = `<script setup lang="ts">
import { Footer } from 'animal-island-vue';
<\/script>

<template>
    <Footer />
    <Footer type="sea" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Footer <span :style="tagStyle">底部装饰</span>
        </div>
        <div :style="labelStyle">
            Footer 组件 — 页面底部装饰图片，支持 sea（海）和 tree（树）两种类型。
        </div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">tree 类型（默认）</div>
            <Footer />
        </div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">sea 类型</div>
            <Footer type="sea" />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="FOOTER_API" />
    </div>
</template>
