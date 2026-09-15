<script setup lang="ts">
import Icon from './Icon.vue';

defineOptions({ inheritAttrs: false });
</script>

<template>
    <Icon name="Music" v-bind="$attrs" />
</template>
