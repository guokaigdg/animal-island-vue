<script setup lang="ts">
import { Divider } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const DIVIDER_API: ApiRow[] = [
    { prop: 'type', desc: '分隔线类型', type: `'line-brown' | 'line-teal' | 'line-white' | 'line-yellow' | 'wave-yellow'`, defaultVal: "'line-brown'" },
];

const code = `<script setup lang="ts">
import { Divider } from 'animal-island-vue';
<\/script>

<template>
    <Divider type="line-brown" />
    <Divider type="line-teal" />
    <Divider type="line-white" />
    <Divider type="line-yellow" />
    <Divider type="wave-yellow" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Divider <span :style="tagStyle">5 types</span>
        </div>
        <div :style="labelStyle">line-brown</div>
        <Divider type="line-brown" />
        <div :style="labelStyle">line-teal</div>
        <Divider type="line-teal" />
        <div :style="labelStyle">line-white</div>
        <div :style="{ background: '#333', padding: '10px' }">
            <Divider type="line-white" />
        </div>
        <div :style="labelStyle">line-yellow</div>
        <Divider type="line-yellow" />
        <div :style="labelStyle">wave-yellow</div>
        <Divider type="wave-yellow" />
        <CodeBlock :code="code" />
        <ApiTable :rows="DIVIDER_API" />
    </div>
</template>
