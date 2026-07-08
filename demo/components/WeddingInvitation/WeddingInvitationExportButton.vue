<script setup lang="ts">
import { ref } from 'vue';
import type { WeddingInvitationExportButtonProps } from './types';

const props = withDefaults(defineProps<WeddingInvitationExportButtonProps>(), {
    filename: 'wedding-invitation',
});

defineSlots<{ default?: () => unknown }>();

const exporting = ref(false);

const handleClick = async (): Promise<void> => {
    if (exporting.value) return;
    exporting.value = true;
    try {
        await props.target?.exportAsImage(props.filename);
    } catch (err) {
        console.error('[WeddingInvitation] 导出图片失败：', err);
        // eslint-disable-next-line no-alert
        alert(`导出失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
        exporting.value = false;
    }
};
</script>

<template>
    <button
        type="button"
        class="animal-wedding-export-btn"
        :class="props.class"
        :style="props.style"
        :disabled="exporting"
        @click="handleClick"
    >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
                d="M12 3v12m0 0l-5-5m5 5l5-5M4 17v3a1 1 0 001 1h14a1 1 0 001-1v-3"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
            />
        </svg>
        <span>{{ exporting ? '生成中…' : '' }}<slot v-if="!exporting">保存为图片</slot></span>
    </button>
</template>

<style lang="less" scoped>
.animal-wedding-export-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    color: #725d42;
    background: #fdfdf5;
    border: 2px solid rgba(114, 93, 66, 0.5);
    border-radius: 22px 20px 24px 22px / 20px 24px 22px 20px;
    box-shadow: 0 3px 0 rgba(114, 93, 66, 0.25);
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 0 rgba(114, 93, 66, 0.3);
        background: #fffbe6;
    }

    &:active:not(:disabled) {
        transform: translateY(2px);
        box-shadow: 0 1px 0 rgba(114, 93, 66, 0.25);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}
</style>
