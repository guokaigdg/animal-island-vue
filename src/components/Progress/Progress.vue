<script setup lang="ts">
import { computed } from 'vue';
import type { ProgressProps } from './types';

// fill 末端留出文字宽度的阈值（避免 fill 太窄时文字外溢到 track 上被白色看不清）
const INSIDE_MIN_FILL = 18;

const props = withDefaults(defineProps<ProgressProps>(), {
    size: 'middle',
    showInfo: true,
    infoPosition: 'inside',
    duration: 0.6,
});

const safePercent = computed(() => {
    const p = props.percent;
    if (typeof p !== 'number' || Number.isNaN(p)) return 0;
    return Math.max(0, Math.min(100, p));
});

const renderedInfo = computed(() => {
    if (props.infoFormat) return props.infoFormat(safePercent.value);
    return `${Math.round(safePercent.value)}%`;
});

// inside 模式：fill 过窄时把文字退到 track 末端右侧（避免白色文字落在沙土色 track 上看不清）
const isInside = computed(() => props.showInfo && props.infoPosition === 'inside');
const infoInsideVisible = computed(() => isInside.value && safePercent.value >= INSIDE_MIN_FILL);

const fillStyle = computed(() => ({
    width: `${safePercent.value}%`,
    transitionDuration: `${props.duration}s`,
}));

const ariaValueNow = computed(() => Math.round(safePercent.value));
</script>

<template>
    <div
        class="animal-progress"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="ariaValueNow"
        :aria-valuetext="renderedInfo"
    >
        <div
            v-if="infoPosition === 'top'"
            class="animal-progress__body"
            :class="{ 'animal-progress__body--no-gap': infoPosition !== 'top' }"
        >
            <div v-if="showInfo" class="animal-progress__info animal-progress__info--top">
                {{ renderedInfo }}
            </div>
            <div
                class="animal-progress__track"
                :class="`animal-progress__track--${size}`"
            >
                <div
                    class="animal-progress__fill"
                    :class="{ 'animal-progress__fill--no-transition': duration === 0 }"
                    :style="fillStyle"
                >
                    <span v-if="infoInsideVisible" class="animal-progress__info-inside">
                        {{ renderedInfo }}
                    </span>
                </div>
                <span
                    v-if="isInside && !infoInsideVisible"
                    class="animal-progress__info-inside"
                    style="color: #725d42"
                >
                    {{ renderedInfo }}
                </span>
            </div>
        </div>
        <div v-else class="animal-progress__row">
            <div
                class="animal-progress__track"
                :class="`animal-progress__track--${size}`"
            >
                <div
                    class="animal-progress__fill"
                    :class="{ 'animal-progress__fill--no-transition': duration === 0 }"
                    :style="fillStyle"
                >
                    <span v-if="infoInsideVisible" class="animal-progress__info-inside">
                        {{ renderedInfo }}
                    </span>
                </div>
                <span
                    v-if="isInside && !infoInsideVisible"
                    class="animal-progress__info-inside"
                    style="color: #725d42"
                >
                    {{ renderedInfo }}
                </span>
            </div>
            <div
                v-if="showInfo && infoPosition === 'right'"
                class="animal-progress__info animal-progress__info--right"
            >
                {{ renderedInfo }}
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-progress {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    font-family: inherit;
    line-height: 1;
    user-select: none;
    vertical-align: middle;
    width: 100%;

    &__body {
        flex: 1 1 auto;
        min-width: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 6px;

        &--no-gap {
            gap: 0;
        }
    }

    &__row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        flex: 1 1 auto;
        min-width: 0;
    }

    &__info {
        font-weight: 700;
        color: #725d42;
        white-space: nowrap;
        flex-shrink: 0;
        letter-spacing: 0.02em;

        &--right {
            min-width: 44px;
            text-align: right;
        }

        &--top {
            align-self: flex-end;
        }
    }

    &__track {
        position: relative;
        flex: 1 1 auto;
        width: 100%;
        min-width: 80px;
        background: #f8f8f0;
        border: 2px solid #e8dcc8;
        box-shadow: inset 0 2px 4px rgba(114, 93, 66, 0.08);
        overflow: hidden;
        border-radius: 999px;

        &--small {
            height: 12px;
            border-width: 1.5px;
        }

        &--middle {
            height: 20px;
        }

        &--large {
            height: 28px;
        }

        &--large .animal-progress__info-inside {
            font-size: 13px;
        }

        &--small .animal-progress__info-inside {
            font-size: 9px;
            right: 4px;
        }
    }

    &__fill {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 0;
        border-radius: 999px;
        background: #0ec4b6;
        background-image: repeating-linear-gradient(
            -45deg,
            #0ec4b6 0,
            #0ec4b6 10px,
            #01b0a7 10px,
            #01b0a7 20px
        );
        background-size: 28.28px 28.28px;
        animation: animal-progress-stripe 1s linear infinite;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 4px;

        &--no-transition {
            transition: none;
        }
    }

    &__info-inside {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: #fff;
        font-weight: 800;
        font-size: 11px;
        letter-spacing: 0.02em;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
        pointer-events: none;
        white-space: nowrap;
        z-index: 1;
    }
}

@keyframes animal-progress-stripe {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: -28.28px 0;
    }
}

@media (prefers-reduced-motion: reduce) {
    .animal-progress__fill {
        transition: none;
        animation: none;
    }
}
</style>
