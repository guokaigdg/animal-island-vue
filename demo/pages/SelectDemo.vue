<script setup lang="ts">
import { ref } from 'vue';
import { Select } from '../../src';
import type { SelectOption } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBoxStyle, demoDashedBoxStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const SELECT_API: ApiRow[] = [
    { prop: 'options', desc: '选项列表', type: 'SelectOption[]', defaultVal: '-', required: true },
    { prop: 'modelValue', desc: '当前选中值（v-model）', type: 'string', defaultVal: '-', required: true },
    { prop: 'placeholder', desc: '占位文本', type: 'string', defaultVal: "'请选择'" },
    { prop: 'disabled', desc: '禁用状态', type: 'boolean', defaultVal: 'false' },
];

const fishOptions: SelectOption[] = [
    { key: 'fish1', label: '鲈鱼' },
    { key: 'fish2', label: '鲷鱼' },
    { key: 'fish3', label: '草鱼' },
    { key: 'fish4', label: '龙睛鱼' },
    { key: 'fish5', label: '神仙鱼' },
];
const flowerOptions: SelectOption[] = [
    { key: 'flower1', label: '樱花' },
    { key: 'flower2', label: '玫瑰' },
    { key: 'flower3', label: '向日葵' },
    { key: 'flower4', label: '薰衣草' },
    { key: 'flower5', label: '郁金香' },
];
const fruitOptions: SelectOption[] = [
    { key: 'fruit1', label: '草莓' },
    { key: 'fruit2', label: '蓝莓' },
    { key: 'fruit3', label: '桃子' },
    { key: 'fruit4', label: '樱桃' },
    { key: 'fruit5', label: '猕猴桃' },
];

const value1 = ref('fish1');
const value2 = ref('');
const value3 = ref('flower2');
const value4 = ref('');

import { demoBoxStyle as demoBox } from '../tools';

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Select } from 'animal-island-vue';

const options = [
    { key: 'option1', label: '选项一' },
    { key: 'option2', label: '选项二' },
];
const value = ref('option1');
<\/script>

<template>
    <Select v-model="value" :options="options" />
    <Select :options="options" placeholder="请选择" />
    <Select :options="options" disabled />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Select <span :style="tagStyle">基础用法</span>
        </div>
        <div :style="labelStyle">默认状态</div>
        <div :style="{ marginBottom: '8px', fontSize: '13px', color: '#a08060' }">
            当前选中:
            <span :style="{ color: '#19c8b9', fontWeight: 600 }">{{ fishOptions.find(o => o.key === value1)?.label }}</span>
        </div>
        <div :style="demoBox">
            <Select v-model="value1" :options="fishOptions" />
        </div>
        <div :style="labelStyle">自定义占位文本</div>
        <div :style="demoDashedBoxStyle">
            <Select v-model="value2" :options="flowerOptions" placeholder="请选择花朵" />
            <Select v-model="value4" :options="fruitOptions" placeholder="请选择水果" />
        </div>
        <div :style="labelStyle">禁用状态</div>
        <div :style="demoBox">
            <Select v-model="value3" :options="flowerOptions" disabled />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="SELECT_API" />
    </div>
</template>
