<script setup lang="ts">
import { Icon, ICON_LIST } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const ICON_API: ApiRow[] = [
    { prop: 'name', desc: '图标名称', type: 'IconName', defaultVal: '-', required: true },
    { prop: 'size', desc: '图标尺寸', type: 'number | string', defaultVal: '24' },
    { prop: 'bounce', desc: '弹跳动画', type: 'boolean', defaultVal: 'false' },
];

const code = `<script setup lang="ts">
import { Icon } from 'animal-island-vue';
<\/script>

<template>
    <Icon name="icon-miles" :size="32" />
    <Icon name="icon-camera" :size="48" bounce />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Icon <span :style="tagStyle">10 icons</span>
        </div>
        <div :style="labelStyle">基础用法</div>
        <div :style="{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }">
            <Icon name="icon-miles" :size="32" />
            <Icon name="icon-camera" :size="32" />
            <Icon name="icon-chat" :size="32" />
            <Icon name="icon-design" :size="32" />
            <Icon name="icon-map" :size="32" />
        </div>
        <div :style="labelStyle">size 尺寸</div>
        <div :style="{ display: 'flex', gap: '20px', alignItems: 'center' }">
            <Icon name="icon-miles" :size="16" />
            <Icon name="icon-miles" :size="24" />
            <Icon name="icon-miles" :size="32" />
            <Icon name="icon-miles" :size="48" />
        </div>
        <div :style="labelStyle">bounce 弹跳动画（鼠标悬停查看效果）</div>
        <div :style="{ display: 'flex', gap: '20px', alignItems: 'center' }">
            <Icon name="icon-miles" :size="32" bounce />
            <Icon name="icon-camera" :size="32" bounce />
            <Icon name="icon-chat" :size="32" bounce />
        </div>
        <div :style="labelStyle">图标列表</div>
        <div :style="{ border: '1px solid #e8e2d6', borderRadius: '12px', overflow: 'hidden', padding: '5px 16px' }">
            <div
                v-for="(icon, idx) in ICON_LIST"
                :key="icon.name"
                :style="{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '12px 5px',
                    borderBottom: idx < ICON_LIST.length - 1 ? '1px dashed #f0e8d8' : 'none',
                    background: '#fff',
                }"
            >
                <Icon :name="icon.name" :size="32" />
                <span :style="{ fontSize: '14px', color: '#725d42' }">{{ icon.label }}</span>
                <span :style="{ marginLeft: 'auto', fontSize: '12px', color: '#a0936e', fontFamily: `'SF Mono', 'Fira Code', Consolas, monospace` }">
                    {{ icon.name }}
                </span>
            </div>
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="ICON_API" />
    </div>
</template>
