<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import Cursor from '../Cursor/Cursor.vue';
import Button from '../Button/Button.vue';
import Typewriter from '../Typewriter/Typewriter.vue';

interface Props {
    open: boolean;
    title?: string;
    width?: number | string;
    maskClosable?: boolean;
    showFooter?: boolean;
    typewriter?: boolean;
    typeSpeed?: number;
}

const props = withDefaults(defineProps<Props>(), {
    width: 520,
    maskClosable: true,
    showFooter: true,
    typewriter: true,
    typeSpeed: 80,
});

const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'close'): void;
    (e: 'ok'): void;
}>();

defineSlots<{
    default?: () => unknown;
    title?: () => unknown;
    footer?: () => unknown;
}>();

const widthStyle = computed(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}));

const playKey = ref(0);

function handleClose() {
    emit('update:open', false);
    emit('close');
}

function handleOk() {
    emit('ok');
}

function handleMask() {
    if (props.maskClosable) handleClose();
}

function handleEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose();
}

watch(
    () => props.open,
    (v) => {
        if (typeof document === 'undefined') return;
        if (v) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEsc);
            playKey.value += 1;
        } else {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEsc);
        }
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
    }
});
</script>

<template>
    <Teleport to="body">
        <Cursor v-if="open">
            <div class="animal-modal__mask" @click="handleMask">
                <div
                    class="animal-modal"
                    :style="widthStyle"
                    role="dialog"
                    aria-modal="true"
                    @click.stop
                >
                    <svg class="animal-modal__svg-defs" aria-hidden="true">
                        <clipPath id="animal-modal-clip" clipPathUnits="objectBoundingBox">
                            <path d="M0.501,0.005 L0.501,0.005 L0.523,0.005 L0.549,0.006 C0.704,0.01,0.796,0.017,0.825,0.027 L0.827,0.028 C0.872,0.045,0.939,0.044,0.978,0.17 C1,0.254,1,0.365,0.99,0.505 L0.988,0.513 C0.979,0.558,0.971,0.598,0.965,0.633 C0.956,0.689,0.979,0.77,0.964,0.865 C0.953,0.928,0.921,0.966,0.869,0.979 C0.821,0.986,0.773,0.992,0.726,0.995 L0.712,0.996 L0.694,0.997 C0.648,1,0.586,1,0.507,1 L0.501,1 L0.464,1 C0.385,1,0.325,0.998,0.283,0.995 C0.234,0.992,0.184,0.987,0.133,0.979 C0.081,0.966,0.05,0.928,0.039,0.865 C0.023,0.77,0.047,0.689,0.037,0.633 C0.031,0.595,0.023,0.552,0.013,0.505 C-0.006,0.365,-0.002,0.254,0.024,0.17 C0.064,0.045,0.13,0.045,0.174,0.028 L0.175,0.028 C0.204,0.017,0.303,0.009,0.474,0.005 L0.501,0.005" />
                        </clipPath>
                    </svg>
                    <div class="animal-modal__body">
                        <div v-if="$slots.title || title" class="animal-modal__header">
                            <div class="animal-modal__title">
                                <slot name="title">{{ title }}</slot>
                            </div>
                        </div>
                        <div class="animal-modal__content">
                            <Typewriter
                                v-if="typewriter"
                                :speed="typeSpeed"
                                :trigger="playKey"
                            >
                                <slot />
                            </Typewriter>
                            <slot v-else />
                        </div>
                        <div v-if="showFooter" class="animal-modal__footer">
                            <slot name="footer">
                                <Button type="primary" @click="handleClose">取消</Button>
                                <Button type="primary" @click="handleOk">确定</Button>
                            </slot>
                        </div>
                    </div>
                </div>
            </div>
        </Cursor>
    </Teleport>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-modal {
    position: relative;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 64px);
    display: flex;
    flex-direction: column;
    animation: animal-modal-zoom-in 0.3s ease;

    &__mask {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.35);
        animation: animal-modal-fade-in 0.25s ease;
    }

    &__svg-defs {
        position: absolute;
        width: 0;
        height: 0;
    }

    &__body {
        width: 100%;
        height: 100%;
        padding: 48px 48px 32px;
        background: rgb(247, 243, 223);
        color: rgb(128, 115, 89);
        font-family: @font-family;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        clip-path: url(#animal-modal-clip);
    }

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 15px;
    }

    &__title {
        font-size: 28px;
        font-weight: 700;
        color: rgba(114, 93, 66, 1);
    }

    &__content {
        padding-bottom: 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow-y: auto;
        flex: 1;
        font-size: 20px;
        font-weight: 600;
        line-height: 1.6;
        color: #8a7b66;
    }

    &__footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
    }
}

@keyframes animal-modal-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes animal-modal-zoom-in {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
}
</style>
