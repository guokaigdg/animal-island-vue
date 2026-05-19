<script setup lang="ts">
import { ref } from 'vue';
import { Card } from '../src';

defineProps<{
    feature: { icon: string; title: string; desc: string };
}>();

const hovered = ref(false);
</script>

<template>
    <Card
        :style="{
            padding: '24px 20px',
            textAlign: 'center',
            transform: hovered ? 'translateY(-4px)' : 'none',
            boxShadow: hovered ? '0 8px 24px rgba(114, 93, 66, 0.15)' : 'none',
            transition: 'all 0.3s ease',
        }"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
    >
        <img
            :src="feature.icon"
            :alt="feature.title"
            :style="{
                width: '42px',
                height: '42px',
                transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1) rotate(0deg)',
                transition: 'transform 0.3s ease',
            }"
        />
        <div class="title">{{ feature.title }}</div>
        <div class="desc">{{ feature.desc }}</div>
    </Card>
</template>

<style scoped>
.title {
    font-size: 15px;
    font-weight: 700;
    color: #725d42;
    margin-top: 12px;
    margin-bottom: 6px;
}
.desc {
    font-size: 13px;
    color: #7c5734;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
