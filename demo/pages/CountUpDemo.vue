<script setup lang="ts">
import { ref, watch } from 'vue';
import { CountUp, Radio, Tag, Button, type CountUpSize, type CountUpVariant } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const COUNTUP_API: ApiRow[] = [
    { prop: 'end', desc: '目标值（必填）', type: 'number', defaultVal: '-', required: true },
    { prop: 'start', desc: '起始值', type: 'number', defaultVal: '0' },
    { prop: 'duration', desc: '动画时长（秒）；传 0 直接显示目标值', type: 'number', defaultVal: '2' },
    {
        prop: 'isCounting',
        desc: '是否正在计数；置 false 暂停并保留当前值，再置 true 从暂停处继续',
        type: 'boolean',
        defaultVal: 'false',
    },
    {
        prop: 'decimalPlaces',
        desc: '小数位数，默认取 start / end 中较大的小数位数',
        type: 'number',
        defaultVal: '自动',
    },
    { prop: 'decimalSeparator', desc: '小数点符号', type: 'string', defaultVal: "'.'" },
    { prop: 'thousandsSeparator', desc: '千分位符号，空串为不分组', type: 'string', defaultVal: "''" },
    {
        prop: 'easing',
        desc: "缓动曲线：'linear' / 'easeInCubic' / 'easeOutCubic' / 'easeInOutCubic' / 'easeOutExpo'，也可传自定义函数",
        type: 'CountUpEasing',
        defaultVal: "'easeOutCubic'",
    },
    {
        prop: 'formatter',
        desc: '数字格式化，优先级高于上面三个格式化项；需完全接管渲染请用默认插槽',
        type: '(value: number) => string | number',
        defaultVal: '-',
    },
    { prop: 'updateInterval', desc: '展示值刷新间隔（秒），0 表示每帧刷新', type: 'number', defaultVal: '0' },
    {
        prop: 'size',
        desc: "尺寸：'small' / 'middle' / 'large'",
        type: `'small' | 'middle' | 'large'`,
        defaultVal: "'middle'",
    },
    { prop: 'variant', desc: "显示风格：'default' / 'island'", type: `'default' | 'island'`, defaultVal: "'default'" },
    { prop: 'bordered', desc: '数字块是否带边框', type: 'boolean', defaultVal: 'false' },
    {
        prop: 'digitRoll',
        desc: '数码管逐位滚动：每位数字是一根独立滚轮，变化时滚动到新数字（Vue 端独有，React 无此能力）',
        type: 'boolean',
        defaultVal: 'false',
    },
    {
        prop: 'celebrate',
        desc: '结束庆祝动效；传 { text } 额外弹出贴纸，也可用 #celebrate 插槽',
        type: 'boolean | { text?: string }',
        defaultVal: 'false',
    },
    { prop: 'repeat', desc: '结束后自动重播', type: 'boolean', defaultVal: 'false' },
    { prop: 'repeatDelay', desc: '重播前等待时间（秒）', type: 'number', defaultVal: '0' },
    { prop: 'repeatStartAt', desc: '重播时的起始值，默认回到 start', type: 'number', defaultVal: '-' },
    { prop: 'prefix / suffix', desc: '数字前缀 / 后缀', type: 'slot', defaultVal: '-' },
    { prop: 'celebrate', desc: '庆祝贴纸文案', type: 'slot', defaultVal: '-' },
    { prop: 'default', desc: '作用域插槽 { value, reset }，完全接管数字渲染', type: 'slot', defaultVal: '-' },
    { prop: 'update', desc: '展示值更新时触发（每帧）', type: '(value: number) => void', defaultVal: '-' },
    {
        prop: 'complete',
        desc: '计数结束时触发，参数为累计时长（秒）',
        type: '(elapsedTime: number) => void',
        defaultVal: '-',
    },
];

const size = ref<CountUpSize>('middle');
const variant = ref<CountUpVariant>('default');

const basic = ref(false);
const withCelebrate = ref(false);
const repeatRun = ref(false);
const slotRun = ref(false);
const lastValue = ref<number | null>(null);
const lastElapsed = ref<number | null>(null);

