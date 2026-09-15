<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { Loading, Button } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const active = ref(false);
const tip = ref<string | undefined>();
const delay = ref(0);
const fadeDuration = ref(0.6);

let timer: ReturnType<typeof setTimeout> | undefined;

// 播放一次：2.4s 后自动关闭，随后落雪渐变消失
const play = (opts?: { tip?: string; delay?: number; fadeDuration?: number }) => {
    clearTimeout(timer);
    tip.value = opts?.tip;
    delay.value = opts?.delay ?? 0;
    fadeDuration.value = opts?.fadeDuration ?? 0.6;
    active.value = true;
    timer = setTimeout(() => {
        active.value = false;
    }, 2400);
};

// 模拟快速加载：600ms 后关闭，用于对比 delay 防闪烁
const playQuick = (d: number) => {
    clearTimeout(timer);
    tip.value = d ? 'delay 300ms' : '无 delay';
    delay.value = d;
    fadeDuration.value = 0.6;
    active.value = true;
    timer = setTimeout(() => {
        active.value = false;
    }, 600);
};

onBeforeUnmount(() => clearTimeout(timer));

const LOADING_API: ApiRow[] = [
    { prop: 'active', desc: 'true / false 控制开启关闭；false 时落雪渐变消失', type: 'boolean', defaultVal: 'true' },
    { prop: 'tip', desc: '落雪中央提示文字', type: 'string | VNode', defaultVal: '-' },
    { prop: 'delay', desc: '延迟显示时间（毫秒），避免加载快速结束时闪烁', type: 'number', defaultVal: '0' },
    { prop: 'fadeDuration', desc: '渐变消失时长（秒）', type: 'number', defaultVal: '0.6' },
    { prop: 'zIndex', desc: '全屏层级（默认 3000，高于 Notification 的 2000）', type: 'number', defaultVal: '3000' },
    {
        prop: '(attrs)',
        desc: '透传任意属性到根元素（如 class / style / data-*）',
        type: 'Record<string, unknown>',
        defaultVal: '-',
    },
];

const code = `import { Loading } from 'animal-island-vue';

<!-- active 受控：true 开启落雪，false 渐变消失 -->
<Loading :active="active" />

<!-- 中央提示文字 -->
<Loading :active="active" tip="正在连接岛屿…" />

<!-- 延迟显示：加载快速结束时避免落雪闪烁 -->
<Loading :active="active" :delay="300" />

<!-- 慢速渐隐 + 自定义层级 -->
<Loading :active="active" :fade-duration="1.2" :z-index="5000" />`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Loading <span :style="tagStyle">全屏落雪</span> <span :style="tagStyle">渐变消失</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">基础播放 — 点击后全屏落雪覆盖 2.4s，结束时渐变消失</div>
            <div :style="{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }">
                <Button @click="play()">纯落雪</Button>
                <Button @click="play({ tip: '正在连接岛屿…' })">带提示文字</Button>
                <Button @click="play({ tip: '等雪停…', delay: 300 })">delay 300ms</Button>
                <Button @click="play({ tip: '慢速渐隐', fadeDuration: 1.2 })">fadeDuration 1.2s</Button>
            </div>

            <div :style="labelStyle">
                delay 防闪烁 — 快速结束时（600ms 模拟加载）无 delay 的落雪会闪一下，delay 300ms 的几乎不出现
            </div>
            <div :style="{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }">
                <Button @click="playQuick(0)">模拟 600ms 加载（无 delay）</Button>
                <Button @click="playQuick(300)">模拟 600ms 加载（delay 300ms）</Button>
            </div>

            <CodeBlock :code="code" />
            <ApiTable :rows="LOADING_API" />

            <Loading :active="active" :tip="tip" :delay="delay" :fade-duration="fadeDuration" :z-index="3000" />
        </div>
    </div>
</template>
