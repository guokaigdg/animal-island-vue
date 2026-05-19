<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const checked = ref(false);
const inlineRow = { display: 'flex', gap: '16px', alignItems: 'center' };

const SWITCH_API: ApiRow[] = [
    { prop: 'modelValue / v-model', desc: '受控开关状态', type: 'boolean', defaultVal: '-' },
    { prop: 'defaultChecked', desc: '非受控默认值', type: 'boolean', defaultVal: 'false' },
    { prop: 'size', desc: '尺寸', type: `'small' | 'default'`, defaultVal: "'default'" },
    { prop: 'disabled', desc: '禁用', type: 'boolean', defaultVal: 'false' },
    { prop: 'loading', desc: '加载状态', type: 'boolean', defaultVal: 'false' },
    { prop: '#checked', desc: '选中文案 slot', type: 'slot', defaultVal: '-' },
    { prop: '#unchecked', desc: '未选中文案 slot', type: 'slot', defaultVal: '-' },
    { prop: '@change', desc: '变化事件', type: '(checked: boolean) => void', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from 'animal-island-vue';

const checked = ref(false);
<\/script>

<template>
    <Switch v-model="checked" />
    <Switch default-checked>
        <template #checked>开</template>
        <template #unchecked>关</template>
    </Switch>
    <Switch size="small" default-checked />
    <Switch disabled />
    <Switch loading default-checked />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Switch <span :style="tagStyle">2 sizes</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">基础用法</div>
            <div :style="inlineRow">
                <Switch v-model="checked" />
                <span :style="{ fontSize: '13px' }">{{ checked ? 'ON' : 'OFF' }}</span>
            </div>
            <div :style="labelStyle">checked / unchecked 自定义文案</div>
            <div :style="inlineRow">
                <Switch default-checked>
                    <template #checked>开</template>
                    <template #unchecked>关</template>
                </Switch>
            </div>
            <div :style="labelStyle">size 尺寸</div>
            <div :style="inlineRow">
                <Switch default-checked />
                <Switch size="small" default-checked />
            </div>
            <div :style="labelStyle">disabled / loading 状态</div>
            <div :style="inlineRow">
                <Switch disabled />
                <Switch loading default-checked />
            </div>
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="SWITCH_API" />
    </div>
</template>
