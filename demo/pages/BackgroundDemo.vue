<script setup lang="ts">
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';
import { Background } from '@';
import type { BackgroundType } from '@';
import type { CSSProperties } from 'vue';

// 彩蛋：hover 预览块 → 整个 demo 站点壁纸同步切换为该图案；移开还原
const dispatchPageBg = (type: BackgroundType | 'reset') => () =>
    window.dispatchEvent(new CustomEvent('demo-bg-easter-egg', { detail: type }));

const BACKGROUND_TYPE_UNION =
    "'default' | 'grid' | 'dots-dark-green' | 'sprinkles' | 'sweet-corner' | 'coffee-break' | 'dots-pink' | 'dots-purple' | 'dots-blue' | 'dots-yellow' | 'dots-orange' | 'dots-teal' | 'dots-green' | 'dots-red' | 'dots-lime-green' | 'dots-yellow-green' | 'dots-brown' | 'dots-warm-peach-pink'";

const BACKGROUND_API: ApiRow[] = [
    {
        prop: 'type',
        desc: '背景图案类型（dots-* 底色与 Card pattern-* 系列一致）',
        type: BACKGROUND_TYPE_UNION,
        defaultVal: "'default'",
    },
    { prop: 'default', desc: '子内容，渲染在图案背景之上', type: 'slot', defaultVal: '-' },
    { prop: 'class', desc: '自定义类名（透传到根 div）', type: 'string', defaultVal: '-' },
    { prop: 'style', desc: '自定义样式（透传到根 div）', type: 'string | object', defaultVal: '-' },
];

const previewBox: CSSProperties = {
    display: 'grid',
    placeItems: 'center',
    height: '180px',
    borderRadius: '16px',
    marginBottom: '16px',
    overflow: 'hidden',
    color: '#725d42',
    fontWeight: 600,
    fontSize: '15px',
};

// 全部 18 种类型（type / 中文名 / 文字色），dots-* 底色对应 Card pattern-* 系列，文字色与 Card pattern 系列保持一致
const CARD_COLORS: ReadonlyArray<[BackgroundType, string, string]> = [
    ['default', '奶油色波点（默认）', '#725d42'],
    ['grid', '网格', '#725d42'],
    ['dots-dark-green', '深绿波点', '#3a6b3a'],
    ['sprinkles', '彩色针糖', '#725d42'],
    ['sweet-corner', '甜点街角', '#725d42'],
    ['coffee-break', '咖啡时光', '#725d42'],
    ['dots-pink', '应用粉', '#a85565'],
    ['dots-purple', '紫色', '#6a3a9a'],
    ['dots-blue', '应用蓝', '#4a5a8a'],
    ['dots-yellow', '应用黄', '#7a6528'],
    ['dots-orange', '应用橙', '#8a4a2a'],
    ['dots-teal', '应用青', '#2a6b5a'],
    ['dots-green', '应用绿', '#3a6b3a'],
    ['dots-red', '应用红', '#9a3a3a'],
    ['dots-lime-green', '青柠绿', '#5a6b28'],
    ['dots-yellow-green', '黄绿色', '#6a5a28'],
    ['dots-brown', '棕色', '#5a4a2a'],
    ['dots-warm-peach-pink', '暖桃粉', '#8a4a2a'],
];

const code = `<script setup lang="ts">
import { Background } from 'animal-island-vue';
<\/script>

<template>
    <!-- 奶油色波点壁纸（默认） -->
    <Background style="height: 200px" />

    <!-- 网格壁纸 -->
    <Background type="grid" style="height: 200px" />

    <!-- 深绿波点壁纸 -->
    <Background type="dots-dark-green" style="height: 200px" />

    <!-- 彩色针糖壁纸 -->
    <Background type="sprinkles" style="height: 200px" />

    <!-- 场景背景图（cover 铺满） -->
    <Background type="sweet-corner" style="height: 200px" />
    <Background type="coffee-break" style="height: 200px" />

    <!-- 底色对应 Card pattern-* 系列壁纸 -->
    <Background type="dots-blue" style="height: 200px" />

    <!-- 作为内容区块的背景容器 -->
    <Background type="sprinkles" style="min-height: 200px; padding: 24px">
        <p>内容渲染在图案背景之上</p>
    </Background>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Background
            <span :style="tagStyle">背景</span>
            <span :style="tagStyle">18 types · Card pattern base · 2 scene images</span>
        </div>
        <div :style="labelStyle">全部类型（dots-* 底色对应 Card pattern-* 系列，hover 预览整站壁纸）</div>
        <div style="display: flex; flex-wrap: wrap; gap: 12px">
            <Background
                v-for="[type, cn, color] in CARD_COLORS"
                :key="type"
                :type="type"
                :style="{
                    width:
                        type === 'sprinkles' || type === 'sweet-corner' || type === 'coffee-break' ? '348px' : '168px',
                    height: '120px',
                    ...(type === 'sweet-corner' || type === 'coffee-break' ? { backgroundSize: '240% auto' } : {}),
                    borderRadius: '14px',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 600,
                    color,
                }"
                @mouseenter="dispatchPageBg(type)"
                @mouseleave="dispatchPageBg('reset')"
            >
                <span style="text-align: center; line-height: 1.5">
                    <span style="display: block; font-size: 14px">{{ type }}</span>
                    <span style="display: block; font-size: 12px; opacity: 0.85">{{ cn }}</span>
                </span>
            </Background>
        </div>
        <div :style="{ ...labelStyle, marginTop: '24px' }">承载内容（children 渲染在图案之上）</div>
        <Background type="sprinkles" :style="{ ...previewBox, padding: '24px' }">
            <span>卡片内容、表单、图表都可以放在这里</span>
        </Background>
        <CodeBlock :code="code" />
        <ApiTable :rows="BACKGROUND_API" />
    </div>
</template>
