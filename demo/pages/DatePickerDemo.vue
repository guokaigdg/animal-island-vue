<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const value = ref<string | null>(null);
const rangeValue = ref<[string, string] | null>(null);
const monthValue = ref<string | null>(null);

const DATE_API: ApiRow[] = [
    {
        prop: 'modelValue',
        desc: '选中值（v-model），日期模式 YYYY-MM-DD，范围模式 [开始, 结束]，清空为 null',
        type: 'string | [string, string] | null',
        defaultVal: '-',
    },
    { prop: 'range', desc: '范围选择模式：联动选择开始与结束日期', type: 'boolean', defaultVal: 'false' },
    { prop: 'picker', desc: '选择粒度：date 日期 / month 月份（直接打开月份网格）', type: "'date' | 'month'", defaultVal: "'date'" },
    { prop: 'defaultValue', desc: '默认值（非受控）', type: 'string | [string, string]', defaultVal: '-' },
    { prop: 'placeholder', desc: '占位文本', type: 'string', defaultVal: "'请选择日期'" },
    { prop: 'disabled', desc: '是否禁用', type: 'boolean', defaultVal: 'false' },
    { prop: 'allowClear', desc: '是否允许一键清空', type: 'boolean', defaultVal: 'false' },
    { prop: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    { prop: 'status', desc: '校验状态', type: "'error' | 'warning'", defaultVal: '-' },
    { prop: 'format', desc: '展示格式（YYYY/MM/DD/M/D）', type: 'string', defaultVal: "'YYYY-MM-DD'" },
    { prop: 'disabledDate', desc: '禁用日期判断函数，返回 true 的日期不可选', type: '(date: Date) => boolean', defaultVal: '-' },
    { prop: 'showToday', desc: '面板底部是否显示「今天」快捷按钮', type: 'boolean', defaultVal: 'true' },
    { prop: 'open', desc: '受控展开状态（v-model:open）', type: 'boolean', defaultVal: '-' },
];

const code = `import { ref } from 'vue';
import { DatePicker } from 'animal-island-vue';

const date = ref<string | null>(null);
const range = ref<[string, string] | null>(null);

// 基础用法（v-model）
<DatePicker v-model="date" />

// 范围选择
<DatePicker v-model="range" range />

// 月份选择
<DatePicker picker="month" />

// 禁用今天之前的日期
<DatePicker :disabled-date="(d: Date) => d.getTime() < Date.now()" />`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            DatePicker <span :style="tagStyle">日期选择</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">基础用法（v-model）</div>
            <div style="display: flex; gap: 16px; flex-wrap: wrap">
                <DatePicker v-model="value" />
                <DatePicker v-model="value" size="small" />
                <DatePicker v-model="value" size="large" allow-clear />
            </div>

            <div :style="labelStyle">范围选择（range）</div>
            <DatePicker v-model="rangeValue" range />

            <div :style="labelStyle">月份选择（picker="month"）</div>
            <DatePicker v-model="monthValue" picker="month" />

            <div :style="labelStyle">禁用日期</div>
            <DatePicker :disabled-date="(d: Date) => d.getDay() === 0 || d.getDay() === 6" placeholder="周末不可选" />

            <div :style="labelStyle">状态与禁用</div>
            <div style="display: flex; gap: 16px; flex-wrap: wrap">
                <DatePicker status="error" placeholder="error" />
                <DatePicker status="warning" placeholder="warning" />
                <DatePicker disabled placeholder="disabled" />
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="DATE_API" />
    </div>
</template>
