<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, useAttrs } from 'vue';

const attrs = useAttrs();

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    timer = setInterval(() => {
        now.value = new Date();
    }, 1000);
});
onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});

function pad(n: number) {
    return n.toString().padStart(2, '0');
}
</script>

<template>
    <div class="animal-time" role="timer" aria-live="off" v-bind="attrs">
        <div class="animal-time__clock">
            {{ pad(now.getHours()) }}
            <span class="animal-time__colon">:</span>
            {{ pad(now.getMinutes()) }}
        </div>
        <div class="animal-time__date">
            <span class="animal-time__weekday">{{ weekdays[now.getDay()] }}</span>
            <span class="animal-time__dot" aria-hidden="true">·</span>
            <span class="animal-time__month-day">{{ months[now.getMonth()] }} {{ now.getDate() }}</span>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

// 实时时钟卡片：垂直排布，无边框软影面板 + 主色日期胶囊，与 React 端 time.module.less 对齐
.animal-time {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: @spacing-md;
    box-sizing: border-box;
    width: fit-content;
    padding: 20px 32px 15px 32px;
    border-radius: 20px;
    background: #fff;
    box-shadow: @shadow-sm;
    font-family: @font-family;
    animation: animal-time-fade-in @motion-duration-slow @motion-ease;

    // 上方时钟：HH:MM，等宽数字；数字与冒号处于同一文本行
    &__clock {
        color: @text-color;
        font-weight: 900;
        font-size: 44px;
        font-variant-numeric: tabular-nums;
        letter-spacing: 1px;
        line-height: 1;
        white-space: nowrap;
    }

    // 冒号：按秒闪烁
    &__colon {
        display: inline-block;
        margin: 0;
        transform: translateY(-0.11em);
        animation: animal-time-blink 1s step-end infinite;
    }

    // 下方日期胶囊：主色底圆角胶囊，星期 · 月日
    &__date {
        display: inline-flex;
        align-items: center;
        gap: @spacing-xs;
        padding: 4px 14px;
        border-radius: 999px;
        background: @primary-color-bg;
        font-size: @font-size-sm;
        font-weight: 700;
        color: @text-color-secondary;
        white-space: nowrap;
    }

    &__weekday {
        color: @primary-color;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    &__dot {
        color: @text-color-disabled;
    }

    &__month-day {
        font-variant-numeric: tabular-nums;
    }
}

@keyframes animal-time-fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes animal-time-blink {
    50% {
        opacity: 0;
    }
}
</style>
