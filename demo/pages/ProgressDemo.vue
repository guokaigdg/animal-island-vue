<script setup lang="ts">
import { ref } from 'vue';
import { Progress, Button } from '../../src';
import {
    sectionStyle,
    sectionTitleStyle,
    tagStyle,
    labelStyle,
    demoBodyStyle,
    demoBoxStyle,
    ApiTable,
    CodeBlock,
} from '../tools';
import type { ApiRow } from '../tools';

const PROGRESS_API: ApiRow[] = [
    { prop: 'percent', desc: '当前百分比 0–100', type: 'number', defaultVal: '-', required: true },
    { prop: 'size', desc: '尺寸', type: `'small' | 'middle' | 'large'`, defaultVal: "'middle'" },
    { prop: 'showInfo', desc: '是否显示百分比文字', type: 'boolean', defaultVal: 'true' },
    {
        prop: 'infoPosition',
        desc: '文字位置',
        type: `'inside' | 'right' | 'top'`,
        defaultVal: "'inside'",
    },
    { prop: 'infoFormat', desc: '自定义文字格式化', type: '(percent: number) => string', defaultVal: '-' },
    { prop: 'duration', desc: 'fill 宽度动画时长（秒），0 = 不动画', type: 'number', defaultVal: '0.6' },
];

const percent = ref(60);
const stackStyle = { display: 'flex', flexDirection: 'column' as const, gap: '12px' };
const rowStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'center' };
const hintStyle = { fontSize: '13px', color: '#8a7b66' };

function increase() {
    percent.value = Math.min(100, percent.value + 10);
}
function decrease() {
    percent.value = Math.max(0, percent.value - 10);
}

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Progress, Button } from 'animal-island-vue';

const percent = ref(60);
<\/script>

<template>
    <Progress :percent="60" />
    <Progress :percent="60" size="small" />
    <Progress :percent="60" info-position="right" />
    <Progress :percent="60" info-position="top" />
    <Progress :percent="percent" />
    <Progress :percent="60" :info-format="(p) => p + ' / 100'" />
    <Progress :percent="60" :duration="0" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Progress <span :style="tagStyle">进度条</span>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">基础用法 — 60%</div>
            <div :style="demoBoxStyle">
                <Progress :percent="60" />
            </div>

            <div :style="labelStyle">size 尺寸</div>
            <div :style="demoBoxStyle">
                <div :style="stackStyle">
                    <Progress :percent="60" size="small" />
                    <Progress :percent="60" size="middle" />
                    <Progress :percent="60" size="large" />
                </div>
            </div>

            <div :style="labelStyle">infoPosition 文字位置</div>
            <div :style="demoBoxStyle">
                <div :style="stackStyle">
                    <Progress :percent="60" info-position="inside" />
                    <Progress :percent="60" info-position="right" />
                    <Progress :percent="60" info-position="top" />
                </div>
            </div>

            <div :style="labelStyle">动画控制 — 按钮 +/- 调整百分比</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button size="small" @click="decrease">- 10</Button>
                    <Button size="small" type="primary" @click="increase">+ 10</Button>
                    <span :style="hintStyle">当前：{{ percent }}%</span>
                </div>
                <div :style="{ marginTop: '12px' }">
                    <Progress :percent="percent" />
                </div>
            </div>

            <div :style="labelStyle">infoFormat 自定义文字</div>
            <div :style="demoBoxStyle">
                <Progress :percent="60" :info-format="(p: number) => `${p} / 100`" />
                <div :style="{ marginTop: '12px' }">
                    <Progress :percent="75" :info-format="(p: number) => `已完成 ${p}%`" info-position="right" />
                </div>
            </div>

            <div :style="labelStyle">duration=0 无动画</div>
            <div :style="demoBoxStyle">
                <Progress :percent="60" :duration="0" />
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="PROGRESS_API" />
    </div>
</template>
