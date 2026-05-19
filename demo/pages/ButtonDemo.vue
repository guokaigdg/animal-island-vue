<script setup lang="ts">
import { Button } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const rowStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' as const, alignItems: 'flex-start' };

const BUTTON_API: ApiRow[] = [
    { prop: 'type', desc: '按钮类型', type: `'primary' | 'default' | 'dashed' | 'text' | 'link'`, defaultVal: "'default'" },
    { prop: 'size', desc: '按钮尺寸', type: `'small' | 'middle' | 'large'`, defaultVal: "'middle'" },
    { prop: 'danger', desc: '是否危险按钮', type: 'boolean', defaultVal: 'false' },
    { prop: 'ghost', desc: '是否幽灵按钮（透明背景）', type: 'boolean', defaultVal: 'false' },
    { prop: 'block', desc: '是否块级按钮', type: 'boolean', defaultVal: 'false' },
    { prop: 'loading', desc: '加载状态', type: 'boolean', defaultVal: 'false' },
    { prop: 'disabled', desc: '禁用状态', type: 'boolean', defaultVal: 'false' },
    { prop: '#icon', desc: '图标插槽', type: 'slot', defaultVal: '-' },
    { prop: 'htmlType', desc: '原生 button type', type: `'submit' | 'reset' | 'button'`, defaultVal: "'button'" },
    { prop: 'default', desc: '按钮内容（默认插槽）', type: 'slot', defaultVal: '-' },
    { prop: '@click', desc: '点击事件', type: '(e: MouseEvent) => void', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { Button } from 'animal-island-vue';
<\/script>

<template>
    <Button type="primary">Primary</Button>
    <Button>Default</Button>
    <Button type="dashed">Dashed</Button>
    <Button type="text">Text</Button>
    <Button type="link">Link</Button>
    <Button type="primary" danger>Danger</Button>
    <Button type="primary" ghost>Ghost</Button>
    <Button type="primary" loading>Loading</Button>
    <Button type="primary" size="large">Large</Button>
    <Button type="primary"><template #icon>🔍</template>搜索</Button>
    <Button type="primary" block>Block</Button>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Button <span :style="tagStyle">6 types</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">type 按钮类型</div>
            <div :style="rowStyle">
                <Button type="primary">Primary</Button>
                <Button>Default</Button>
                <Button type="dashed">Dashed</Button>
                <Button type="text">Text</Button>
                <Button type="link">Link</Button>
            </div>
            <div :style="labelStyle">danger / ghost / loading / disabled 状态</div>
            <div :style="rowStyle">
                <Button type="primary" danger>Danger</Button>
                <Button type="primary" ghost>Ghost</Button>
                <Button type="primary" loading>Loading</Button>
                <Button type="primary" disabled>Disabled</Button>
            </div>
            <div :style="labelStyle">size 尺寸</div>
            <div :style="rowStyle">
                <Button type="primary" size="small">Small</Button>
                <Button type="primary" size="middle">Middle</Button>
                <Button type="primary" size="large">Large</Button>
            </div>
            <div :style="labelStyle">icon 图标按钮</div>
            <div :style="rowStyle">
                <Button type="primary"><template #icon><span>🔍</span></template>搜索</Button>
                <Button><template #icon><span>⭐</span></template>收藏</Button>
                <Button type="dashed"><template #icon><span>＋</span></template>新增</Button>
            </div>
            <div :style="labelStyle">block 块级按钮</div>
            <div :style="{ maxWidth: '360px' }">
                <Button type="primary" block>Block Button</Button>
            </div>
            <div :style="labelStyle">danger 组合</div>
            <div :style="rowStyle">
                <Button type="primary" danger>Primary Danger</Button>
                <Button danger>Default Danger</Button>
                <Button type="dashed" danger>Dashed Danger</Button>
                <Button type="text" danger>Text Danger</Button>
                <Button type="link" danger>Link Danger</Button>
            </div>
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="BUTTON_API" />
    </div>
</template>
