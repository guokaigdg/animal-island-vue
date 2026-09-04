<script setup lang="ts">
import { Footer } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const FOOTER_API: ApiRow[] = [{ prop: 'seamless', desc: '无缝拼接（圣诞树铺满整行）', type: 'boolean', defaultVal: 'false' }];

const code = `<script setup lang="ts">
import { Footer } from 'animal-island-vue';
<\/script>

<template>
    <Footer />
    <Footer seamless />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Footer <span :style="tagStyle">底部装饰</span></div>
        <div :style="labelStyle">Footer 组件 — 页面底部圣诞树装饰，一行 14 棵 🎄 居中排列。</div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">默认（居中）</div>
            <Footer />
        </div>
        <div :style="{ ...demoBodyStyle, padding: '40px 0' }">
            <div :style="labelStyle">seamless（铺满整行）</div>
            <Footer seamless />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="FOOTER_API" />
    </div>
</template>
