<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { Title } from '../../src';
import {
    sectionStyle,
    sectionTitleStyle,
    tagStyle,
    labelStyle,
    demoBoxStyle,
    ApiTable,
    CodeBlock,
} from '../tools';
import type { ApiRow } from '../tools';

const TITLE_API: ApiRow[] = [
    { prop: 'default slot', desc: '标题内容', type: 'slot', defaultVal: '-', required: true },
    { prop: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    {
        prop: 'color',
        desc: '配色',
        type: "'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink'",
        defaultVal: "'default'",
    },
];

// 动森风格背景工厂：底色 + 错位圆点纹理
function acBox(bg: string, dot1: string, dot2: string, border: string): CSSProperties {
    return {
        ...demoBoxStyle,
        padding: '40px',
        background: `radial-gradient(circle, ${dot1} 1.5px, transparent 1.5px),
            radial-gradient(circle, ${dot2} 1px, transparent 1px),
            ${bg}`,
        backgroundSize: '28px 28px, 14px 14px, auto',
        backgroundPosition: '0 0, 7px 7px, 0 0',
        border: `1.5px solid ${border}`,
    } as CSSProperties;
}

const bgGreen    = acBox('#e8f5d8', 'rgba(120,200,80,0.18)',  'rgba(180,230,120,0.12)', '#b8d890');
const bgSky      = acBox('#ddf0fa', 'rgba(80,170,230,0.15)',  'rgba(140,210,250,0.10)', '#90cce8');
const bgSand     = acBox('#fdf3d8', 'rgba(220,180,80,0.15)',  'rgba(240,210,120,0.10)', '#e8d090');
const bgLavender = acBox('#ede8f8', 'rgba(160,120,230,0.15)', 'rgba(200,170,250,0.10)', '#c0a8e8');
const bgCoral    = acBox('#fce8e0', 'rgba(240,120,90,0.15)',  'rgba(250,170,140,0.10)', '#e8b0a0');
const bgMint     = acBox('#d8f5f0', 'rgba(60,190,170,0.18)',  'rgba(120,230,210,0.12)', '#88d8c8');

const code = `<script setup lang="ts">
import { Title } from 'animal-island-vue';
<\/script>

<template>
    <Title>斯普拉遁</Title>
    <Title size="small">小标题</Title>
    <Title size="large" color="app-pink">大号粉色</Title>
    <Title color="purple">紫色标题</Title>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Title <span :style="tagStyle">标题</span>
        </div>

        <div :style="labelStyle">飘带标题</div>
        <div :style="bgGreen">
            <Title>斯普拉遁</Title>
        </div>

        <div :style="labelStyle">配色变体</div>
        <div :style="{ ...bgSand, display: 'flex', flexWrap: 'wrap', gap: '50px' }">
            <Title color="default">默认绿</Title>
            <Title color="app-pink">粉色</Title>
            <Title color="purple">紫色</Title>
            <Title color="app-blue">蓝色</Title>
            <Title color="app-yellow">黄色</Title>
            <Title color="app-orange">橙色</Title>
            <Title color="app-teal">青色</Title>
            <Title color="app-green">绿色</Title>
            <Title color="app-red">红色</Title>
            <Title color="lime-green">青柠</Title>
            <Title color="yellow-green">黄绿</Title>
            <Title color="brown">棕色</Title>
            <Title color="warm-peach-pink">暖桃粉</Title>
        </div>

        <div :style="labelStyle">小尺寸</div>
        <div :style="bgCoral">
            <Title size="small">小标题</Title>
        </div>

        <div :style="labelStyle">中尺寸（默认）</div>
        <div :style="bgMint">
            <Title size="middle">中等标题</Title>
        </div>

        <div :style="labelStyle">大尺寸</div>
        <div :style="bgLavender">
            <Title size="large">大号标题</Title>
        </div>

        <div :style="labelStyle">支持英文与表情</div>
        <div :style="bgSky">
            <Title>🎮 LET'S PLAY!</Title>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="TITLE_API" />
    </div>
</template>
