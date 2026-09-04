<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue';
import DigitRoll from './DigitRoll.vue';
import type { CountdownProps } from './types';

const props = withDefaults(defineProps<CountdownProps>(), {
    format: 'HH:mm:ss',
    size: 'middle',
    variant: 'default',
    bordered: false,
});

const emit = defineEmits<{
    (e: 'change', remaining: number): void;
    (e: 'finish'): void;
}>();

// vue-tsc 2.2.0 对 useSlots() 的类型推断有缺陷，这里显式标注绕过
const slots = useSlots() as { prefix?: () => unknown };

const toTimestamp = (value: number | Date) => (value instanceof Date ? value.getTime() : value);

const getRemaining = () => Math.max(0, toTimestamp(props.value) - Date.now());

const remaining = ref(getRemaining());
let timer: ReturnType<typeof setInterval> | null = null;
let finished = false;

function stopTimer() {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }
}

function update(): number {
    const next = getRemaining();
    remaining.value = next;
    emit('change', next);

    if (next === 0) {
        if (!finished) {
            finished = true;
            emit('finish');
        }
        // 归零后清除定时器，避免 setInterval 空转
        stopTimer();
    }
    return next;
}

function start() {
    stopTimer();
    finished = false;
    if (update() > 0) {
        timer = setInterval(update, 250);
    }
}

onMounted(start);
watch(() => props.value, start);
onBeforeUnmount(stopTimer);

const pad = (value: number) => String(value).padStart(2, '0');

type TimePart = { kind: 'token'; token: 'DD' | 'HH' | 'mm' | 'ss' } | { kind: 'literal'; text: string };

/** 将格式模板解析为 token / 字面量序列，字面量（":"、"天" 等）原样渲染为分隔符 */
function parseFormat(format: string): TimePart[] {
    const parts: TimePart[] = [];
    const re = /DD|HH|mm|ss/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(format)) !== null) {
        if (m.index > last) parts.push({ kind: 'literal', text: format.slice(last, m.index) });
        parts.push({ kind: 'token', token: m[0] as 'DD' | 'HH' | 'mm' | 'ss' });
        last = m.index + m[0].length;
    }
    if (last < format.length) parts.push({ kind: 'literal', text: format.slice(last) });
    return parts;
}

function splitRemaining(remaining: number, format: string) {
    const totalSeconds = Math.ceil(remaining / 1_000);
    const days = Math.floor(totalSeconds / 86_400);
    const hasDays = format.includes('DD');
    const hours = hasDays ? Math.floor((totalSeconds % 86_400) / 3_600) : Math.floor(totalSeconds / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;
    return { DD: pad(days), HH: pad(hours), mm: pad(minutes), ss: pad(seconds) } as const;
}

const parts = computed(() => parseFormat(props.format));
const digits = computed(() => splitRemaining(remaining.value, props.format));

interface RenderToken {
    kind: 'token';
    token: 'DD' | 'HH' | 'mm' | 'ss';
    chars: string[];
}
interface RenderLiteral {
    kind: 'literal';
    text: string;
    colon: boolean;
}

const renderParts = computed<(RenderToken | RenderLiteral)[]>(() =>
    parts.value.map((part) =>
        part.kind === 'token'
            ? { kind: 'token', token: part.token, chars: digits.value[part.token].split('') }
            : { kind: 'literal', text: part.text, colon: /[:：]/.test(part.text) }
    )
);

// 读屏文本：滚动数字条对辅助技术隐藏，用完整格式化串代替
const readable = computed(() =>
    parts.value.map((part) => (part.kind === 'token' ? digits.value[part.token] : part.text)).join('')
);

const rootClass = computed(() => [
    'animal-countdown',
    `animal-countdown--${props.size}`,
    `animal-countdown--${props.variant}`,
    { 'animal-countdown--bordered': props.bordered },
]);
</script>

<template>
    <div :class="rootClass" role="timer" aria-live="off">
        <span v-if="slots.prefix" class="animal-countdown__prefix">
            <slot name="prefix" />
        </span>
        <span class="animal-countdown__group" aria-hidden="true">
            <template v-for="(part, i) in renderParts" :key="i">
                <span v-if="part.kind === 'token'" class="animal-countdown__unit">
                    <DigitRoll v-for="(d, j) in part.chars" :key="j" :digit="d" />
                </span>
                <span v-else :class="part.colon ? 'animal-countdown__colon' : 'animal-countdown__sep'">
                    {{ part.text }}
                </span>
            </template>
        </span>
        <span class="animal-countdown__sr-only">{{ readable }}</span>
    </div>
</template>

<style lang="less" scoped>
.animal-countdown {
    display: inline-flex;
    align-items: center;
    gap: var(--animal-spacing-sm, 8px);
    box-sizing: border-box;
    width: fit-content;
    color: var(--animal-text-color, #794f27);
    font-family: var(--animal-font-family, 'Nunito', 'Noto Sans SC');
    font-weight: 700;
    border-radius: 20px;
    transition: transform var(--animal-motion-duration-base, 0.2s)
        var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1));

    &__prefix {
        color: var(--animal-text-color-secondary, #725d42);
        font-weight: 600;
        white-space: nowrap;
    }

    &__group {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    &__unit {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        box-sizing: border-box;
        padding: 3px 8px;
        border-radius: 12px;
        // 与 Time 组件同款渐变底；边框由 bordered 属性控制，默认无
        background: linear-gradient(180deg, #fff 0%, #f8f8f0 100%);
    }

    &__sep {
        color: #8b7355;
        font-weight: 700;
        white-space: pre;
    }

    // 时间冒号：参考 Time 组件，放大加粗并轻微上移光学居中
    &__colon {
        color: #8b7355;
        font-weight: 900;
        white-space: pre;
        position: relative;
        top: -0.08em;
    }

    // 读屏专用文本：滚动数字条对辅助技术不可见
    &__sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
    }
}

// ---------- 根元素修饰类（必须在顶层定义，嵌套会编译成后代选择器） ----------

.animal-countdown--default {
    padding: 12px 18px;
    background: var(--animal-bg-color, #fff);
    box-shadow: var(--animal-shadow-sm, 0 2px 4px rgba(61, 52, 40, 0.06));
}

.animal-countdown--island {
    padding: 13px 20px;
    background: rgb(247, 243, 223);
    border: 2px dashed #d4c4a8;
}

.animal-countdown--island .animal-countdown__unit {
    background: linear-gradient(180deg, #fffdf4 0%, #f8f8f0 100%);
}

// bordered=true 时数字块带细边框
.animal-countdown--bordered .animal-countdown__unit {
    border: 1.5px solid #d4c9b4;
}

.animal-countdown--bordered.animal-countdown--island .animal-countdown__unit {
    border-color: #d4c4a8;
}

// ---------- 尺寸（数字位字号作用于 DigitRoll 根元素，子组件根节点继承父级 scoped 标签） ----------

.animal-countdown--small {
    min-height: 40px;
    font-size: 13px;

    .animal-countdown__colon {
        font-size: 20px;
    }

    .animal-countdown__digit-cell {
        font-size: 20px;
    }
}

.animal-countdown--middle {
    min-height: 48px;
    font-size: 14px;

    .animal-countdown__colon {
        font-size: 26px;
    }

    .animal-countdown__digit-cell {
        font-size: 26px;
    }
}

.animal-countdown--large {
    min-height: 56px;
    font-size: 16px;

    .animal-countdown__colon {
        font-size: 34px;
    }

    .animal-countdown__digit-cell {
        font-size: 34px;
    }
}

@media (max-width: 480px) {
    .animal-countdown {
        max-width: 100%;
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>
