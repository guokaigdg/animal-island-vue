<script setup lang="ts">
defineSlots<{ default?: () => unknown }>();
</script>

<template>
    <div class="animal-cursor">
        <slot />
    </div>
</template>

<style>
.animal-cursor,
.animal-cursor * {
    cursor: url('../../assets/img/cursor/cursor-icon.png') 4 0, auto !important;
}
</style>
