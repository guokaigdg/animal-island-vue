<script setup lang="ts">
import { ref } from 'vue';
import { TimePicker } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const time = ref<string | null>(null);
const timeNoSec = ref<string | null>(null);

const TIME_API: ApiRow[] = [
    { prop: 'modelValue', desc: '选中时间（v-model），格式 HH:mm:ss，清空为 null', type: 'string | null', defaultVal: '-' },
    { prop: 'defaultValue', desc: '默认时间（非受控）', type: 'string | null', defaultVal: '-' },
    { prop: 'placeholder', desc: '占位文本', type: 'string', defaultVal: "'请选择时间'" },
    { prop: 'disabled', desc: '是否禁用', type: 'boolean', defaultVal: 'false' },
    { prop: 'allowClear', desc: '是否允许一键清空', type: 'boolean', defaultVal: 'false' },
    { prop: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    { prop: 'status', desc: '校验状态', type: "'error' | 'warning'", defaultVal: '-' },
    {
        prop: 'format',
        desc: '展示格式（HH/mm/ss/H/m/s）；包含 ss 时面板显示秒列',
        type: 'string',
        defaultVal: "'HH:mm:ss'",
    },
    { prop: 'hourStep', desc: '小时步进', type: 'number', defaultVal: '1' },
    { prop: 'minuteStep', desc: '分钟步进', type: 'number', defaultVal: '1' },
    { prop: 'secondStep', desc: '秒步进', type: 'number', defaultVal: '1' },
    { prop: 'open', desc: '受控展开状态（v-model:open）', type: 'boolean', defaultVal: '-' },
];

const code = `import { ref } from 'vue';
import { TimePicker } from 'animal-island-vue';

const time = ref<string | null>(null);

// 基础用法（v-model，HH:mm:ss）
<TimePicker v-model="time" />

// 不含秒（面板只有时/分两列）
<TimePicker format="HH:mm" />

// 分钟步进 15
<TimePicker :minute-step="15" />

// 可清空 + 尺寸
<TimePicker v-model="time" allow-clear size="large" />`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            TimePicker <span :style="tagStyle">时间选择</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">基础用法（v-model，HH:mm:ss）</div>
            <TimePicker v-model="time" />

            <div :style="labelStyle">不含秒（format="HH:mm"，面板只有时/分两列）</div>
            <TimePicker v-model="timeNoSec" format="HH:mm" />

            <div :style="labelStyle">步进与尺寸</div>
            <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center">
                <TimePicker :minute-step="15" />
                <TimePicker size="small" />
                <TimePicker size="large" allow-clear />
            </div>

            <div :style="labelStyle">状态与禁用</div>
            <div style="display: flex; gap: 16px; flex-wrap: wrap">
                <TimePicker status="error" placeholder="error" />
                <TimePicker status="warning" placeholder="warning" />
                <TimePicker disabled placeholder="disabled" />
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="TIME_API" />
    </div>
</template>
