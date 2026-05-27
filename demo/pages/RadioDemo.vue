<script setup lang="ts">
import { ref } from 'vue';
import { Radio } from '../../src';
import {
    sectionStyle,
    sectionTitleStyle,
    tagStyle,
    labelStyle,
    demoBoxStyle,
    ApiTable,
    CodeBlock,
} from '../tools';
import type { ApiRow } from '../tools';

const RADIO_API: ApiRow[] = [
    { prop: 'options', desc: '选项列表', type: 'RadioOption[]', defaultVal: '-', required: true },
    { prop: 'modelValue', desc: '受控选中值（v-model）', type: 'string | number', defaultVal: '-' },
    { prop: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    { prop: 'disabled', desc: '禁用全部选项', type: 'boolean', defaultVal: 'false' },
    { prop: 'direction', desc: '排列方向', type: "'horizontal' | 'vertical'", defaultVal: "'horizontal'" },
    { prop: '@change', desc: '选中值变化回调', type: '(value) => void', defaultVal: '-' },
];

const seasonOptions = [
    { label: '🌸 春天', value: 'spring' },
    { label: '☀️ 夏天', value: 'summer' },
    { label: '🍁 秋天', value: 'autumn' },
    { label: '❄️ 冬天', value: 'winter' },
];

const fruitOptions = [
    { label: '🍎 苹果', value: 'apple' },
    { label: '🍊 橙子', value: 'orange' },
    { label: '🍑 桃子', value: 'peach' },
    { label: '🍐 梨子', value: 'pear', disabled: true },
    { label: '🍒 樱桃', value: 'cherry' },
];

const timeOptions = [
    { label: '🌅 早晨', value: 'morning' },
    { label: '🌞 中午', value: 'noon' },
    { label: '🌇 傍晚', value: 'evening' },
    { label: '🌙 深夜', value: 'night' },
];

const selected1 = ref<string | number>('spring');
const selected2 = ref<string | number>('');
const selected3 = ref<string | number>('noon');
const selected4 = ref<string | number>('morning');
const selected5 = ref<string | number>('noon');
const selected6 = ref<string | number>('night');
const selected7 = ref<string | number>('winter');

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Radio } from 'animal-island-vue';

const options = [
    { label: '🌸 春天', value: 'spring' },
    { label: '☀️ 夏天', value: 'summer' },
];
const value = ref('spring');
<\/script>

<template>
    <Radio v-model="value" :options="options" />
    <Radio :options="options" direction="vertical" />
    <Radio :options="options" disabled />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Radio <span :style="tagStyle">单选框</span>
        </div>

        <div :style="labelStyle">水平排列（受控）— 支持方向键 ↑↓←→ 切换</div>
        <div :style="{ marginBottom: '8px', fontSize: '13px', color: '#a08060' }">
            已选中:
            <span :style="{ color: '#19c8b9', fontWeight: 600 }">
                {{ seasonOptions.find(o => o.value === selected1)?.label ?? '无' }}
            </span>
        </div>
        <div :style="demoBoxStyle">
            <Radio v-model="selected1" :options="seasonOptions" :style="{ gap: '20px' }" />
        </div>

        <div :style="labelStyle">垂直排列 + 含禁用选项</div>
        <div :style="demoBoxStyle">
            <Radio
                v-model="selected2"
                :options="fruitOptions"
                direction="vertical"
                :style="{ gap: '12px' }"
            />
        </div>

        <div :style="labelStyle">小尺寸</div>
        <div :style="demoBoxStyle">
            <Radio v-model="selected4" :options="timeOptions" size="small" />
        </div>

        <div :style="labelStyle">中尺寸（默认）</div>
        <div :style="demoBoxStyle">
            <Radio v-model="selected5" :options="timeOptions" size="middle" />
        </div>

        <div :style="labelStyle">大尺寸</div>
        <div :style="demoBoxStyle">
            <Radio v-model="selected6" :options="timeOptions" size="large" />
        </div>

        <div :style="labelStyle">3D 按键感 — 点击体验下压反馈</div>
        <div :style="{ marginBottom: '8px', fontSize: '13px', color: '#a08060' }">
            已选中:
            <span :style="{ color: '#19c8b9', fontWeight: 600 }">
                {{ timeOptions.find(o => o.value === selected3)?.label ?? '无' }}
            </span>
        </div>
        <div :style="demoBoxStyle">
            <Radio v-model="selected3" :options="timeOptions" size="large" />
        </div>

        <div :style="labelStyle">全部禁用</div>
        <div :style="demoBoxStyle">
            <Radio v-model="selected7" :options="seasonOptions" disabled />
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="RADIO_API" />
    </div>
</template>
