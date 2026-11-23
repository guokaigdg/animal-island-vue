<script setup lang="ts">
import { computed, isVNode, useAttrs, useSlots, type VNode } from 'vue';
import { NoDataIcon, SearchIcon } from 'naive-icons-vue';
import type { NoDataSize, NoDataVariant } from './types';

interface Props {
    variant?: NoDataVariant;
    size?: NoDataSize;
    title?: string | VNode | null | false;
    description?: string | VNode | null | false;
    icon?: VNode | null | false;
    extra?: VNode | string | null | false;
    bordered?: boolean;
}

// 类型里带 false 时 Vue 会把 Boolean 当作可转换类型，缺省不传会被强制转成 false。
// 因此凡是可能显式传 false 的属性都必须写出 undefined 默认值：
// 有默认值就不会触发 boolean casting，icon 保持 undefined 走内置插画，
// title / description / extra 保持 undefined 走各自的缺省语义。
const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'medium',
    bordered: false,
    icon: undefined,
    title: undefined,
    description: undefined,
    extra: undefined,
});

defineOptions({ inheritAttrs: false });

defineSlots<{
    /** 操作区的简写；extra 属性优先于它 */
    default?: () => unknown;
    /** 自定义装饰图标；优先于 icon 属性 */
    icon?: () => unknown;
}>();

const attrs = useAttrs();
const slots = useSlots();

// ---------------------------------------------------------------
// 标题：undefined 走默认文案，null / false 才是「主动隐藏」
// ---------------------------------------------------------------
const heading = computed(() => {
    if (props.title === undefined) {
        return props.variant === 'search' ? '没有找到相关结果' : '暂无数据';
    }
    return props.title;
});

const titleVisible = computed(() => heading.value !== null && heading.value !== false);

const descriptionVisible = computed(
    () => props.description !== null && props.description !== undefined && props.description !== false
);

// ---------------------------------------------------------------
// 装饰图标：缺省用内置插画（搜索场景换放大镜），null / false 隐藏
// #icon 插槽与 icon 属性都能给自定义图标，插槽优先
// ---------------------------------------------------------------
const artworkIcon = computed(() => (props.variant === 'search' ? SearchIcon : NoDataIcon));

const hasCustomIcon = computed(
    () => !!slots.icon || (props.icon !== undefined && props.icon !== null && props.icon !== false)
);

const artworkVisible = computed(() => props.icon !== null && props.icon !== false);

// ---------------------------------------------------------------
// 操作区：extra 优先于默认插槽（与 React 的 extra > children 一致）
// ---------------------------------------------------------------
const actionsVisible = computed(() => {
    if (props.extra !== undefined) return props.extra !== null && props.extra !== false;
    return !!slots.default;
});

const rootClass = computed(() => [
    `animal-no-data--${props.size}`,
    `animal-no-data--${props.variant}`,
    props.bordered ? 'animal-no-data--bordered' : '',
]);
</script>

<template>
    <div class="animal-no-data" :class="rootClass" v-bind="attrs">
        <div
            v-if="artworkVisible"
            :class="['animal-no-data__artwork', hasCustomIcon ? 'animal-no-data__artwork--custom' : '']"
            aria-hidden="true"
        >
            <span v-if="hasCustomIcon" class="animal-no-data__symbol">
                <slot name="icon">
                    <component :is="props.icon" v-if="isVNode(props.icon)" />
                </slot>
            </span>
            <component :is="artworkIcon" v-else class="animal-no-data__scene-icon" />
        </div>

        <div v-if="titleVisible" class="animal-no-data__title">
            <component :is="heading" v-if="isVNode(heading)" />
            <span v-else>{{ heading }}</span>
        </div>

        <div v-if="descriptionVisible" class="animal-no-data__description">
            <component :is="props.description" v-if="isVNode(props.description)" />
            <span v-else>{{ props.description }}</span>
        </div>

        <div v-if="actionsVisible" class="animal-no-data__actions">
            <slot v-if="props.extra === undefined" />
            <component :is="props.extra" v-else-if="isVNode(props.extra)" />
            <span v-else>{{ props.extra }}</span>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-no-data {
    --no-data-art-width: 96px;
    --no-data-icon-size: 52px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 32px 24px;
    text-align: center;
    color: @text-color;
    font-family: @font-family;
    overflow-wrap: anywhere;

    // ---------- 装饰插画 ----------
    &__artwork {
        display: grid;
        place-items: center;
        width: var(--no-data-art-width);
        max-width: 100%;
        aspect-ratio: 1;
        margin-bottom: 22px;
        flex-shrink: 0;

        &--custom {
            width: var(--no-data-icon-size);
        }
    }

    &__scene-icon {
        width: 100%;
        height: 100%;
    }

    &__symbol {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: var(--no-data-icon-size);

        :deep(svg),
        :deep(img) {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }

    // ---------- 文案 ----------
    &__title {
        max-width: 100%;
        font-size: @font-size-lg;
        line-height: 1.5;
        font-weight: 700;
        text-wrap: balance;
    }

    &__description {
        max-width: 32ch;
        margin-top: 8px;
        font-size: 13px;
        line-height: 1.8;
        color: @text-color-secondary;
        text-wrap: balance;
    }

    // ---------- 操作区 ----------
    &__actions {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        max-width: 100%;
        margin-top: 22px;
    }

    // ---------- 变体 ----------
    &--simple {
        .animal-no-data__artwork {
            width: var(--no-data-icon-size);
            margin-bottom: 16px;
        }
    }

    &--bordered {
        border: 1.5px dashed @border-color-light;
        border-radius: 20px;
        background: @bg-color;
    }

    // ---------- 尺寸 ----------
    &--small {
        --no-data-art-width: 64px;
        --no-data-icon-size: 32px;
        padding: 18px 12px;

        .animal-no-data__artwork {
            margin-bottom: 14px;
        }
        .animal-no-data__title {
            font-size: 14px;
        }
        .animal-no-data__description {
            margin-top: 5px;
            font-size: 12px;
        }
        .animal-no-data__actions {
            margin-top: 14px;
        }
    }

    &--large {
        --no-data-art-width: 120px;
        --no-data-icon-size: 64px;
        padding: 40px 24px;

        .animal-no-data__artwork {
            margin-bottom: 26px;
        }
        .animal-no-data__title {
            font-size: 18px;
        }
        .animal-no-data__description {
            font-size: 14px;
        }
    }
}
</style>
