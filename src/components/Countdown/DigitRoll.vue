<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
    /** 当前显示的数字（'0' - '9'） */
    digit: string;
}>();

const DIGIT_FACES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

const stripRef = ref<HTMLSpanElement | null>(null);
// pos 为 20 面数字条上的索引，pos % 10 即显示的数字
const pos = ref(Number(props.digit));
const prevDigit = ref(props.digit);

function applyTransform(el: HTMLElement, index: number) {
    el.style.transform = `translateY(-${index * 5}%)`;
}

onMounted(() => {
    if (stripRef.value) applyTransform(stripRef.value, pos.value);
});

/**
 * 单向向下滚动（里程表式）：减 1 走 1 步，0→9 回绕也走 1 步；
 * 跨循环回绕时先关过渡瞬移到同数字的下一循环位置（视觉无变化），
 * 强制回流后再继续向下滚动，保证方向永远一致。
 */
watch(
    () => props.digit,
    (digit) => {
        const el = stripRef.value;
        if (!el) return;
        const prev = Number(prevDigit.value);
        const next = Number(digit);
        prevDigit.value = digit;
        if (prev === next) return;

        // 向下滚动的步数
        const delta = (prev - next + 10) % 10;
        let from = pos.value;
        let target = from - delta;

        if (target < 0) {
            from += 10;
            target = from - delta;
            el.style.transition = 'none';
            applyTransform(el, from);
            void el.offsetHeight; // 强制回流，让瞬移先生效
            el.style.transition = '';
        }

        pos.value = target;
        applyTransform(el, target);
    }
);
</script>

<template>
    <span class="animal-countdown__digit-cell">
        <span ref="stripRef" class="animal-countdown__digit-strip">
            <span v-for="(face, i) in [...DIGIT_FACES, ...DIGIT_FACES]" :key="i" class="animal-countdown__digit-face">
                {{ face }}
            </span>
        </span>
    </span>
</template>

<style lang="less" scoped>
.animal-countdown__digit-cell {
    display: inline-block;
    overflow: hidden;
    height: 1.2em;
}

.animal-countdown__digit-strip {
    display: flex;
    flex-direction: column;
    transition: transform 0.35s var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1));
    will-change: transform;
}

.animal-countdown__digit-face {
    display: block;
    height: 1.2em;
    // 与 Time 组件数字同色 #8b7355（900 字重、等宽数字）
    color: #8b7355;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    text-align: center;
}
</style>
