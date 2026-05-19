<script setup lang="ts">
import { ref } from 'vue';
import { Checkbox } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBoxStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const CHECKBOX_API: ApiRow[] = [
    { prop: 'options', desc: '选项列表', type: 'CheckboxOption[]', defaultVal: '-', required: true },
    { prop: 'modelValue', desc: '受控选中值列表（v-model）', type: 'Array<string | number>', defaultVal: '[]' },
    { prop: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    { prop: 'disabled', desc: '禁用全部选项', type: 'boolean', defaultVal: 'false' },
    { prop: 'direction', desc: '排列方向', type: "'horizontal' | 'vertical'", defaultVal: "'horizontal'" },
    { prop: '@change', desc: '选中值变化回调', type: '(values) => void', defaultVal: '-' },
];

const islandOptions = [
    { label: '🌊 海滩', value: 'beach' },
    { label: '🌳 森林', value: 'forest' },
    { label: '🌸 花园', value: 'garden' },
    { label: '🏡 村庄', value: 'village' },
];

const critterOptions = [
    { label: '🦋 蝴蝶', value: 'butterfly' },
    { label: '🐟 鲈鱼', value: 'bass' },
    { label: '🦀 螃蟹', value: 'crab', disabled: true },
    { label: '🐛 毛毛虫', value: 'caterpillar' },
    { label: '🌊 水母', value: 'jellyfish' },
];

const selected1 = ref<(string | number)[]>(['beach', 'garden']);
const selected2 = ref<(string | number)[]>([]);
const selected3 = ref<(string | number)[]>(['forest']);
const selected4 = ref<(string | number)[]>(['beach']);
const selected5 = ref<(string | number)[]>(['beach']);
const selected6 = ref<(string | number)[]>(['garden', 'village']);

import { demoBoxStyle as demoBox } from '../tools';

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Checkbox } from 'animal-island-vue';

const options = [
    { label: '🌊 海滩', value: 'beach' },
    { label: '🌳 森林', value: 'forest' },
];
const value = ref(['beach']);
<\/script>

<template>
    <Checkbox v-model="value" :options="options" />
    <Checkbox :options="options" direction="vertical" />
    <Checkbox :options="options" disabled />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Checkbox <span :style="tagStyle">基础用法</span>
        </div>

        <div :style="labelStyle">默认水平排列（受控）</div>
        <div :style="{ marginBottom: '8px', fontSize: '13px', color: '#a08060' }">
            已选中:
            <span :style="{ color: '#19c8b9', fontWeight: 600 }">
                {{ selected1.length > 0 ? islandOptions.filter(o => selected1.includes(o.value)).map(o => o.label).join('、') : '无' }}
            </span>
        </div>
        <div :style="demoBox">
            <Checkbox v-model="selected1" :options="islandOptions" :style="{ gap: '20px' }" />
        </div>

        <div :style="labelStyle">垂直排列 + 含禁用选项</div>
        <div :style="demoBox">
            <Checkbox v-model="selected2" :options="critterOptions" direction="vertical" :style="{ gap: '12px' }" />
        </div>

        <div :style="labelStyle">小尺寸</div>
        <div :style="demoBox">
            <Checkbox v-model="selected3" :options="islandOptions" size="small" />
        </div>

        <div :style="labelStyle">中尺寸（默认）</div>
        <div :style="demoBox">
            <Checkbox v-model="selected4" :options="islandOptions" size="middle" />
        </div>

        <div :style="labelStyle">大尺寸</div>
        <div :style="demoBox">
            <Checkbox v-model="selected5" :options="islandOptions.slice(0, 3)" size="large" />
        </div>

        <div :style="labelStyle">全部禁用</div>
        <div :style="demoBox">
            <Checkbox v-model="selected6" :options="islandOptions" disabled />
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="CHECKBOX_API" />
    </div>
</template>
