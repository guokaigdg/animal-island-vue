<script lang="ts">
import {
    defineComponent,
    h,
    provide,
    useAttrs,
    useSlots,
    type CSSProperties,
    type PropType,
    type VNode,
} from 'vue';
import type { AvatarShape, AvatarSize } from './types';
import { avatarGroupKey } from './types';

/**
 * Avatar.Group —— 头像组：叠加展示 + 超出折叠为 "+N"。
 * 通过 provide 把组级 size / shape 下发给子 Avatar（子级显式指定则优先），
 * 折叠与注入逻辑与 React 版一致，故使用渲染函数实现。
 */
export default defineComponent({
    name: 'AvatarGroup',
    props: {
        maxCount: { type: Number, default: undefined },
        maxStyle: { type: Object as PropType<CSSProperties>, default: undefined },
        size: { type: [Number, String] as PropType<number | AvatarSize>, default: undefined },
        shape: { type: String as PropType<AvatarShape>, default: undefined },
        gap: { type: Number, default: 8 },
    },
    setup(props) {
        const attrs = useAttrs();
        const slots = useSlots() as { default?: (...args: never[]) => VNode[] };

        provide(avatarGroupKey, { size: props.size, shape: props.shape });

        return () => {
            const kids = slots.default ? (slots.default() ?? []) : [];

            let shown = kids;
            let restCount = 0;
            if (props.maxCount && props.maxCount > 0 && kids.length > props.maxCount) {
                shown = kids.slice(0, props.maxCount);
                restCount = kids.length - props.maxCount;
            }

            const cls = ['animal-avatar-group', attrs.class].filter(Boolean) as string[];
            const groupStyle: Record<string, string> = {
                '--avatar-group-gap': `${props.gap}px`,
            };

            const children: VNode[] = [...shown];
            if (restCount > 0) {
                children.push(
                    h(
                        'span',
                        {
                            class: 'animal-avatar-group__more',
                            style: props.maxStyle,
                        },
                        `+${restCount}`
                    )
                );
            }

            return h(
                'div',
                {
                    ...attrs,
                    class: cls,
                    style: { ...groupStyle, ...((attrs.style as object) ?? {}) },
                },
                children
            );
        };
    },
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-avatar-group {
    display: inline-flex;
    align-items: center;
}

// 叠加展示：头像之间奶油色缝隙 + 负 margin 重叠（子头像根元素从父级穿透样式）
.animal-avatar-group :deep(.animal-avatar) {
    border: 2px solid @bg-color;
}

.animal-avatar-group :deep(.animal-avatar + .animal-avatar) {
    margin-left: calc(-1 * var(--avatar-group-gap));
}

// 折叠 "+N" 头像：直接复用头像的外观，字号略小
.animal-avatar-group__more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 999px;
    background: @primary-color-bg;
    color: @primary-color;
    font-weight: 600;
    border: 2px solid @bg-color;
    font-size: 14px;
}
</style>