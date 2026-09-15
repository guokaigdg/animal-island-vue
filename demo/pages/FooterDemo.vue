<script setup lang="ts">
import { Footer } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const FOOTER_API: ApiRow[] = [
    { prop: 'size', desc: '图标大小（px）', type: 'number', defaultVal: '24' },
    { prop: 'name', desc: '指定单一图标名，整条链仅用该图标铺满', type: 'IconName', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { Footer } from 'animal-island-vue';
<\/script>

<template>
    <Footer />
    <Footer :size="16" />
    <Footer name="Heart" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Footer <span :style="tagStyle">底部装饰</span></div>
        <div :style="labelStyle">Footer 组件 — 由全部内置图标相连组成的一条图标链，按容器宽度循环铺满。</div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">默认（全部 101 个图标）</div>
            <Footer />
        </div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">size=16</div>
            <Footer :size="16" />
        </div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">name=&quot;Heart&quot;（单一图标）</div>
            <Footer name="Heart" />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="FOOTER_API" />
    </div>
</template>
