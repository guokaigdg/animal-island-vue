<script setup lang="ts">
import { computed, useAttrs } from 'vue';

interface Props {
    code: string;
}

const props = defineProps<Props>();
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

interface Token { start: number; end: number; color: string; }

function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    const add = (regex: RegExp, color: string) => {
        const re = new RegExp(
            regex.source,
            regex.flags.includes('g') ? regex.flags : regex.flags + 'g',
        );
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
        COLORS.react,
    );
    add(/\b(true|false)\b/g, COLORS.keyword);
    add(/\b(null|undefined|void|NaN|Infinity)\b/gi, COLORS.keyword);
    add(/\b\d+\.?\d*\b/g, COLORS.number);
    add(
        /\b(import|from|as|export|default|const|let|var|function|return|if|else|for|while|switch|case|break|continue|try|catch|throw|finally|new|typeof|instanceof|async|await|type|interface)\b/g,
        COLORS.keyword,
    );
    add(/\b[A-Z][a-zA-Z0-9_$]*\b/g, COLORS.component);
    add(/\b[a-z][a-zA-Z0-9_$]*\s*(?=\()/g, COLORS.func);
    add(/\b[a-zA-Z_$][\w$]*\s*(?==)/g, COLORS.prop);
    add(/>|===|!==|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~?:]/g, COLORS.operator);
    add(/[{}[\]();,]/g, COLORS.operator);

    tokens.sort((a, b) => a.start - b.start);
    return tokens;
}

interface Segment { text: string; color: string; }

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
</script>

<template>
    <pre class="animal-code-block" v-bind="attrs"><span
        v-for="(seg, i) in segments"
        :key="i"
        :style="{ color: seg.color }"
    >{{ seg.text }}</span></pre>
</template>

<style lang="less" scoped>
.animal-code-block {
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
</style>
