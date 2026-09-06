<script setup lang="ts">
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';
import { Background } from '@';
import type { CSSProperties } from 'vue';

const BACKGROUND_API: ApiRow[] = [
    { prop: 'type', desc: '背景图案类型', type: `'dots' | 'sprinkles'`, defaultVal: "'dots'" },
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

const code = `<script setup lang="ts">
import { Background } from 'animal-island-vue';
<\/script>

<template>
    <!-- 波点壁纸（默认） -->
    <Background type="dots" style="height: 200px" />

    <!-- 彩色针糖壁纸 -->
    <Background type="sprinkles" style="height: 200px" />

    <!-- 作为内容区块的背景容器 -->
    <Background type="sprinkles" style="min-height: 200px; padding: 24px">
        <p>内容渲染在图案背景之上</p>
    </Background>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Background <span :style="tagStyle">背景</span> <span :style="tagStyle">2 types · zero image assets</span>
        </div>
        <div :style="labelStyle">dots（波点，默认）</div>
        <Background type="dots" :style="previewBox"> 波点背景 </Background>
        <div :style="labelStyle">sprinkles（彩色针糖）</div>
        <Background type="sprinkles" :style="previewBox"> 彩色针糖背景 </Background>
        <div :style="labelStyle">承载内容（children 渲染在图案之上）</div>
        <Background type="sprinkles" :style="{ ...previewBox, padding: '24px' }">
            <span>卡片内容、表单、图表都可以放在这里</span>
        </Background>
        <CodeBlock :code="code" />
        <ApiTable :rows="BACKGROUND_API" />
    </div>
</template>
