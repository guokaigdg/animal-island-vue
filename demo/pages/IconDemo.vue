<script setup lang="ts">
import { computed, ref, type Component, type CSSProperties } from 'vue';
import { Input, Tag } from '@';
import * as Icons from 'naive-icons-vue';
import { NAIVE_PALETTE, type PaletteColor } from 'naive-icons-vue';
import {
    FlowerIcon,
    MicIcon,
    StarIcon,
    SunIcon,
    UmbrellaIcon,
    WifiIcon,
    MapIcon,
    CameraIcon,
    HeartIcon,
    CoffeeIcon,
    CherryIcon,
    BulbIcon,
    CatIcon,
    FishIcon,
    RocketIcon,
    CloudIcon,
    RainbowIcon,
    IcecreamIcon,
    MushroomIcon,
    OwlIcon,
    SailboatIcon,
    MountainIcon,
    BellIcon,
    AnchorIcon,
} from 'naive-icons-vue';
import {
    sectionStyle,
    sectionTitleStyle,
    tagStyle,
    labelStyle,
    ApiTable,
    CodeBlock,
    ICON_ZH_NAMES,
    ICON_CATEGORY_GROUPS,
} from '../tools';
import type { ApiRow } from '../tools';

/**
 * 图标是独立 npm 包 naive-icons-vue 的内容，本包不再包一层通用 <Icon> 组件。
 * 演示页按「名字 → 组件」解析，和 React 版 demo 的 resolveIcon 同一套做法。
 */
function resolveIcon(name: string): Component | null {
    const Cmp = (Icons as Record<string, unknown>)[`${name}Icon`];
    return Cmp !== null && Cmp !== undefined ? (Cmp as Component) : null;
}

/** 图标组件自身的 props，与 React 版 API 表一一对应 */
const ICON_API: ApiRow[] = [
    { prop: 'size', desc: '图标尺寸，宽高相等', type: 'number | string', defaultVal: '24' },
    { prop: 'color', desc: '描边颜色', type: 'string', defaultVal: 'currentColor' },
    { prop: 'strokeWidth', desc: '描边粗细', type: 'number | string', defaultVal: '3.5' },
    { prop: 'fill', desc: '填充色', type: 'string', defaultVal: 'none' },
    { prop: 'title', desc: '无障碍标题', type: 'string', defaultVal: '-' },
];

const PALETTE_KEYS = Object.keys(NAIVE_PALETTE) as PaletteColor[];

const PALETTE_API: ApiRow[] = PALETTE_KEYS.map((key) => ({
    prop: key,
    desc: '调色板颜色',
    type: 'string',
    defaultVal: NAIVE_PALETTE[key],
}));

const INSTALL_CODE = `npm install naive-icons-vue
yarn add naive-icons-vue
pnpm add naive-icons-vue`;

const USAGE_CODE = `<script setup lang="ts">
import { CatIcon, FishIcon } from 'naive-icons-vue';
<\/script>

<template>
    <CatIcon :size="32" />
    <FishIcon :size="32" color="#2A9D8F" />
</template>`;

const ALL_ICONS = computed(() =>
    ICON_CATEGORY_GROUPS.flatMap((g) => g.icons.map((name) => ({ name, cmp: resolveIcon(name) })))
);

const filter = ref('');

const shownIcons = computed(() => {
    const q = filter.value.trim().toLowerCase();
    if (!q) return ALL_ICONS.value;
    return ALL_ICONS.value.filter((i) => i.name.toLowerCase().includes(q));
});

/** 分类分组，受上方搜索框约束 */
const shownGroups = computed(() => {
    const q = filter.value.trim().toLowerCase();
    if (!q) return ICON_CATEGORY_GROUPS;
    return ICON_CATEGORY_GROUPS.map((g) => ({
        ...g,
        icons: g.icons.filter((n) => n.toLowerCase().includes(q)),
    })).filter((g) => g.icons.length > 0);
});

/** 单独导入的图标组件示例 */
const DIRECT_ICONS = [
    { name: 'CatIcon', cmp: CatIcon },
    { name: 'FishIcon', cmp: FishIcon },
    { name: 'CoffeeIcon', cmp: CoffeeIcon },
    { name: 'RocketIcon', cmp: RocketIcon },
    { name: 'HeartIcon', cmp: HeartIcon },
    { name: 'StarIcon', cmp: StarIcon },
    { name: 'CloudIcon', cmp: CloudIcon },
    { name: 'RainbowIcon', cmp: RainbowIcon },
    { name: 'IcecreamIcon', cmp: IcecreamIcon },
    { name: 'MushroomIcon', cmp: MushroomIcon },
    { name: 'OwlIcon', cmp: OwlIcon },
    { name: 'SailboatIcon', cmp: SailboatIcon },
] as const;

const PALETTE_KEY_LIST = PALETTE_KEYS;

/** 描边缩放演示：默认 3.5 为设计基准，其余按比例放大 */
const STROKE_SAMPLES = [1, 3.5, 7];

const rowStyle: CSSProperties = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
};

const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '14px',
};

const cellStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 6px',
    borderRadius: '10px',
    background: '#fff',
    border: '1px solid transparent',
};

const cellLabelStyle: CSSProperties = {
    fontSize: '11px',
    color: '#a0936e',
    fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
    wordBreak: 'break-all',
    textAlign: 'center',
};

const cellZhStyle: CSSProperties = {
    fontSize: '13px',
    color: '#725d42',
    fontWeight: 600,
};

const compactGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
    gap: '10px',
    marginTop: '12px',
};

const compactCellStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 6px',
    background: '#faf8f3',
    border: '1px solid #e8e2d6',
    borderRadius: '12px',
};
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Icon
            <Tag size="small" variant="soft">naive-icons-vue</Tag>
            <span :style="tagStyle">{{ ALL_ICONS.length }} 个内置图标</span>
        </div>

        <div :style="labelStyle">
            图标为独立 npm 包
            <a
                href="https://github.com/guokaigdg/naive-icons"
                target="_blank"
                rel="noreferrer"
                :style="{ color: '#725d42' }"
            >
                naive-icons-vue
            </a>
            —— 手绘 naive folk art 风格的 SVG 图标库，731 个原创图标，为 Vue 3 与 TypeScript 打造。请先安装依赖：
        </div>

        <div :style="{ marginBottom: '12px' }">
            <CodeBlock :code="INSTALL_CODE" label="安装" />
        </div>

        <div :style="labelStyle">
            文档与完整示例参考
            <a
                href="https://github.com/guokaigdg/naive-icons"
                target="_blank"
                rel="noreferrer"
                :style="{ color: '#725d42' }"
            >
                https://github.com/guokaigdg/naive-icons
            </a>
        </div>

        <div :style="labelStyle">基础用法 — 每枚图标是独立组件，按名字具名导入</div>
        <div :style="rowStyle">
            <FlowerIcon :size="32" />
            <MicIcon :size="32" />
            <StarIcon :size="32" />
            <SunIcon :size="32" />
            <UmbrellaIcon :size="32" />
            <WifiIcon :size="32" />
            <MapIcon :size="32" />
            <CameraIcon :size="32" />
        </div>

        <div :style="labelStyle">size 尺寸</div>
        <div :style="rowStyle">
            <HeartIcon :size="16" />
            <HeartIcon :size="24" />
            <HeartIcon :size="32" />
            <HeartIcon :size="48" />
        </div>

        <div :style="labelStyle">color / strokeWidth 自定义</div>
        <div :style="rowStyle">
            <CoffeeIcon :size="32" color="#e05260" :stroke-width="3" />
            <CherryIcon :size="32" color="#2a9d8f" :stroke-width="3" />
            <BulbIcon :size="32" color="#e9c46a" :stroke-width="3" />
        </div>

        <div :style="labelStyle">全部图标</div>
        <div :style="{ maxWidth: '280px', marginBottom: '8px' }">
            <Input v-model="filter" allow-clear placeholder="输入关键字筛选图标名" />
        </div>
        <div :style="{ fontSize: '13px', color: '#a0936e', marginBottom: '4px' }">
            当前显示 {{ shownIcons.length }} / {{ ALL_ICONS.length }}
        </div>
        <div
            :style="{
                border: '1px solid #e8e2d6',
                borderRadius: '12px',
                overflow: 'hidden',
                padding: '18px 16px',
                marginBottom: '20px',
                ...gridStyle,
            }"
        >
            <div v-for="item in shownIcons" :key="item.name" :style="cellStyle">
                <component :is="item.cmp" :size="45" />
                <span :style="cellLabelStyle">{{ item.name }}Icon</span>
                <span :style="cellZhStyle">{{ ICON_ZH_NAMES[item.name] ?? item.name }}</span>
            </div>
        </div>

        <div :style="labelStyle">使用示例</div>
        <CodeBlock :code="USAGE_CODE" />

        <ApiTable :rows="ICON_API" />

        <div :style="labelStyle">直接导入图标组件 — 可单独 import，props 同样透传</div>
        <div :style="compactGridStyle">
            <div v-for="item in DIRECT_ICONS" :key="item.name" :style="compactCellStyle">
                <component :is="item.cmp" :size="28" />
                <span :style="cellLabelStyle">{{ item.name }}</span>
            </div>
        </div>

        <div :style="labelStyle">调色板 — color 可传任意色，也可用内置调色板 key</div>
        <div :style="rowStyle">
            <div v-for="key in PALETTE_KEY_LIST" :key="key" :style="{ ...compactCellStyle, minWidth: '72px' }">
                <FlowerIcon :size="24" :color="NAIVE_PALETTE[key]" />
                <span :style="cellLabelStyle">{{ key }}</span>
            </div>
        </div>

        <div :style="labelStyle">描边宽度 — strokeWidth 等比缩放内层所有描边，粗细层次保持不变</div>
        <div :style="rowStyle">
            <div
                v-for="sw in STROKE_SAMPLES"
                :key="sw"
                :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }"
            >
                <MountainIcon :size="40" :stroke-width="sw" />
                <span :style="cellLabelStyle">{{ sw }}</span>
            </div>
        </div>

        <div :style="labelStyle">填充色 — fill 只作用于根 svg，内层图形的填充是设计值不受影响</div>
        <div :style="rowStyle">
            <BellIcon :size="36" fill="#2A9D8F" />
            <AnchorIcon :size="36" fill="#E76F51" />
            <SunIcon :size="36" fill="#E9C46A" />
        </div>

        <div :style="labelStyle">分类 taxonomy — 每枚图标都有归属，按分类浏览</div>
        <div :style="{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }">
            <Tag v-for="g in shownGroups" :key="g.slug">{{ g.title }} · {{ g.icons.length }}</Tag>
        </div>
        <div v-for="g in shownGroups" :key="g.slug" :style="{ marginBottom: '18px' }">
            <div :style="{ fontSize: '13px', color: '#794f27', marginBottom: '4px' }">{{ g.title }}</div>
            <div :style="compactGridStyle">
                <div v-for="name in g.icons" :key="name" :style="compactCellStyle">
                    <component :is="resolveIcon(name)" :size="24" />
                    <span :style="cellLabelStyle">{{ name }}</span>
                </div>
            </div>
        </div>

        <ApiTable :rows="PALETTE_API" />
    </div>
</template>
