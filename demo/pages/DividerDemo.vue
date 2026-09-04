<script setup lang="ts">
import { Divider } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const DIVIDER_API: ApiRow[] = [
    {
        prop: 'type',
        desc: '分隔线类型',
        type: `'dashed-brown' | 'dashed-teal' | 'dashed-white' | 'dashed-yellow'`,
        defaultVal: "'dashed-brown'",
    },
    { prop: 'class', desc: '自定义类名', type: 'string', defaultVal: '-' },
    { prop: 'style', desc: '自定义样式', type: 'string | object', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { Divider } from 'animal-island-vue';
<\/script>

<template>
    <!-- 虚线 -->
    <Divider type="dashed-brown" />
    <Divider type="dashed-teal" />
    <Divider type="dashed-white" />
    <Divider type="dashed-yellow" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Divider <span :style="tagStyle">4 types</span></div>
        <div :style="labelStyle">dashed-brown</div>
        <Divider type="dashed-brown" />
        <div :style="labelStyle">dashed-teal</div>
        <Divider type="dashed-teal" />
        <div :style="labelStyle">dashed-white</div>
        <div :style="{ background: '#333', padding: '10px' }">
            <Divider type="dashed-white" />
        </div>
        <div :style="labelStyle">dashed-yellow</div>
        <Divider type="dashed-yellow" />

        <CodeBlock :code="code" />
        <ApiTable :rows="DIVIDER_API" />
    </div>
</template>
