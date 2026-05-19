<script setup lang="ts">
import { Phone } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const PHONE_API: ApiRow[] = [
    { prop: '-', desc: '该组件无 props', type: '-', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { Phone } from 'animal-island-vue';
<\/script>

<template>
    <Phone />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Phone <span :style="tagStyle">手机</span>
        </div>
        <div :style="labelStyle">Phone 组件 — 手机界面组件。</div>
        <div :style="{ ...demoBodyStyle, transform: 'scale(0.6)', transformOrigin: 'top left', height: '473px' }">
            <Phone />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="PHONE_API" />
    </div>
</template>
