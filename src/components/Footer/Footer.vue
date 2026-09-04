<script setup lang="ts">
interface Props {
    seamless?: boolean;
}

withDefaults(defineProps<Props>(), { seamless: false });
</script>

<template>
    <div
        class="animal-footer"
        :class="{ 'animal-footer--seamless': seamless }"
        aria-hidden="true"
    >
        🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄🎄
    </div>
</template>

<style lang="less" scoped>
.animal-footer {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    line-height: 1;
    letter-spacing: 12px;
    white-space: nowrap;
    overflow: hidden;
    user-select: none;

    &--seamless {
        justify-content: space-between;
        padding: 0 8px;
        letter-spacing: 0;
    }
}
</style>
