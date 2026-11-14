<script setup lang="ts">
/**
 * 帆船随波逐流。
 *
 * 图形取自 naive-icons 的 sailboat（MIT），底部那条波浪线需要单独成层做横向滚动，
 * 而图标组件不暴露内部路径，所以逐路径复制到这里。
 */

/** 波浪路径：与 naive-icons 的 sailboat 波浪完全一致 */
const WAVE_PATH =
    'M4.85 43.15 C 8.68 41.24 10.59 45.07 14.42 43.15 C 18.25 41.24 20.17 45.07 24 43.15 C 27.83 41.24 29.75 45.07 33.58 43.15 C 37.41 41.24 39.32 45.07 43.15 43.15';

/**
 * 波浪路径横跨 4.85 → 43.15，且 4 段完全等长（每段 9.575），因此整条路径的波形
 * 以 9.575 为周期、38.3 为整周期。路径本身从 x=4.85 起画，把整条平移 -4.85 让
 * 第 0 份正好从画布原点开始，再按 38.3 铺开。
 */
const WAVE_TILE = 38.3;
const WAVE_ORIGIN = -4.85;
const WAVE_OFFSETS = [-2, -1, 0, 1].map((k) => WAVE_ORIGIN + k * WAVE_TILE);

/**
 * 露出的波浪只取中间 3 个波形周期（28.74 单位），比船身窄一截。
 * 窗口用 clipPath 硬切，不做渐变淡出。
 *
 * 线宽同步收细到 1.9 —— 波浪变短后若沿用原来的 2.5，会从一道水纹变成一条粗带子。
 */
const WAVE_WIN_X = 9.63;
const WAVE_WIN_W = 28.74;
const WAVE_STROKE = 1.9;
/** 每个窗口宽度滚一次 */
const WAVE_SCROLL = WAVE_WIN_W;
/** 波浪整体下沉一点，让船身与水面之间留出一道空隙（船底在 y=39.32，波峰在 41.24） */
const WAVE_DROP = 1.2;
/**
 * 船身单独缩小，缩放支点取船底中心 (24, 39.32) —— 船底留在原处、水面不动，
 * 只是船变小了；波浪完全不受影响。
 */
const BOAT_SCALE = 0.8;
const BOAT_PIVOT_X = 24;
const BOAT_PIVOT_Y = 39.32;

/**
 * 同一页面可能渲染多个帆船，<use> 与裁剪区的引用目标必须逐实例唯一。
 * 与本仓库其他组件（Radio / Rate / Select 等）用随机串生成唯一 id 的做法一致。
 */
const uid = Math.random().toString(36).slice(2, 10);
const waveId = `animal-loading-wave-${uid}`;
const clipId = `animal-loading-wave-clip-${uid}`;

/** 船身缩放：支点放在船底中心，船底留在原处、水面不动 */
const boatTransform = `translate(${BOAT_PIVOT_X} ${BOAT_PIVOT_Y}) scale(${BOAT_SCALE}) translate(${-BOAT_PIVOT_X} ${-BOAT_PIVOT_Y})`;
</script>

<template>
    <svg
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="#2A2A2A"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="animal-sailboat"
        role="presentation"
    >
        <defs>
            <path :id="waveId" :d="WAVE_PATH" stroke="#2A9D8F" :stroke-width="WAVE_STROKE" fill="none" />
            <clipPath :id="clipId">
                <rect :x="WAVE_WIN_X" y="0" :width="WAVE_WIN_W" height="48" />
            </clipPath>
        </defs>

        <g :transform="boatTransform">
            <g class="animal-sailboat__boat">
                <path d="M22.08 9.64 L 22.08 27.83 L 9.64 27.83 Z" fill="#E76F51" />
                <path d="M25.92 6.76 L 25.92 27.83 L 39.32 27.83 Z" fill="#FAEDCD" />
                <path d="M24 4.85 L 24 29.75" stroke="#2A2A2A" stroke-width="3" />
                <path d="M7.72 31.66 L 40.28 31.66 L 35.49 39.32 L 12.51 39.32 Z" fill="#8B5E3C" />
                <circle cx="29.75" cy="17.3" r="1.53" fill="#E76F51" stroke="none" />
            </g>
        </g>

        <g :clip-path="`url(#${clipId})`">
            <g :transform="`translate(0 ${WAVE_DROP})`">
                <!-- 滚动距离由脚本常量下发，样式侧只读不写，避免两处数字对不上 -->
                <g class="animal-sailboat__wave" :style="{ '--animal-sailboat-wave-scroll': `${WAVE_SCROLL}px` }">
                    <use
                        v-for="offset in WAVE_OFFSETS"
                        :key="offset"
                        :href="`#${waveId}`"
                        :transform="`translate(${offset} 0)`"
                    />
                </g>
            </g>
        </g>
    </svg>
</template>

<style lang="less" scoped>
// ============================================
// Sailboat — 帆船随波逐流
// 图形取自 naive-icons 的 sailboat（MIT），波浪层单独铺开做横向滚动
// ============================================

.animal-sailboat {
    display: block;
    width: 100%;
    height: auto;
}

// 船身浮沉：上下轻移并微微摇曳
.animal-sailboat__boat {
    animation: animal-sailboat-bob 1s ease-in-out infinite alternate;
}

// 波浪层：整条路径横移一个可见窗口的宽度（28.74 user units），与起点无缝衔接
.animal-sailboat__wave {
    animation: animal-sailboat-wave 4s linear infinite;
}

@keyframes animal-sailboat-bob {
    from {
        transform: translateY(0) rotate(0deg);
    }
    to {
        transform: translateY(-2px) rotate(1deg);
    }
}

@keyframes animal-sailboat-wave {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(var(--animal-sailboat-wave-scroll, 28.73px));
    }
}

// ---------- Reduced motion ----------
// 暂停而不是移除：波浪路径的静止位置就在画布内，`animation: none` 只是让水停住，
// 船仍在原位 —— 画面不会塌成空白
@media (prefers-reduced-motion: reduce) {
    .animal-sailboat__boat,
    .animal-sailboat__wave {
        animation: none;
    }
}
</style>
