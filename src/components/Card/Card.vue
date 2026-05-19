<script setup lang="ts">
import type { CardColor, CardType } from './types';

interface Props {
    type?: CardType;
    color?: CardColor;
}

withDefaults(defineProps<Props>(), {
    type: 'default',
    color: 'default',
});

defineSlots<{ default?: () => unknown }>();
</script>

<template>
    <div
        class="animal-card"
        :class="[`animal-card--${type}`, `animal-card--color-${color}`]"
    >
        <slot />
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-card {
    font-weight: 500;
    transition: all 0.3s ease-out;
    cursor: pointer;

    // ---------- Type ----------
    &--default {
        border-radius: 20px;
        padding: 16px 24px;

        &:hover {
            transform: translateY(-2px);
        }
    }
    &--title {
        border-radius: 40px 35px 45px 38px / 38px 45px 35px 40px;
        padding: 12px 32px;
        font-weight: 600;
        background: #fdfdf5;
    }
    &--dashed {
        border-radius: 20px;
        padding: 16px 24px;
        border: 2px dashed #e8dcc8;
        background: rgb(250, 248, 242);

        &:hover {
            border-color: #d4c4a8;
            transform: translateY(0);
        }
    }

    // ---------- Color ----------
    &--color-default.animal-card--default {
        background: rgb(247, 243, 223);
        color: #725d42;
    }
    &--color-app-pink { background: #f8a6b2; color: #fff; }
    &--color-purple { background: #b77dee; color: #fff; }
    &--color-app-blue { background: #889df0; color: #fff; }
    &--color-app-yellow { background: #f7cd67; color: #725d42; }
    &--color-app-orange { background: #e59266; color: #fff; }
    &--color-app-teal { background: #82d5bb; color: #fff; }
    &--color-app-green { background: #8ac68a; color: #fff; }
    &--color-app-red { background: #fc736d; color: #fff; }
    &--color-lime-green { background: #d1da49; color: #3d5a1a; }
    &--color-yellow-green { background: #ecdf52; color: #725d42; }
    &--color-brown { background: #9a835a; color: #fff; }
    &--color-warm-peach-pink { background: #e18c6f; color: #fff; }
}
</style>
