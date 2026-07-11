<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { WalletProps, WalletSize } from './types';
import bagIcon from '../../assets/img/icons/items/item-022.png';

const props = withDefaults(defineProps<WalletProps>(), {
    value: '00,000',
    size: 'medium',
    thousandSeparator: ',',
});

const slots = useSlots();

/** 数值格式化：仅对 number 类型按千分位插入分隔符 */
const formatValue = (value: WalletProps['value'], sep: string): string => {
    if (value === undefined || value === null) return '00,000';
    if (typeof value !== 'number') return String(value);
    if (!sep) return String(value);
    const sign = value < 0 ? '-' : '';
    const [int, frac] = Math.abs(value).toString().split('.');
    const intWithSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return frac ? `${sign}${intWithSep}.${frac}` : `${sign}${intWithSep}`;
};

const displayValue = computed(() => formatValue(props.value, props.thousandSeparator));
const resolvedIcon = computed(() => props.icon || bagIcon);
const hasIconSlot = computed(() => !!slots.icon);

const SIZE_CLASS: Record<WalletSize, string> = {
    small: 'animal-wallet--small',
    medium: '',
    large: 'animal-wallet--large',
};
const sizeClass = computed(() => SIZE_CLASS[props.size]);
</script>

<template>
    <div class="animal-wallet" :class="sizeClass">
        <div class="animal-wallet__bag-slot" aria-hidden="true">
            <slot v-if="hasIconSlot" name="icon" />
            <img v-else class="animal-wallet__bag-img" :src="resolvedIcon" alt="" draggable="false" />
        </div>
        <div class="animal-wallet__pill">
            <span class="animal-wallet__value">{{ displayValue }}</span>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

@wallet-pill-fill: #b3a046; // 橄榄黄主色
@wallet-halo: #fffbe7; // 外发光奶油色
@wallet-text: #ffffff;
@wallet-text-shadow: rgba(91, 78, 30, 0.55);

.animal-wallet {
    --wallet-pill-w: 132px;
    --wallet-pill-h: 42px;
    --wallet-bag: 50px;
    --wallet-text-size: 17px;
    --wallet-halo: 4px;

    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    width: var(--wallet-pill-w);
    // 顶部留出钱袋上凸的空间（70% 钱袋在 pill 上方）
    padding-top: calc(var(--wallet-bag) * 0.7);
    user-select: none;
    line-height: 1;
}

// 尺寸预设
.animal-wallet--small {
    --wallet-pill-w: 96px;
    --wallet-pill-h: 32px;
    --wallet-bag: 38px;
    --wallet-text-size: 12px;
    --wallet-halo: 3px;
}

.animal-wallet--large {
    --wallet-pill-w: 176px;
    --wallet-pill-h: 54px;
    --wallet-bag: 66px;
    --wallet-text-size: 22px;
    --wallet-halo: 6px;
}

// 钱袋图标插槽：上凸于 pill
.animal-wallet__bag-slot {
    position: absolute;
    left: 50%;
    top: 0;
    width: var(--wallet-bag);
    height: var(--wallet-bag);
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 2;
    filter: drop-shadow(0 4px 6px rgba(91, 78, 30, 0.18));
}

.animal-wallet__bag-img {
    width: 80%;
    height: 80%;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
}

// pill 胶囊本体
.animal-wallet__pill {
    position: relative;
    width: 100%;
    height: var(--wallet-pill-h);
    border-radius: 999px;
    background: @wallet-pill-fill;
    // 内阴影模拟暗部，外白色 ring 模拟奶油描边
    box-shadow:
        inset 0 -6px 0 rgba(91, 78, 30, 0.18),
        inset 0 0 0 2px rgba(91, 78, 30, 0.12),
        0 0 0 var(--wallet-halo) @wallet-halo,
        0 6px 14px rgba(91, 78, 30, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
}

// 数字文本
.animal-wallet__value {
    font-family: 'Nunito', 'Noto Sans SC', system-ui, sans-serif;
    font-weight: 800;
    font-size: var(--wallet-text-size);
    color: @wallet-text;
    letter-spacing: 0.04em;
    // 双层 text-shadow 模拟描边
    text-shadow:
        0 2px 0 @wallet-text-shadow,
        0 0 1px @wallet-text-shadow;
    // 防止数字宽度跳动
    font-variant-numeric: tabular-nums;
    padding: 0 12px;
    white-space: nowrap;
}

// 鼠标悬停时钱袋轻微跳动
.animal-wallet:hover .animal-wallet__bag-slot {
    animation: walletBagBounce 0.5s ease-in-out;
}

@keyframes walletBagBounce {
    0%,
    100% {
        transform: translateX(-50%) translateY(0) rotate(0deg);
    }
    35% {
        transform: translateX(-50%) translateY(-8px) rotate(-6deg);
    }
    70% {
        transform: translateX(-50%) translateY(-2px) rotate(3deg);
    }
}
</style>
