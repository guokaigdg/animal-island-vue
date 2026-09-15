<script setup lang="ts">
import { Time } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const TIME_API: ApiRow[] = [
    { prop: '(attrs)', desc: '透传任意属性到根元素（如 class / style）', type: 'Record<string, unknown>', defaultVal: '-' },
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
        <div :style="sectionTitleStyle">Time <span :style="tagStyle">实时时钟</span></div>
        <div :style="labelStyle">Time 组件 — HUD 实时时钟，星期 / 月日 / HH:MM 展示，冒号每秒闪烁。</div>
        <div :style="demoBodyStyle">
            <Time />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="TIME_API" />
    </div>
</template>
