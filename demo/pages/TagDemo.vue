<script setup lang="ts">
import { Tag } from '../../src';
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

const TAG_API: ApiRow[] = [
    { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, defaultVal: "'medium'" },
    {
        prop: 'variant',
        desc: '风格',
        type: `'solid' | 'outlined' | 'dashed'`,
        defaultVal: "'solid'",
    },
    {
        prop: 'color',
        desc: '颜色',
        type: `'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink'`,
        defaultVal: "'default'",
    },
    { prop: 'closable', desc: '是否可关闭', type: 'boolean', defaultVal: 'false' },
    { prop: 'disabled', desc: '是否禁用', type: 'boolean', defaultVal: 'false' },
    { prop: 'default', desc: '标签内容（默认插槽）', type: 'slot', defaultVal: '-' },
    { prop: '@close', desc: '关闭回调', type: '(event: MouseEvent) => void', defaultVal: '-' },
    { prop: '@click', desc: '点击回调', type: '(event: MouseEvent) => void', defaultVal: '-' },
];

const rowStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'center' };

function handleClose(event: MouseEvent) {
    console.log('Tag closed', event);
}

function handleClick(event: MouseEvent) {
    console.log('Tag clicked', event);
}

const code = `<script setup lang="ts">
import { Tag } from 'animal-island-vue';

function onClose(e: MouseEvent) { console.log('closed', e); }
<\/script>

<template>
    <Tag>Default</Tag>
    <Tag size="small">Small</Tag>
    <Tag size="large">Large</Tag>
    <Tag variant="outlined">Outlined</Tag>
    <Tag variant="dashed">Dashed</Tag>
    <Tag color="app-pink">Pink</Tag>
    <Tag color="app-blue" closable @close="onClose">Closable</Tag>
    <Tag disabled>Disabled</Tag>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Tag <span :style="tagStyle">标签</span>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">size 尺寸（默认颜色）</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Tag size="small">Small</Tag>
                    <Tag size="medium">Medium</Tag>
                    <Tag size="large">Large</Tag>
                </div>
            </div>

            <div :style="labelStyle">variant 风格</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Tag variant="solid">Solid</Tag>
                    <Tag variant="outlined">Outlined</Tag>
                    <Tag variant="dashed">Dashed</Tag>
                </div>
            </div>

            <div :style="labelStyle">color 颜色</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Tag color="app-pink">app-pink</Tag>
                    <Tag color="purple">purple</Tag>
                    <Tag color="app-blue">app-blue</Tag>
                    <Tag color="app-yellow">app-yellow</Tag>
                    <Tag color="app-teal">app-teal</Tag>
                    <Tag color="app-red">app-red</Tag>
                    <Tag color="app-green">app-green</Tag>
                    <Tag color="app-orange">app-orange</Tag>
                    <Tag color="lime-green">lime-green</Tag>
                    <Tag color="brown">brown</Tag>
                    <Tag color="warm-peach-pink">warm-peach-pink</Tag>
                </div>
            </div>

            <div :style="labelStyle">color + variant 组合</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Tag color="app-blue" variant="solid">Solid</Tag>
                    <Tag color="app-blue" variant="outlined">Outlined</Tag>
                    <Tag color="app-blue" variant="dashed">Dashed</Tag>
                </div>
            </div>

            <div :style="labelStyle">closable 可关闭（@close 打印到 console）</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Tag closable @close="handleClose">默认</Tag>
                    <Tag color="app-pink" closable @close="handleClose">粉色</Tag>
                    <Tag color="app-teal" closable @close="handleClose">青色</Tag>
                    <Tag color="app-red" closable @close="handleClose">红色</Tag>
                </div>
            </div>

            <div :style="labelStyle">clickable 可点击（@click 打印到 console）</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Tag @click="handleClick">点击我</Tag>
                    <Tag color="app-yellow" @click="handleClick">点击我</Tag>
                    <Tag color="purple" variant="outlined" @click="handleClick">点击我</Tag>
                </div>
            </div>

            <div :style="labelStyle">disabled 禁用</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Tag disabled>Disabled</Tag>
                    <Tag color="app-blue" disabled>Disabled</Tag>
                    <Tag color="app-red" closable disabled>Disabled Closable</Tag>
                </div>
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="TAG_API" />
    </div>
</template>
