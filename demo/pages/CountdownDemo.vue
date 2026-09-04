<script setup lang="ts">
import { ref } from 'vue';
import { Button, Countdown } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const COUNTDOWN_API: ApiRow[] = [
    { prop: 'value', desc: '结束时间', type: 'number | Date', defaultVal: '-', required: true },
    { prop: 'format', desc: 'DD / HH / mm / ss 格式模板', type: 'string', defaultVal: "'HH:mm:ss'" },
    { prop: 'prefix', desc: '倒计时前的说明内容', type: 'slot', defaultVal: '-' },
    { prop: 'size', desc: '尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    { prop: 'variant', desc: '显示风格', type: "'default' | 'island'", defaultVal: "'default'" },
    { prop: 'bordered', desc: '数字块是否带边框', type: 'boolean', defaultVal: 'false' },
    { prop: 'change', desc: '剩余毫秒变化回调', type: '(remaining: number) => void', defaultVal: '-' },
    { prop: 'finish', desc: '归零回调', type: '() => void', defaultVal: '-' },
];

const deadline = ref(Date.now() + 90_061_000);
const reset = () => {
    deadline.value = Date.now() + 90_061_000;
};

const shortDeadline = ref(Date.now() + 5_000);
const finished = ref(false);
const restartShort = () => {
    finished.value = false;
    shortDeadline.value = Date.now() + 10_000;
};

const code = `import { ref } from 'vue';
import { Countdown } from 'animal-island-vue';

const deadline = ref(Date.now() + 24 * 60 * 60 * 1000);

<Countdown
    :value="deadline"
    format="DD 天 HH:mm:ss"
    variant="island"
    @finish="() => console.log('倒计时结束')"
>
    <template #prefix>活动结束还有</template>
</Countdown>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Countdown <span :style="tagStyle">倒计时</span> <span :style="tagStyle">实时更新</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">活动倒计时（island 风格）</div>
            <Countdown :value="deadline" format="DD 天 HH:mm:ss" variant="island">
                <template #prefix>烟火大会开始还有</template>
            </Countdown>
            <div style="margin-top: 16px">
                <Button size="small" @click="reset">重新计时</Button>
            </div>

            <div :style="labelStyle">default 风格</div>
            <Countdown :value="deadline" format="DD 天 HH:mm:ss">
                <template #prefix>活动结束还有</template>
            </Countdown>

            <div :style="labelStyle">无边框 / 带边框</div>
            <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center">
                <Countdown :value="deadline" format="HH:mm:ss" />
                <Countdown :value="deadline" format="HH:mm:ss" bordered />
                <Countdown :value="deadline" format="HH:mm:ss" variant="island" />
                <Countdown :value="deadline" format="HH:mm:ss" variant="island" bordered />
            </div>

            <div :style="labelStyle">finish 回调</div>
            <Countdown :value="shortDeadline" @finish="finished = true">
                <template #prefix>{{ finished ? '已结束' : '商店关门还有' }}</template>
            </Countdown>
            <div style="margin-top: 16px">
                <Button size="small" @click="restartShort">再来 10 秒</Button>
            </div>

            <div :style="labelStyle">尺寸</div>
            <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center">
                <Countdown :value="deadline" size="small" />
                <Countdown :value="deadline" size="middle" />
                <Countdown :value="deadline" size="large" />
            </div>
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="COUNTDOWN_API" />
    </div>
</template>
