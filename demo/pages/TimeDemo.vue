<script setup lang="ts">
import { Time } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const TIME_API: ApiRow[] = [
    { prop: '-', desc: '该组件无 props，自动每秒更新', type: '-', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { Time } from 'animal-island-vue';
<\/script>

<template>
    <Time />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Time <span :style="tagStyle">时间</span>
        </div>
        <div :style="labelStyle">
            Time 组件 — 动森经典 HUD 风格的时间显示组件，实时更新时间，支持星期、日期和时间显示。
        </div>
        <div :style="demoBodyStyle">
            <Time />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="TIME_API" />
    </div>
</template>
