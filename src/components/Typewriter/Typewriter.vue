<script lang="ts">
import {
    Comment,
    Fragment,
    Text,
    defineComponent,
    h,
    onBeforeUnmount,
    ref,
    watch,
    type PropType,
    type VNode,
} from 'vue';

interface State { remaining: number; stopped: boolean; }

function countText(nodes: unknown): number {
    if (nodes == null || typeof nodes === 'boolean') return 0;
    if (typeof nodes === 'string' || typeof nodes === 'number')
        return String(nodes).length;
    if (Array.isArray(nodes))
        return nodes.reduce<number>((s, n) => s + countText(n), 0);
    const v = nodes as VNode;
    if (v && typeof v === 'object' && 'type' in v) {
        if (v.type === Comment) return 0;
        if (v.type === Text) return String(v.children ?? '').length;
        return countText(v.children);
    }
    return 0;
}

function cloneWithChildren(v: VNode, children: unknown): VNode {
    return h(v.type as never, v.props ?? undefined, children as never);
}

function clip(nodes: unknown, state: State): unknown {
    if (state.stopped) return null;
    if (nodes == null || typeof nodes === 'boolean') return null;
    if (typeof nodes === 'string' || typeof nodes === 'number') {
        const text = String(nodes);
        if (state.remaining >= text.length) {
            state.remaining -= text.length;
            return text;
        }
        const shown = text.slice(0, state.remaining);
        state.remaining = 0;
        state.stopped = true;
        return shown;
    }
    if (Array.isArray(nodes)) {
        return nodes.map((c) => clip(c, state));
    }
    const v = nodes as VNode;
    if (v && typeof v === 'object' && 'type' in v) {
        if (v.type === Comment) return v;
        if (v.type === Text) {
            const text = String(v.children ?? '');
            if (state.remaining >= text.length) {
                state.remaining -= text.length;
                return v;
            }
            const shown = text.slice(0, state.remaining);
            state.remaining = 0;
            state.stopped = true;
            return cloneWithChildren(v, shown);
        }
        if (v.type === Fragment) {
            return cloneWithChildren(v, clip(v.children, state));
        }
        if (v.children == null || typeof v.children === 'string') {
            const text = String(v.children ?? '');
            if (text.length === 0) return v;
            if (state.remaining >= text.length) {
                state.remaining -= text.length;
                return v;
            }
            const shown = text.slice(0, state.remaining);
            state.remaining = 0;
            state.stopped = true;
            return cloneWithChildren(v, shown);
        }
        return cloneWithChildren(v, clip(v.children, state));
    }
    return null;
}

export interface TypewriterProps {
    speed?: number;
    trigger?: unknown;
    autoPlay?: boolean;
    text?: string;
}

export default defineComponent({
    name: 'Typewriter',
    props: {
        speed: { type: Number, default: 90 },
        trigger: { type: [Number, String, Boolean, Object, Array] as PropType<unknown>, required: false },
        autoPlay: { type: Boolean, default: true },
        text: { type: String, default: undefined },
    },
    emits: ['done'],
    setup(props, { slots, emit }) {
        const getNodes = (): VNode[] => {
            if (props.text != null) return [h(Text, props.text) as unknown as VNode];
            return slots.default ? slots.default() : [];
        };

        const total = ref(0);
        const count = ref(0);
        let timer: ReturnType<typeof setInterval> | null = null;

        const stop = () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        };

        const start = () => {
            stop();
            total.value = countText(getNodes());
            if (!props.autoPlay) {
                count.value = total.value;
                return;
            }
            count.value = 0;
            if (total.value === 0) return;
            timer = setInterval(() => {
                if (count.value >= total.value) {
                    stop();
                    emit('done');
                    return;
                }
                count.value += 1;
                if (count.value >= total.value) {
                    stop();
                    emit('done');
                }
            }, props.speed);
        };

        watch(
            () => [props.speed, props.trigger, props.autoPlay, props.text],
            () => start(),
            { immediate: true },
        );

        onBeforeUnmount(stop);

        return () => {
            // re-evaluate per render so slot content changes are picked up
            total.value = countText(getNodes());
            if (!props.autoPlay) {
                return getNodes();
            }
            const state: State = { remaining: count.value, stopped: false };
            return clip(getNodes(), state) as VNode | VNode[] | null;
        };
    },
});
</script>
