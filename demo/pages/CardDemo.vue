<script setup lang="ts">
import { Card } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const CARD_API: ApiRow[] = [
    { prop: 'type', desc: '卡片类型', type: "'default' | 'dashed'", defaultVal: "'default'" },
    {
        prop: 'color',
        desc: '背景颜色类型',
        type: "'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink'",
        defaultVal: "'default'",
    },
    {
        prop: 'pattern',
        desc: '背景花纹类型',
        type: "'none' | 'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink'",
        defaultVal: "'none'",
    },
    { prop: 'default', desc: '内容（默认 slot）', type: 'slot', defaultVal: '-' },
];

const colors = [
    ['default', 'Default', '默认奶油色'],
    ['app-pink', 'App Pink', '应用粉'],
    ['purple', 'Purple', '紫色'],
    ['app-blue', 'App Blue', '应用蓝'],
    ['app-yellow', 'App Yellow', '应用黄'],
    ['app-orange', 'App Orange', '应用橙'],
    ['app-teal', 'App Teal', '应用青'],
    ['app-green', 'App Green', '应用绿'],
    ['app-red', 'App Red', '应用红'],
    ['lime-green', 'Lime Green', '青柠绿'],
    ['yellow-green', 'Yellow-Green', '黄绿色'],
    ['brown', 'Brown', '棕色'],
    ['warm-peach-pink', 'Warm Peach Pink', '暖桃粉'],
] as const;

const patterns = [
    ['default', 'Default', '默认奶油点纹'],
    ['app-pink', 'App Pink', '应用粉点纹'],
    ['purple', 'Purple', '紫色点纹'],
    ['app-blue', 'App Blue', '应用蓝点纹'],
    ['app-yellow', 'App Yellow', '应用黄点纹'],
    ['app-orange', 'App Orange', '应用橙点纹'],
    ['app-teal', 'App Teal', '应用青点纹'],
    ['app-green', 'App Green', '应用绿点纹'],
    ['app-red', 'App Red', '应用红点纹'],
    ['lime-green', 'Lime Green', '青柠绿点纹'],
    ['yellow-green', 'Yellow-Green', '黄绿点纹'],
    ['brown', 'Brown', '棕色点纹'],
    ['warm-peach-pink', 'Warm Peach Pink', '暖桃粉点纹'],
] as const;

const rowStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' as const, alignItems: 'flex-start' };

const code = `<script setup lang="ts">
import { Card } from 'animal-island-vue';
<\/script>

<template>
    <!-- 基础卡片 -->
    <Card>基础卡片</Card>
    <!-- 虚线卡片 -->
    <Card type="dashed">虚线卡片</Card>
    <!-- 颜色变体 -->
    <Card color="app-blue">蓝色卡片</Card>
    <Card color="purple">紫色卡片</Card>
    <!-- 花纹底纹 -->
    <Card pattern="default">默认花纹</Card>
    <Card pattern="app-pink">应用粉花纹</Card>
    <Card pattern="lime-green" color="lime-green">青柠绿花纹</Card>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Card <span :style="tagStyle">2 types</span> <span :style="tagStyle">13 colors</span> <span :style="tagStyle">13 patterns</span>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">type="default"</div>
            <div :style="rowStyle">
                <Card><p>基础卡片</p></Card>
                <Card :style="{ maxWidth: '560px', width: '100%' }">
                    <p>在 Nintendo 3DS《Animal Island: New Leaf》和《Happy Home Designer》中製作的「我的設計」QR Code，以智慧型裝置讀取就能下載至《集合啦！動物森友會》。</p>
                </Card>
            </div>
            <div :style="labelStyle">type="dashed"</div>
            <div :style="rowStyle">
                <Card type="dashed"><p>虚线边框卡片</p></Card>
                <Card type="dashed" :style="{ maxWidth: '360px', width: '100%' }">
                    <p>欢迎来到无人岛！虚线边框适合用于轻量提示或次要信息展示。</p>
                </Card>
            </div>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">pattern — 花纹类型</div>
            <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }">
                <Card v-for="[p, en, cn] in patterns" :key="p" :pattern="p as any" :style="{ padding: '16px 20px' }">
                    <div :style="{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }">{{ en }}</div>
                    <div :style="{ fontSize: '12px', opacity: 0.85 }">{{ cn }}</div>
                    <div :style="{ fontSize: '11px', opacity: 0.7, marginTop: '6px' }">pattern="{{ p }}"</div>
                </Card>
            </div>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">color — 主题颜色</div>
            <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }">
                <Card v-for="[c, en, cn] in colors" :key="c" :color="c as any" :style="{ padding: '16px 20px' }">
                    <div :style="{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }">{{ en }}</div>
                    <div :style="{ fontSize: '12px', opacity: 0.85 }">{{ cn }}</div>
                </Card>
            </div>
        </div>


        <CodeBlock :code="code" />
        <ApiTable :rows="CARD_API" />
    </div>
</template>
