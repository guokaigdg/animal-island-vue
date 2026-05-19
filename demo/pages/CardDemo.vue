<script setup lang="ts">
import { Card } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const CARD_API: ApiRow[] = [
    { prop: 'type', desc: '卡片类型', type: "'default' | 'title' | 'dashed'", defaultVal: "'default'" },
    {
        prop: 'color',
        desc: '背景颜色类型',
        type: "'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink'",
        defaultVal: "'default'",
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

const rowStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' as const, alignItems: 'flex-start' };

const code = `<script setup lang="ts">
import { Card } from 'animal-island-vue';
<\/script>

<template>
    <!-- 基础卡片 -->
    <Card>基础卡片</Card>
    <!-- 标题卡片 -->
    <Card type="title">标题卡片</Card>
    <!-- 虚线卡片 -->
    <Card type="dashed">虚线卡片</Card>
    <!-- 颜色变体 -->
    <Card color="app-blue">蓝色卡片</Card>
    <Card type="title" color="purple">紫色标题卡片</Card>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Card <span :style="tagStyle">3 types</span> <span :style="tagStyle">13 colors</span>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">type="default"</div>
            <div :style="rowStyle">
                <Card><p>基础卡片</p></Card>
                <Card :style="{ maxWidth: '560px', width: '100%' }">
                    <p>在 Nintendo 3DS《Animal Island: New Leaf》和《Happy Home Designer》中製作的「我的設計」QR Code，以智慧型裝置讀取就能下載至《集合啦！動物森友會》。</p>
                </Card>
            </div>
            <div :style="labelStyle">type="title"</div>
            <div :style="rowStyle">
                <Card type="title"><p>Title 标题卡片</p></Card>
                <Card type="title" :style="{ maxWidth: '360px', width: '100%' }">
                    <p>欢迎来到无人岛！标题卡片适合用于强调内容。</p>
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
            <div :style="labelStyle">color — NookPhone 颜色</div>
            <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }">
                <Card v-for="[c, en, cn] in colors" :key="c" :color="c as any" :style="{ padding: '16px 20px' }">
                    <div :style="{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }">{{ en }}</div>
                    <div :style="{ fontSize: '12px', opacity: 0.85 }">{{ cn }}</div>
                </Card>
            </div>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">color + type="title"</div>
            <div :style="rowStyle">
                <Card type="title" color="app-blue" :style="{ width: '240px' }">
                    <div :style="{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }">蓝色标题卡片</div>
                    <div :style="{ fontSize: '12px', opacity: 0.85 }">type="title" + color="app-blue"</div>
                </Card>
                <Card type="title" color="app-green" :style="{ width: '250px' }">
                    <div :style="{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }">绿色标题卡片</div>
                    <div :style="{ fontSize: '12px', opacity: 0.85 }">type="title" + color="app-green"</div>
                </Card>
                <Card type="title" color="purple" :style="{ width: '240px' }">
                    <div :style="{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }">紫色标题卡片</div>
                    <div :style="{ fontSize: '12px', opacity: 0.85 }">type="title" + color="purple"</div>
                </Card>
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="CARD_API" />
    </div>
</template>
