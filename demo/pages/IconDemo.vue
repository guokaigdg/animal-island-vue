<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue';
import {
    Icon,
    Input,
    Tag,
    ICON_LIST,
    ICON_CATEGORIES,
    ICONS_BY_CATEGORY,
    NAIVE_PALETTE,
    type IconName,
    type PaletteColor,
} from '@';
import {
    CatIcon,
    FishIcon,
    CoffeeIcon,
    RocketIcon,
    HeartIcon,
    StarIcon,
    CloudIcon,
    RainbowIcon,
    IcecreamIcon,
    MushroomIcon,
    OwlIcon,
    SailboatIcon,
} from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const ICON_API: ApiRow[] = [
    { prop: 'name', desc: '按名称渲染内置图标（164 个手绘 SVG）', type: 'IconName', defaultVal: '-' },
    { prop: 'icon', desc: '传入具体图标组件', type: 'IconComponent', defaultVal: '-' },
    { prop: 'src', desc: '传入图片地址渲染', type: 'string', defaultVal: '-' },
    { prop: 'size', desc: '尺寸', type: 'number | string', defaultVal: '24' },
    { prop: 'color', desc: '描边颜色', type: 'string', defaultVal: "'#2A2A2A'" },
    {
        prop: 'strokeWidth',
        desc: '描边宽度；相对基准 3.5 等比缩放，内层自带的粗细层次会一并保持',
        type: 'number | string',
        defaultVal: '3.5',
    },
    { prop: 'fill', desc: '填充色，只作用于根 svg（内层图形的填充是设计值）', type: 'string', defaultVal: "'none'" },
    { prop: 'bounce', desc: '挂载时弹跳一下', type: 'boolean', defaultVal: 'false' },
];

const PALETTE_API: ApiRow[] = Object.entries(NAIVE_PALETTE).map(([key, value]) => ({
    prop: key,
    desc: '调色板颜色',
    type: 'string',
    defaultVal: value,
}));

const ALL_ICONS = ICON_LIST as { name: string; label: string }[];

const filter = ref('');

const shownIcons = computed(() => {
    const q = filter.value.trim().toLowerCase();
    if (!q) return ALL_ICONS;
    return ALL_ICONS.filter((i) => i.name.toLowerCase().includes(q));
});

const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
    gap: '10px',
    marginTop: '12px',
};

const cellStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 6px',
    background: '#faf8f3',
    border: '1px solid #e8e2d6',
    borderRadius: '12px',
};

const cellLabelStyle: CSSProperties = {
    fontSize: '11px',
    color: '#a0936e',
    wordBreak: 'break-all',
    textAlign: 'center',
};

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

const PALETTE_KEYS = Object.keys(NAIVE_PALETTE) as PaletteColor[];

/** 描边缩放演示：默认 3.5 为设计基准，其余按比例放大 */
const STROKE_SAMPLES = [1, 3.5, 7];

/** 分类分组，受上方搜索框约束 */
const shownGroups = computed(() => {
    const q = filter.value.trim().toLowerCase();
    if (!q) return ICONS_BY_CATEGORY;
    return ICONS_BY_CATEGORY.map((g) => ({
        category: g.category,
        icons: g.icons.filter((n) => n.toLowerCase().includes(q)),
    })).filter((g) => g.icons.length > 0);
});

const code = `<!-- 方式一：按名称渲染，图标名见 ICON_LIST / IconName -->
<Icon name="Cat" :size="32" />
<Icon name="Rocket" :size="32" :color="#E76F51" />
<Icon name="Star" :size="32" bounce />

<!-- 方式二：直接导入单个图标组件（可传 size / color / strokeWidth） -->
<script setup lang="ts">
import { CatIcon, FishIcon } from 'animal-island-vue';
<\/script>
<template>
    <CatIcon :size="32" />
    <FishIcon :size="32" color="#2A9D8F" />
</template>

<!-- 方式三：传入图片 -->
<Icon src="/photo.png" :size="32" />`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Icon <span :style="tagStyle">{{ ALL_ICONS.length }} 个内置图标</span>
        </div>

        <div :style="labelStyle">按名称渲染 — name 属性（Vue 端自带 164 个手绘 SVG，不依赖图标库）</div>
        <div :style="{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }">
            <Icon name="Cat" :size="36" />
            <Icon name="Rocket" :size="36" />
            <Icon name="Star" :size="36" :stroke-width="4" />
            <Icon name="Heart" :size="36" />
            <Icon name="Star" :size="36" bounce />
        </div>

        <div :style="labelStyle">直接导入图标组件 — 可单独 import，props 同样透传</div>
        <div :style="gridStyle">
            <div v-for="item in DIRECT_ICONS" :key="item.name" :style="cellStyle">
                <component :is="item.cmp" :size="28" />
                <span :style="cellLabelStyle">{{ item.name }}</span>
            </div>
        </div>

        <div :style="labelStyle">调色板 — color 可传任意色，也可用内置调色板 key</div>
        <div :style="{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }">
            <div v-for="key in PALETTE_KEYS" :key="key" :style="{ ...cellStyle, minWidth: '72px' }">
                <Icon name="Flower" :size="24" :color="NAIVE_PALETTE[key]" />
                <span :style="cellLabelStyle">{{ key }}</span>
            </div>
        </div>

        <div :style="labelStyle">全部图标 — 支持按名称搜索筛选</div>
        <div :style="{ maxWidth: '280px', marginBottom: '8px' }">
            <Input v-model="filter" allow-clear placeholder="输入关键字筛选图标名" />
        </div>
        <div :style="{ fontSize: '13px', color: '#a0936e', marginBottom: '4px' }">
            当前显示 {{ shownIcons.length }} / {{ ALL_ICONS.length }}
        </div>
        <div :style="gridStyle">
            <div v-for="item in shownIcons" :key="item.name" :style="cellStyle">
                <Icon :name="item.name as IconName" :size="26" />
                <span :style="cellLabelStyle">{{ item.name }}</span>
            </div>
        </div>

        <div :style="labelStyle">描边宽度 — strokeWidth 等比缩放内层所有描边，粗细层次保持不变</div>
        <div :style="{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }">
            <div
                v-for="sw in STROKE_SAMPLES"
                :key="sw"
                :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }"
            >
                <Icon name="Mountain" :size="40" :stroke-width="sw" />
                <span :style="cellLabelStyle">{{ sw }}</span>
            </div>
        </div>

        <div :style="labelStyle">填充色 — fill 只作用于根 svg，内层图形的填充是设计值不受影响</div>
        <div :style="{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }">
            <Icon name="Bell" :size="36" fill="#2A9D8F" />
            <Icon name="Anchor" :size="36" fill="#E76F51" />
            <Icon name="Sun" :size="36" fill="#E9C46A" />
        </div>

        <div :style="labelStyle">分类 taxonomy — ICON_CATEGORIES / ICONS_BY_CATEGORY（每个图标都有归属）</div>
        <div :style="{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }">
            <Tag v-for="g in shownGroups" :key="g.category">{{ g.category }} · {{ g.icons.length }}</Tag>
        </div>
        <div v-for="g in shownGroups" :key="g.category" :style="{ marginBottom: '18px' }">
            <div :style="{ fontSize: '13px', color: '#794f27', marginBottom: '4px' }">{{ g.category }}</div>
            <div :style="gridStyle">
                <div v-for="name in g.icons" :key="name" :style="cellStyle">
                    <Icon :name="name" :size="24" />
                    <span :style="cellLabelStyle">{{ name }}</span>
                </div>
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="ICON_API" />
        <ApiTable :rows="PALETTE_API" />
    </div>
</template>
