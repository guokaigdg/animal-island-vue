<script setup lang="ts">
import { ref } from 'vue';
import { Skeleton, SkeletonButton, SkeletonInput, SkeletonAvatar, Switch, Button } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const SKELETON_API: ApiRow[] = [
    { prop: 'loading', desc: '是否显示骨架屏', type: 'boolean', defaultVal: 'true' },
    { prop: 'variant', desc: '变体', type: "'text' | 'circle' | 'rect' | 'paragraph'", defaultVal: "'text'" },
    { prop: 'active', desc: '是否启用流光动画', type: 'boolean', defaultVal: 'true' },
    { prop: 'rows', desc: '行数（paragraph 模式）', type: 'number', defaultVal: '3' },
    { prop: 'width', desc: '宽度（text/circle/rect 模式）', type: 'number | string', defaultVal: '100%' },
    { prop: 'rowWidths', desc: '每行宽度数组（paragraph 模式）', type: '(number | string)[]', defaultVal: '-' },
    { prop: 'widthValue', desc: '宽（circle/rect 有效）', type: 'number | string', defaultVal: '-' },
    { prop: 'heightValue', desc: '高（circle/rect 有效）', type: 'number | string', defaultVal: '-' },
    { prop: 'default', desc: 'loading=false 时渲染的内容', type: 'slot', defaultVal: '-' },
];

const BTN_API: ApiRow[] = [
    { prop: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    { prop: 'active', desc: '是否启用流光动画', type: 'boolean', defaultVal: 'true' },
];

const INPUT_API: ApiRow[] = [
    { prop: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    { prop: 'active', desc: '是否启用流光动画', type: 'boolean', defaultVal: 'true' },
];

const AVATAR_API: ApiRow[] = [
    { prop: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    { prop: 'shape', desc: '形状', type: "'circle' | 'square'", defaultVal: "'circle'" },
    { prop: 'active', desc: '是否启用流光动画', type: 'boolean', defaultVal: 'true' },
];

const loading = ref(true);

const code = `import { Skeleton, SkeletonButton, SkeletonInput, SkeletonAvatar } from 'animal-island-vue';

// 文字骨架
<Skeleton variant="text" width="100%" />

// 圆形骨架
<Skeleton variant="circle" :widthValue="56" />

// 矩形骨架
<Skeleton variant="rect" :widthValue="200" :heightValue="120" />

// 段落骨架
<Skeleton variant="paragraph" :rows="4" />

// 子组件骨架
<SkeletonButton size="middle" />
<SkeletonInput size="large" />
<SkeletonAvatar size="middle" />

// loading 模式
<Skeleton :loading="loading">
    <div>内容已加载</div>
</Skeleton>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Skeleton <span :style="tagStyle">骨架屏</span> <span :style="tagStyle">加载占位</span>
        </div>
        <div :style="demoBodyStyle">
            <!-- ---- 切换 loading ---- -->
            <div :style="labelStyle">loading 切换</div>
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px">
                <Switch :checked="loading" @update:model-value="loading = $event" />
                <span style="font-size: 13px; color: #725d42">{{ loading ? '加载中' : '已加载' }}</span>
            </div>

            <!-- ---- 1. 变体 ---- -->
            <div :style="labelStyle">variant — 四种变体</div>
            <div style="display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap">
                <div
                    :style="{
                        width: '240px',
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#fafaf5',
                        border: '1.5px solid #e8dcc8',
                    }"
                >
                    <div :style="{ fontSize: '13px', fontWeight: 600, color: '#9f927d', marginBottom: '12px' }">
                        text
                    </div>
                    <Skeleton :loading="loading" variant="text" width="100%" />
                    <Skeleton :loading="loading" variant="text" width="80%" />
                    <Skeleton :loading="loading" variant="text" width="60%" />
                </div>
                <div
                    :style="{
                        width: '240px',
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#fafaf5',
                        border: '1.5px solid #e8dcc8',
                    }"
                >
                    <div :style="{ fontSize: '13px', fontWeight: 600, color: '#9f927d', marginBottom: '12px' }">
                        circle
                    </div>
                    <Skeleton :loading="loading" variant="circle" :width-value="56" />
                </div>
                <div
                    :style="{
                        width: '240px',
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#fafaf5',
                        border: '1.5px solid #e8dcc8',
                    }"
                >
                    <div :style="{ fontSize: '13px', fontWeight: 600, color: '#9f927d', marginBottom: '12px' }">
                        rect
                    </div>
                    <Skeleton :loading="loading" variant="rect" :width-value="200" :height-value="120" />
                </div>
                <div
                    :style="{
                        width: '240px',
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#fafaf5',
                        border: '1.5px solid #e8dcc8',
                    }"
                >
                    <div :style="{ fontSize: '13px', fontWeight: 600, color: '#9f927d', marginBottom: '12px' }">
                        paragraph
                    </div>
                    <Skeleton :loading="loading" variant="paragraph" :rows="4" />
                </div>
            </div>

            <!-- ---- 2. 子组件骨架 ---- -->
            <div :style="labelStyle">Skeleton.Button / Skeleton.Input / Skeleton.Avatar</div>
            <div style="display: flex; gap: 32px; align-items: center; flex-wrap: wrap">
                <div
                    :style="{
                        width: '240px',
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#fafaf5',
                        border: '1.5px solid #e8dcc8',
                    }"
                >
                    <div :style="{ fontSize: '13px', fontWeight: 600, color: '#9f927d', marginBottom: '12px' }">
                        Button
                    </div>
                    <SkeletonButton v-if="loading" size="middle" />
                    <Button v-else>加载完成</Button>
                </div>
                <div
                    :style="{
                        width: '240px',
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#fafaf5',
                        border: '1.5px solid #e8dcc8',
                    }"
                >
                    <div :style="{ fontSize: '13px', fontWeight: 600, color: '#9f927d', marginBottom: '12px' }">
                        Input
                    </div>
                    <SkeletonInput v-if="loading" size="middle" />
                    <div v-else :style="{ color: '#725d42', fontSize: '14px' }">输入框已加载</div>
                </div>
                <div
                    :style="{
                        width: '240px',
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#fafaf5',
                        border: '1.5px solid #e8dcc8',
                    }"
                >
                    <div :style="{ fontSize: '13px', fontWeight: 600, color: '#9f927d', marginBottom: '12px' }">
                        Avatar
                    </div>
                    <div style="display: flex; gap: 8px">
                        <template v-if="loading">
                            <SkeletonAvatar size="small" />
                            <SkeletonAvatar size="middle" />
                            <SkeletonAvatar size="large" />
                        </template>
                        <span v-else :style="{ color: '#725d42', fontSize: '14px' }">头像已加载</span>
                    </div>
                </div>
            </div>

            <!-- ---- 3. children 模式 ---- -->
            <div :style="labelStyle">loading=false 时直接渲染 children</div>
            <Skeleton :loading="false" variant="text">
                <div
                    :style="{
                        padding: '12px',
                        background: '#e6f9f6',
                        borderRadius: '12px',
                        color: '#19c8b9',
                        fontWeight: 600,
                    }"
                >
                    内容已加载，骨架屏自动隐藏
                </div>
            </Skeleton>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="SKELETON_API" />
    </div>
</template>