/** 递增 key 触发重播：isCounting 已经是 true，想重放只能靠换 key 或调 reset() */
const formatRound = ref(0);
const formatterRound = ref(0);
const styleRound = ref(0);
const ariaRound = ref(0);
const rollRound = ref(0);

// 尺寸 / 风格切换后自动重播，否则只能看到切换后的静态结果
watch([size, variant], () => {
    styleRound.value += 1;
});

const rowStyle = { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' as const };

/** 通过组件 ref 主动重播 */
const countUpRef = ref<InstanceType<typeof CountUp> | null>(null);
const replay = () => countUpRef.value?.reset();

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { CountUp } from 'animal-island-vue';

const playing = ref(false);
const onComplete = (elapsed: number) => console.log('用时', elapsed, '秒');

// 基础用法：isCounting 从 false 翻到 true 即开始计数
<CountUp :end="8888" :is-counting="playing" @complete="onComplete" />

// 千分位 + 小数位 + 前后缀插槽
<CountUp :end="1320.5" :is-counting="playing" :decimal-places="1" thousands-separator="," :duration="1.5">
    <template #prefix>¥</template>
    <template #suffix>分</template>
</CountUp>

// 结束庆祝动效（贴纸文案走插槽）
<CountUp :end="100" :is-counting="playing" celebrate>
    <template #celebrate>达成！</template>
</CountUp>

// 默认作用域插槽接管渲染，reset 可重播
<CountUp :end="10" :is-counting="playing">
    <template #default="{ value, reset }">
        <span @click="reset()">v{{ Math.round(value) }}</span>
    </template>
</CountUp>
<\/script>

<template>
    <Button @click="playing = !playing">{{ playing ? '暂停' : '开始' }}</Button>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">CountUp <span :style="tagStyle">数字滚动</span></div>

        <div :style="labelStyle">基础用法 — isCounting 翻到 true 开始计数</div>
        <div :style="rowStyle">
            <Button @click="basic = !basic">{{ basic ? '重置' : '开始计数' }}</Button>
            <CountUp :end="8888" :is-counting="basic" @complete="lastElapsed = $event" @update="lastValue = $event" />
        </div>
        <div :style="{ fontSize: '13px', color: '#a0936e', marginTop: '10px' }">
            <template v-if="lastElapsed !== null">
                上次完成耗时 {{ lastElapsed.toFixed(2) }} 秒，最后一次 update 值 {{ lastValue }}
            </template>
        </div>

        <div :style="labelStyle">数值格式 — 小数位 / 千分位 / 自定义小数点（滚动中即可看到分隔符逐步形成）</div>
        <div :style="{ marginBottom: '12px' }">
            <Button size="small" @click="formatRound++">重播</Button>
        </div>
        <div :style="rowStyle">
            <CountUp
                :key="`fmt-thousand-${formatRound}`"
                is-counting
                :end="1320"
                :duration="1.5"
                thousands-separator=","
            />
            <CountUp
                :key="`fmt-decimal-${formatRound}`"
                is-counting
                :end="1320.5"
                :duration="1.5"
                :decimal-places="1"
                thousands-separator=","
            />
            <CountUp
                :key="`fmt-dots-${formatRound}`"
                is-counting
                :end="0.85"
                :duration="1.5"
                :decimal-places="2"
                decimal-separator="，"
            />
            <CountUp :key="`fmt-prefix-${formatRound}`" is-counting :end="88" :duration="1.5">
                <template #prefix>¥</template>
            </CountUp>
            <CountUp
                :key="`fmt-suffix-${formatRound}`"
                is-counting
                :end="99.9"
                :duration="1.5"
                :decimal-places="1"
                decimal-separator=","
            >
                <template #suffix>分</template>
            </CountUp>
        </div>

        <div :style="labelStyle">formatter — 完全接管格式化（读屏文本仍用默认格式）</div>
        <div :style="{ marginBottom: '12px' }">
            <Button size="small" @click="formatterRound++">重播</Button>
        </div>
        <div :style="rowStyle">
            <CountUp
                :key="`fmt-f1-${formatterRound}`"
                is-counting
                :end="100"
                :duration="1.5"
                :formatter="(v: number) => `${Math.round(v)} 分`"
            />
            <CountUp
                :key="`fmt-f2-${formatterRound}`"
                is-counting
                :end="66"
                :duration="1.5"
                :formatter="(v: number) => `${Math.round(v)}%`"
            />
        </div>

        <div :style="labelStyle">尺寸与风格 — 切换后自动重播</div>
        <div :style="{ marginBottom: '12px', display: 'flex', gap: '24px', flexWrap: 'wrap' }">
            <Radio
                v-model="size"
                :options="[
                    { label: 'small', value: 'small' },
                    { label: 'middle', value: 'middle' },
                    { label: 'large', value: 'large' },
                ]"
            />
            <Radio
                v-model="variant"
                :options="[
                    { label: 'default', value: 'default' },
                    { label: 'island', value: 'island' },
                ]"
            />
        </div>
        <div :style="rowStyle">
            <CountUp
                :key="`style-${styleRound}`"
                :end="12345"
                :size="size"
                :variant="variant"
                :duration="1.5"
                is-counting
            />
            <CountUp
                :key="`style-border-${styleRound}`"
                :end="12345"
                :size="size"
                :variant="variant"
                :duration="1.5"
                is-counting
                bordered
            />
        </div>

        <div :style="labelStyle">数码管逐位滚动 — digitRoll（Vue 端独有，每个数字位独立滚轮）</div>
        <div :style="{ marginBottom: '12px' }">
            <Button size="small" @click="rollRound++">重播</Button>
        </div>
        <div :style="rowStyle">
            <CountUp
                :key="`roll-${rollRound}`"
                is-counting
                digit-roll
                :end="1350"
                :duration="1.5"
                thousands-separator=","
            />
            <CountUp
                :key="`roll-frac-${rollRound}`"
                is-counting
                digit-roll
                :end="99.9"
                :duration="1.5"
                :decimal-places="1"
                decimal-separator=","
            >
                <template #suffix>分</template>
            </CountUp>
        </div>

        <div :style="labelStyle">结束庆祝动效 — 数字弹跳 + 光环 + 星芒 + 贴纸</div>
        <div :style="rowStyle">
            <Button @click="withCelebrate = !withCelebrate">{{ withCelebrate ? '重置' : '计数到 100' }}</Button>
            <CountUp :end="100" :is-counting="withCelebrate" :duration="1.2" celebrate>
                <template #celebrate>完美通关！</template>
            </CountUp>
            <CountUp :end="50" :is-counting="withCelebrate" :duration="1.2" :celebrate="{ text: '50 分' }" />
        </div>

        <div :style="labelStyle">自动重播 — repeat + repeatDelay</div>
        <div :style="rowStyle">
            <Button @click="repeatRun = !repeatRun">{{ repeatRun ? '停止' : '开始循环' }}</Button>
            <CountUp
                :end="2026"
                :is-counting="repeatRun"
                :duration="1.2"
                :repeat="repeatRun"
                :repeat-delay="0.6"
                :repeat-start-at="0"
            />
        </div>

        <div :style="labelStyle">作用域插槽 — 接管渲染，reset 重播</div>
        <div :style="rowStyle">
            <Button @click="slotRun = !slotRun">{{ slotRun ? '暂停' : '播放' }}</Button>
            <Button @click="replay">重播</Button>
            <CountUp ref="countUpRef" :end="10" :duration="1.5" :is-counting="slotRun">
                <template #default="{ value, reset }">
                    <span style="cursor: pointer" @click="reset()">v{{ Math.round(value) }}</span>
                </template>
            </CountUp>
            <Tag>点击数字或「重播」都可重新播放</Tag>
        </div>

        <div :style="labelStyle">键盘与无障碍 — 数字块 aria-hidden，静止后由读屏播报最终值</div>
        <div :style="rowStyle">
            <Button size="small" @click="ariaRound++">重播</Button>
            <CountUp :key="`aria-${ariaRound}`" :end="999" :duration="1.5" is-counting aria-label="本局得分 999 分" />
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="COUNTUP_API" />
    </div>
</template>
