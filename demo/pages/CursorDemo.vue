<script setup lang="ts">
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const CURSOR_API: ApiRow[] = [
    { prop: 'default', desc: '子元素 slot', type: 'slot', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { Cursor } from 'animal-island-vue';
<\/script>

<template>
    <Cursor>
        <div>鼠标移入此区域将显示自定义光标</div>
    </Cursor>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Cursor <span :style="tagStyle">光标</span>
        </div>
        <p :style="labelStyle">
            Cursor 组件通过 CSS cursor 属性将子元素的鼠标光标替换为自定义手指图标，当前 Demo 全局已应用。
        </p>
        <CodeBlock :code="code" />
        <ApiTable :rows="CURSOR_API" />
    </div>
</template>
