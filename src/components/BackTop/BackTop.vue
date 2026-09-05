<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import backtopIcon from '../../assets/img/icons/backtop.svg';

interface Props {
    target?: () => HTMLElement | Window;
    visibilityHeight?: number;
    onClick?: (e: MouseEvent) => void;
    className?: string;
    style?: Record<string, string | number>;
    duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
    visibilityHeight: 400,
    duration: 300,
});

const emit = defineEmits<{
    (e: 'click', payload: MouseEvent): void;
}>();

const visible = ref(false);

const classObj = computed(() => ({
    'animal-backtop--visible': visible.value,
    [String(props.className)]: !!props.className,
}));

const getTarget = (): HTMLElement | Window => {
    return props.target ? props.target() : window;
};

const handleScroll = (): void => {
    const el = getTarget();
    const scrollTop = el === window ? window.scrollY : (el as HTMLElement).scrollTop;
    visible.value = scrollTop > props.visibilityHeight;
};

onMounted(() => {
    const el = getTarget();
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
});

onUnmounted(() => {
    const el = getTarget();
    el.removeEventListener('scroll', handleScroll);
});

const scrollToTop = (e: MouseEvent): void => {
    const el = getTarget();
    const start = el === window ? window.scrollY : (el as HTMLElement).scrollTop;
    const startTime = performance.now();

    const animate = (now: number): void => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / props.duration, 1);
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
        const current = start * (1 - eased);

        if (el === window) {
            window.scrollTo(0, current);
        } else {
            (el as HTMLElement).scrollTop = current;
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
    emit('click', e);
};

const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop(e as unknown as MouseEvent);
    }
};
</script>

<template>
    <div
        class="animal-backtop"
        :class="classObj"
        :style="style"
        role="button"
        tabindex="0"
        aria-label="返回顶部"
        @click="scrollToTop"
        @keydown="handleKeyDown"
    >
        <img class="animal-backtop__img" :src="backtopIcon" alt="返回顶部" />
    </div>
</template>

<style lang="less" scoped>
.animal-backtop {
    position: fixed;
    bottom: 48px;
    right: 32px;
    z-index: 1000;
    cursor: pointer;
    transition:
        opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    visibility: hidden;
    transform: translateY(12px);
    user-select: none;
    border: none;
    outline: none;
    background: none;
    padding: 0;
    line-height: 1;

    &:hover {
        transform: translateY(0) scale(1.08);
    }

    &:active {
        transform: translateY(2px) scale(0.96);
    }

    &:focus-visible {
        outline: 2px solid #ffcc00;
        outline-offset: 4px;
        border-radius: 50%;
    }
}

.animal-backtop--visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.animal-backtop__img {
    width: 64px;
    height: 64px;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 4px 10px rgba(91, 78, 30, 0.22));
    transition: filter 0.25s ease;

    .animal-backtop:hover & {
        filter: drop-shadow(0 4px 14px rgba(91, 78, 30, 0.32));
    }
}

@media (max-width: 768px) {
    .animal-backtop {
        bottom: 24px;
        right: 16px;
    }

    .animal-backtop__img {
        width: 44px;
        height: 44px;
    }
}
</style>
