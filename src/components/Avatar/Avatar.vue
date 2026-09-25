<script lang="ts">
import {
    computed,
    defineComponent,
    h,
    inject,
    onMounted,
    onUpdated,
    ref,
    useAttrs,
    useSlots,
    watch,
    type PropType,
    type VNode,
} from 'vue';
import { UserIcon } from '../Icon';
import type { AvatarShape, AvatarSize } from './types';
import { avatarGroupKey } from './types';

// 各预设尺寸对应的尺寸值与文字字号（px），自定义数字尺寸按 0.4 倍换算
const PRESET_SIZE: Record<AvatarSize, number> = {
    small: 32,
    middle: 40,
    large: 48,
};
const PRESET_FONT: Record<AvatarSize, number> = {
    small: 14,
    middle: 16,
    large: 20,
};

/**
 * 由于需要动态判断默认 slot 是"图标组件"还是"文字"，并做超宽缩放测量，
 * 组件使用渲染函数而非模板，逻辑与 React 版保持一致。
 */
export default defineComponent({
    name: 'Avatar',
    props: {
        shape: { type: String as PropType<AvatarShape>, default: undefined },
        size: { type: [Number, String] as PropType<number | AvatarSize>, default: undefined },
        src: { type: String, default: undefined },
        alt: { type: String, default: undefined },
        icon: { type: Object as PropType<VNode>, default: undefined },
        gap: { type: Number, default: 4 },
        onError: { type: Function as PropType<() => boolean>, default: undefined },
    },
    setup(props) {
        const attrs = useAttrs();
        const slots = useSlots() as { default?: (...args: never[]) => VNode[] };

        const group = inject(avatarGroupKey, null);

        // 组级（group）只在子级未显式指定时生效
        const effSize = computed<number | AvatarSize>(() => props.size ?? group?.size ?? 'middle');
        const effShape = computed<AvatarShape>(() => props.shape ?? group?.shape ?? 'circle');

        const px = computed<number>(() =>
            typeof effSize.value === 'number' ? effSize.value : PRESET_SIZE[effSize.value]
        );
        const fontPx = computed<number>(() =>
            typeof effSize.value === 'number'
                ? Math.max(12, Math.round(px.value * 0.4))
                : PRESET_FONT[effSize.value]
        );

        // isImgLoaded：图片是否加载成功；false → 显示占位（icon 或文字）
        const isImgLoaded = ref(!!props.src);
        // scale：文字/图标缩放比，超宽时由 gap 计算
        const scale = ref(1);
        const textRef = ref<HTMLElement | null>(null);

        // src 变化时重置图片加载状态
        watch(
            () => props.src,
            (s) => {
                isImgLoaded.value = !!s;
            }
        );

        function handleImgError() {
            const canRetry = props.onError?.();
            if (canRetry !== false) {
                isImgLoaded.value = false;
            }
        }

        // 文字超宽时按 available = px - gap*2 等比缩小字号（等价 useLayoutEffect[children/icon/gap/px]）
        function measure() {
            const el = textRef.value;
            if (!el) return;
            const textWidth = el.offsetWidth;
            const available = px.value - props.gap * 2;
            scale.value = textWidth > available && available > 0 ? available / textWidth : 1;
        }
        onMounted(measure);
        onUpdated(measure);
        watch(
            [px, () => props.gap, () => props.icon],
            measure,
            { flush: 'post' }
        );

        // 判断默认 slot：组件（object/function type）→ 图标头像；字符串/数字 → 文字头像
        function inspectSlots() {
            const nodes: VNode[] = slots.default ? (slots.default() ?? []) : [];
            const first = nodes[0];
            const t = (first?.type as unknown) ?? null;
            // Text / Comment / Fragment 等内建占位符号的 typeof 为 'symbol'，天然被排除
            const isIconChild = !!first && (typeof t === 'object' || typeof t === 'function');
            const hasTextContent = nodes.length > 0 && !isIconChild;
            return { hasTextContent, isIconChild, first, nodes };
        }

        return () => {
            const { hasTextContent, isIconChild, first, nodes } = inspectSlots();
            const hasImage = !!props.src && isImgLoaded.value;

            const cls = [
                'animal-avatar',
                effShape.value === 'square' && 'animal-avatar--shape-square',
                !hasImage && 'animal-avatar--placeholder',
                attrs.class,
            ].filter(Boolean) as string[];

            const sizeStyle: Record<string, string> = {
                width: `${px.value}px`,
                height: `${px.value}px`,
                lineHeight: `${px.value}px`,
                fontSize: scale.value > 1 ? '' : `${fontPx.value}px`,
            };

            // 有图：img 铺满；无图：图标头像（icon → 图标 children → 默认用户图标）或文字头像（测量缩放）
            let inner: VNode;
            if (hasImage) {
                inner = h('img', {
                    class: 'animal-avatar__img',
                    src: props.src,
                    alt: props.alt ?? '',
                    onError: handleImgError,
                });
            } else if (props.icon || isIconChild || !hasTextContent) {
                let iconNode: VNode;
                if (props.icon) {
                    iconNode = props.icon;
                } else if (isIconChild && first) {
                    iconNode = first;
                } else {
                    iconNode = h(UserIcon, { size: Math.round(px.value * 0.5), 'aria-hidden': 'true' }) as VNode;
                }
                inner = h('span', { class: 'animal-avatar__string' }, [iconNode]);
            } else {
                const strStyle =
                    scale.value > 1 ? { fontSize: `${fontPx.value * scale.value}px` } : undefined;
                inner = h(
                    'span',
                    {
                        class: 'animal-avatar__string',
                        ...(strStyle ? { style: strStyle } : {}),
                    },
                    [nodes]
                );
            }

            return h(
                'span',
                {
                    ...attrs,
                    class: cls,
                    style: { ...sizeStyle, ...((attrs.style as object) ?? {}) },
                    role: !hasImage && !hasTextContent ? 'img' : undefined,
                    'aria-label': !hasImage && !hasTextContent ? 'avatar' : undefined,
                },
                [inner]
            );
        };
    },
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-avatar {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    vertical-align: middle;
    user-select: none;
    background: @primary-color-bg;
    color: @primary-color;
    font-weight: 600;
    border-radius: 999px; // 圆形
}

.animal-avatar--shape-square {
    border-radius: 8px; // 方形：8px 小圆角，与 Image 相框一致
}

.animal-avatar__img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.animal-avatar__string {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    white-space: nowrap;
}

// 占位（图标/文字）形态：奶油色描边增加贴纸感
.animal-avatar--placeholder {
    border: 2px solid @bg-color;
}
</style>