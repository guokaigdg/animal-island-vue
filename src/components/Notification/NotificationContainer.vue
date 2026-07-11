<script setup lang="ts">
import { computed } from 'vue';
import NotificationView from './NotificationView.vue';
import { notificationStore, removeNotification } from './Notification';

const POSITION_GROUPS = ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight'] as const;

const groups = computed(() =>
    POSITION_GROUPS.map((position) => ({
        position,
        items: notificationStore.items.filter((it) => it.position === position),
    })).filter((g) => g.items.length > 0)
);

function handleRemove(key: string) {
    removeNotification(key);
}
</script>

<template>
    <div class="animal-notification-root">
        <template v-for="group in groups" :key="group.position">
            <div
                class="animal-notification__position"
                :class="`animal-notification__position--${group.position}`"
                :data-position="group.position"
            >
                <NotificationView
                    v-for="item in group.items"
                    :key="item.key"
                    :item="item"
                    @remove="handleRemove"
                />
            </div>
        </template>
    </div>
</template>

<style>
.animal-notification-root {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2000;
}

.animal-notification__position {
    position: fixed;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
    max-width: calc(100vw - 32px);
}

.animal-notification__position--top {
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
}

.animal-notification__position--topLeft {
    top: 24px;
    left: 24px;
    align-items: flex-start;
}

.animal-notification__position--topRight {
    top: 24px;
    right: 24px;
    align-items: flex-end;
}

.animal-notification__position--bottom {
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
    flex-direction: column-reverse;
}

.animal-notification__position--bottomLeft {
    bottom: 24px;
    left: 24px;
    align-items: flex-start;
    flex-direction: column-reverse;
}

.animal-notification__position--bottomRight {
    bottom: 24px;
    right: 24px;
    align-items: flex-end;
    flex-direction: column-reverse;
}
</style>
