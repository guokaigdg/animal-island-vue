<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useAttrs } from 'vue';
import type { CSSProperties } from 'vue';

// 注意：props 类型必须内联声明（不可从 './types' 导入），
// 否则 dev server（root=demo）下跨文件类型无法解析，运行时 props 声明会丢失字段
interface Props {
    code: string;
    copyable?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
    copyable: true,
});

const emit = defineEmits<{
    (e: 'copy', code: string): void;
}>();

const attrs = useAttrs();

const COLORS = {
    comment: '#6b5e50',
    string: '#a8d4a0',
    keyword: '#d4a0e0',
    react: '#e06c75',
    component: '#80c0e0',
    func: '#61afef',
    prop: '#e8c87a',
    jsx: '#f0a870',
    operator: '#d4b896',
    number: '#a8d4a0',
    default: '#e8d5bc',
};

interface Token {
    start: number;
    end: number;
    color: string;
}

function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    const add = (regex: RegExp, color: string) => {
        const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
        let m: RegExpExecArray | null;
        while ((m = re.exec(code)) !== null) {
            tokens.push({ start: m.index, end: m.index + m[0].length, color });
        }
    };

    add(/\/\*[\s\S]*?\*\//g, COLORS.comment);
    add(/\/\/.*$/gm, COLORS.comment);
    add(/`[^`]*`/g, COLORS.string);
    add(/"[^"]*"/g, COLORS.string);
    add(/'[^']*'/g, COLORS.string);
    add(/<\/?[A-Z][\w.$]*/g, COLORS.jsx);
    add(/<\/?[a-z][\w-]*/g, COLORS.jsx);
    add(/\/?>/g, COLORS.jsx);
    add(
        /\b(React|useState|useEffect|useCallback|useMemo|useRef|useContext|useReducer|useLayoutEffect|useImperativeHandle|useDebugValue|createContext|createElement|cloneElement|Fragment|Suspense|lazy|memo|forwardRef|useId|FC|ReactNode|ReactElement|CSSProperties|ref|reactive|computed|watch|defineComponent|defineProps|defineEmits|onMounted|onBeforeUnmount)\b/g,
        COLORS.react
    );
    add(/\b(true|false)\b/g, COLORS.keyword);
    add(/\b(null|undefined|void|NaN|Infinity)\b/gi, COLORS.keyword);
    add(/\b\d+\.?\d*\b/g, COLORS.number);
    add(
        /\b(import|from|as|export|default|const|let|var|function|return|if|else|for|while|switch|case|break|continue|try|catch|throw|finally|new|typeof|instanceof|async|await|type|interface)\b/g,
        COLORS.keyword
    );
    add(/\b[A-Z][a-zA-Z0-9_$]*\b/g, COLORS.component);
    add(/\b[a-z][a-zA-Z0-9_$]*\s*(?=\()/g, COLORS.func);
    add(/\b[a-zA-Z_$][\w$]*\s*(?==)/g, COLORS.prop);
    add(/>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~?:]/g, COLORS.operator);
    add(/[{}[\]();,]/g, COLORS.operator);

    tokens.sort((a, b) => a.start - b.start);
    return tokens;
}

interface Segment {
    text: string;
    color: string;
}

const segments = computed<Segment[]>(() => {
    const code = props.code;
    const tokens = tokenize(code);
    const out: Segment[] = [];
    let pos = 0;
    for (const t of tokens) {
        if (t.start < pos) continue;
        if (t.start > pos) out.push({ text: code.slice(pos, t.start), color: COLORS.default });
        out.push({ text: code.slice(t.start, t.end), color: t.color });
        pos = t.end;
    }
    if (pos < code.length) out.push({ text: code.slice(pos), color: COLORS.default });
    return out;
});

// ============================================
// 复制按钮（与 React 版行为一致）
// ============================================
type CopyStatus = 'idle' | 'copied' | 'error';

const COPY_STATUS_CONTENT: Record<CopyStatus, { text: string; label: string }> = {
    idle: { text: '复制', label: '复制代码' },
    copied: { text: '已复制', label: '代码已复制' },
    error: { text: '复制失败', label: '代码复制失败' },
};

const copyStatus = ref<CopyStatus>('idle');
let resetTimer: number | undefined;

onBeforeUnmount(() => window.clearTimeout(resetTimer));

async function copyText(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    // 兼容降级：临时 textarea + execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    try {
        textarea.select();
        const copied = document.execCommand('copy');
        if (!copied) throw new Error('Copy command failed');
    } finally {
        textarea.remove();
    }
}

async function handleCopy(): Promise<void> {
    window.clearTimeout(resetTimer);
    try {
        await copyText(props.code);
        copyStatus.value = 'copied';
        emit('copy', props.code);
    } catch {
        copyStatus.value = 'error';
    }
    resetTimer = window.setTimeout(() => {
        copyStatus.value = 'idle';
    }, 2_000);
}

const buttonContent = computed(() => COPY_STATUS_CONTENT[copyStatus.value]);

// 模板通过 setup 绑定判断（避免模板直接引用 props 字段标识符）
const showCopyButton = computed(() => props.copyable !== false);

// ============================================
// style 拆分（与 React 版一致）：
// 尺寸 / 外边距属性作用到外层 wrapper，其余作用到 pre；
// 有复制按钮且未自定义 padding 时，pre 自动加 paddingRight 给按钮留位
// ============================================
const WRAPPER_STYLE_KEYS = [
    'width',
    'minWidth',
    'maxWidth',
    'margin',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
] as const;

interface StyleSplit {
    wrapper?: CSSProperties;
    pre?: CSSProperties | string;
}

const styleSplit = computed<StyleSplit>(() => {
    const style = attrs.style;
    if (style === null || style === undefined) return {};
    if (typeof style !== 'object' || Array.isArray(style)) return { pre: style as string };
    const source = style as Record<string, string>;
    const wrapper: Record<string, string> = {};
    const pre: Record<string, string> = {};
    for (const key of Object.keys(source)) {
        if ((WRAPPER_STYLE_KEYS as readonly string[]).includes(key)) wrapper[key] = source[key];
        else pre[key] = source[key];
    }
    return { wrapper, pre };
});

const preStyle = computed<CSSProperties | string | undefined>(() => {
    const base = styleSplit.value.pre;
    if (typeof base === 'string') return base;
    const needsSpacing = props.copyable && base?.padding === undefined && base?.paddingRight === undefined;
    if (!needsSpacing) return base;
    return { ...(base ?? {}), paddingRight: '96px' };
});

// class / style 之外的 attrs（id、data-* 等）透传到 pre
const restAttrs = computed(() => {
    const { class: _class, style: _style, ...rest } = attrs;
    return rest;
});
</script>

<template>
    <div class="animal-code-block" :style="styleSplit.wrapper">
        <pre class="animal-code-block__code" :class="attrs.class" :style="preStyle" v-bind="restAttrs"><span
        v-for="(seg, i) in segments"
        :key="i"
        :style="{ color: seg.color }"
      >{{ seg.text }}</span></pre>
        <button
            v-if="showCopyButton"
            type="button"
            class="animal-code-block__copy-btn"
            :aria-label="buttonContent.label"
            @click="handleCopy"
        >
            {{ buttonContent.text }}
        </button>
    </div>
</template>

<style lang="less" scoped>
.animal-code-block {
    position: relative;
    min-width: 0;
    margin: 1em 0;
}

.animal-code-block__code {
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 20px 24px;
    background: #2b2118;
    border: 1px solid #3d3028;
    border-radius: 20px;
    font-size: 14px;
    line-height: 1.7;
    font-weight: 600;
    color: #e8d5bc;
    overflow: auto;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
    white-space: pre;
    tab-size: 4;
}

.animal-code-block__copy-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    min-width: 62px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid rgba(232, 213, 188, 0.3);
    border-radius: 50px;
    background: rgba(61, 48, 40, 0.94);
    color: #e8d5bc;
    font-family: var(--animal-font-family, 'Nunito', 'Noto Sans SC');
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--animal-motion-duration-base, 0.2s) var(--animal-motion-ease, cubic-bezier(0.4, 0, 0.2, 1));
}

.animal-code-block__copy-btn:hover {
    background: #4b3b31;
    transform: translateY(-1px);
}

.animal-code-block__copy-btn:active {
    transform: translateY(0);
}

.animal-code-block__copy-btn:focus-visible {
    outline: 2px solid var(--animal-primary-color, #19c8b9);
    outline-offset: 2px;
}
</style>
