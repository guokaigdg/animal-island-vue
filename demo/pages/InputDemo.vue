<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const inputValue = ref('');
const colStyle = { display: 'flex', flexDirection: 'column' as const, gap: '12px', maxWidth: '360px' };

const INPUT_API: ApiRow[] = [
    { prop: 'modelValue / v-model', desc: '输入框值', type: 'string', defaultVal: '-' },
    { prop: 'size', desc: '输入框尺寸', type: `'small' | 'middle' | 'large'`, defaultVal: "'middle'" },
    { prop: 'prefix', desc: '前缀（slot 或 prop）', type: 'string | slot', defaultVal: '-' },
    { prop: 'suffix', desc: '后缀（slot 或 prop）', type: 'string | slot', defaultVal: '-' },
    { prop: 'allowClear', desc: '允许清除', type: 'boolean', defaultVal: 'false' },
    { prop: 'status', desc: '校验状态', type: `'error' | 'warning'`, defaultVal: '-' },
    { prop: 'shadow', desc: '是否显示阴影', type: 'boolean', defaultVal: 'false' },
    { prop: '@update:modelValue', desc: '值变化事件', type: '(v: string) => void', defaultVal: '-' },
    { prop: '@clear', desc: '清除事件', type: '() => void', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Input } from 'animal-island-vue';

const value = ref('');
<\/script>

<template>
    <Input placeholder="Basic input" />
    <Input v-model="value" placeholder="With clear" allow-clear />
    <Input placeholder="Prefix & Suffix" prefix="🔍" suffix="⏎" />
    <Input placeholder="Small" size="small" />
    <Input placeholder="Large" size="large" />
    <Input placeholder="Error" status="error" />
    <Input placeholder="Warning" status="warning" />
    <Input placeholder="With shadow" :shadow="true" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Input <span :style="tagStyle">3 sizes</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">shadow 阴影控制</div>
            <div :style="colStyle">
                <Input placeholder="No shadow (default)" />
                <Input placeholder="With shadow" :shadow="true" />
            </div>
            <div :style="labelStyle">基础用法</div>
            <div :style="colStyle">
                <Input placeholder="Basic input" />
                <Input v-model="inputValue" placeholder="With clear" allow-clear @clear="inputValue = ''" />
                <Input placeholder="Prefix & Suffix" prefix="🔍" suffix="⏎" />
            </div>
            <div :style="labelStyle">size 尺寸</div>
            <div :style="colStyle">
                <Input placeholder="Small" size="small" />
                <Input placeholder="Middle (default)" size="middle" />
                <Input placeholder="Large" size="large" />
            </div>
            <div :style="labelStyle">status 校验状态</div>
            <div :style="colStyle">
                <Input placeholder="Error status" status="error" />
                <Input placeholder="Warning status" status="warning" />
            </div>
            <div :style="labelStyle">disabled 禁用</div>
            <div :style="colStyle">
                <Input placeholder="Disabled" disabled />
            </div>
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="INPUT_API" />
    </div>
</template>
