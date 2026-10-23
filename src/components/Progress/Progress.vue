<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import sweetCorner from '../../assets/img/scene/sweet-corner.svg';
import forestGrove from '../../assets/img/scene/forest-grove.svg';
import starryCamp from '../../assets/img/scene/starry-camp.svg';
import coffeeBreak from '../../assets/img/scene/coffee-break.svg';
import type { ProgressProps, ProgressVariant } from './types';

// fill 末端留出文字宽度的阈值（避免 fill 太窄时文字外溢到 track 上被白色看不清）
const INSIDE_MIN_FILL = 18;

// 场景图 fill：图片按整条轨道宽度铺满（取上部），fill 只显示左侧进度宽的部分 = 从左揭开
const VARIANT_BG: Record<ProgressVariant, string> = {
    'sweet-corner': sweetCorner,
    'forest-grove': forestGrove,
    'starry-camp': starryCamp,
    'coffee-break': coffeeBreak,
};

const props = withDefaults(defineProps<ProgressProps>(), {
    size: 'middle',
    showInfo: true,
    // React Progress 固定将百分比置于进度条右侧；Vue 保留 infoPosition 作为扩展能力
    infoPosition: 'right',
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

// track 宽度（px）：场景图按整条轨道宽度铺满，需要实测轨道宽才能对齐「从左揭开」的裁切位置
const trackRef = ref<HTMLElement | null>(null);
const trackW = ref(0);

let ro: ResizeObserver | null = null;

function disconnectObserver() {
    ro?.disconnect();
    ro = null;
}

function observeTrack(el: HTMLElement | null) {
    disconnectObserver();
    if (!el) return;
    if (typeof ResizeObserver === 'undefined') {
        trackW.value = el.clientWidth;
        return;
    }
    ro = new ResizeObserver((entries) => {
        trackW.value = entries[0]?.contentRect?.width ?? el.clientWidth;
    });
    ro.observe(el);
    trackW.value = el.clientWidth;
}

// 轨道尺寸随容器变化，场景图的裁切基准必须跟着走
watch(trackRef, observeTrack, { flush: 'post' });
onMounted(() => observeTrack(trackRef.value));
onBeforeUnmount(disconnectObserver);

const fillStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {
        width: `${safePercent.value}%`,
        transitionDuration: `${props.duration}s`,
    };
    const scene = props.variant ? VARIANT_BG[props.variant] : undefined;
    if (scene) {
        // 传入 variant 时用场景图铺满（从左揭开）；未传时用纯色 fill
        style.backgroundImage = `url(${scene})`;
        style.backgroundRepeat = 'no-repeat';
        style.backgroundPosition = 'left top';
        style.backgroundSize = trackW.value > 0 ? `${trackW.value}px auto` : '100% auto';
    } else {
        style.backgroundColor = '#19c8b9';
    }
    return style;
});

const ariaValueNow = computed(() => Math.round(safePercent.value));

const rootClass = computed(() => ['animal-progress', props.variant ? `animal-progress--${props.variant}` : '']);
</script>

<template>
    <div
        :class="rootClass"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="ariaValueNow"
        :aria-valuetext="renderedInfo"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
    >
        <div class="animal-progress__row" :class="`animal-progress__row--${infoPosition}`">
            <div v-if="showInfo && infoPosition === 'top'" class="animal-progress__info animal-progress__info--top">
                {{ renderedInfo }}
            </div>
            <div ref="trackRef" class="animal-progress__track" :class="`animal-progress__track--${size}`">
                <div
                    class="animal-progress__fill"
                    :class="{ 'animal-progress__fill--no-transition': duration === 0 }"
                    :style="fillStyle"
                >
                    <span v-if="infoInsideVisible" class="animal-progress__info-inside">
                        {{ renderedInfo }}
                    </span>
                </div>
                <span v-if="isInside && !infoInsideVisible" class="animal-progress__info-inside" style="color: #725d42">
                    {{ renderedInfo }}
                </span>
            </div>
            <div v-if="showInfo && infoPosition === 'right'" class="animal-progress__info animal-progress__info--right">
                {{ renderedInfo }}
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

// ============================================
// Progress — Animal Island Style
// 描边岛屿 Outlined：奶油轨道 + 2px 实描边，fill 为薄荷竖向渐变
// 传 variant 时 fill 改为场景图（组件内联注入 background-image 覆盖渐变）
// ============================================

.animal-progress {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    font-family: inherit;
    line-height: 1;
    user-select: none;
    vertical-align: middle;
    width: 100%;

    &__row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        flex: 1 1 auto;
        min-width: 0;

        // 文字置于进度条上方：改成纵向排布
        &--top {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
        }
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

    // ---------- Track ----------
    // 实描边替掉原先的内阴影凹槽：内阴影在浅色底上几乎看不出凹陷，
    // 描边则无论轨道落在什么底色上都能界定边界。波点只保留原来的小点层。
    &__track {
        position: relative;
        box-sizing: border-box; // 高度含描边，保证 size 的 14/24/32px 是总高
        flex: 1 1 auto;
        width: 100%;
        min-width: 80px;
        background:
            radial-gradient(circle, rgba(196, 184, 158, 0.1) 1.5px, transparent 1.5px) 7px 7px / 14px 14px,
            @bg-color;
        border: 2px solid #e2d6bd;
        border-radius: 999px; // pill
        overflow: hidden;

        &--small {
            height: 14px;
        }

        &--middle {
            height: 24px;
        }

        &--large {
            height: 32px;
        }

        &--large .animal-progress__info-inside {
            font-size: 13px;
        }

        &--small .animal-progress__info-inside {
            font-size: 10px;
            right: 4px;
        }
    }

    // ---------- Fill (当前进度) ----------
    // 默认竖向渐变 + 顶部内高光；传 variant 时组件内联注入的
    // background-image 会整体覆盖这条渐变，场景图直接生效。
    &__fill {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 0;
        border-radius: 999px;
        background: linear-gradient(180deg, #3dd4c6 0%, #19c8b9 60%, #14b6a8 100%);
        box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.45);
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

    // 100% 完成态：提亮为主，整体读作「已抵达」而不是「还在加载」。
    // 挂在根节点的 aria-valuenow 上，无需改动组件逻辑。
    &[aria-valuenow='100'] &__fill {
        background: linear-gradient(180deg, #7fe0d5 0%, #3dd4c6 100%);
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

@media (prefers-reduced-motion: reduce) {
    .animal-progress__fill {
        transition: none;
    }
}
</style>
