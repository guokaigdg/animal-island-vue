<script setup lang="ts">
import { ref } from 'vue';
import { Tag } from '@';
import type { TagColor } from '@';
import {
    sectionStyle,
    sectionTitleStyle,
    tagStyle,
    labelStyle,
    demoBodyStyle,
    ApiTable,
    CodeBlock,
} from '../tools';
import type { ApiRow } from '../tools';

const TAG_API: ApiRow[] = [
    { prop: 'default', desc: '标签内容（默认插槽）', type: 'slot', defaultVal: '-' },
    {
        prop: 'size',
        desc: '尺寸',
        type: `'small' | 'medium' | 'large'`,
        defaultVal: "'medium'",
    },
    {
        prop: 'variant',
        desc: '风格变体',
        type: `'solid' | 'outlined' | 'dashed' | 'soft'`,
        defaultVal: "'soft'",
    },
    {
        prop: 'color',
        desc: '颜色（与 Card 同款 13 色调色板）',
        type: `'default' | 'app-pink' | 'purple' | 'app-blue' | 'app-yellow' | 'app-orange' | 'app-teal' | 'app-green' | 'app-red' | 'lime-green' | 'yellow-green' | 'brown' | 'warm-peach-pink'`,
        defaultVal: "'default'",
    },
    { prop: 'closable', desc: '是否可关闭', type: 'boolean', defaultVal: 'false' },
    { prop: 'disabled', desc: '禁用', type: 'boolean', defaultVal: 'false' },
    { prop: '@close', desc: '关闭回调', type: '(event: MouseEvent) => void', defaultVal: '-' },
    { prop: '@click', desc: '点击回调（开启后标签可点击）', type: '(event: MouseEvent) => void', defaultVal: '-' },
];

const rowStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' as const, alignItems: 'flex-start' };

const COLORS: TagColor[] = [
    'default',
    'app-pink',
    'purple',
    'app-blue',
    'app-yellow',
    'app-orange',
    'app-teal',
    'app-green',
    'app-red',
    'lime-green',
    'yellow-green',
    'brown',
    'warm-peach-pink',
];

type ClosableItem = { name: string; color: TagColor };
const closableItems = ref<ClosableItem[]>([
    { name: 'Apple', color: 'app-pink' },
    { name: 'Banana', color: 'app-yellow' },
    { name: 'Grape', color: 'purple' },
    { name: 'Blueberry', color: 'app-blue' },
    { name: 'Mint', color: 'app-teal' },
    { name: 'Lime', color: 'lime-green' },
    { name: 'Orange', color: 'app-orange' },
]);

function removeItem(item: ClosableItem) {
    closableItems.value = closableItems.value.filter((x) => x.name !== item.name);
}

function alertTag() {
    alert('点了 Tag');
}

function alertOutlinedTag() {
    alert('点了 outlined Tag');
}

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Tag } from 'animal-island-vue';

const items = ref([
    { name: 'Apple', color: 'app-pink' },
    { name: 'Blueberry', color: 'app-blue' },
]);

function removeItem(item) {
    items.value = items.value.filter(x => x.name !== item.name);
}
<\/script>

<template>
    <!-- 基础 -->
    <Tag>default</Tag>
    <Tag color="app-pink">app-pink</Tag>
    <Tag color="app-blue">app-blue</Tag>
    <Tag color="app-teal">app-teal</Tag>

    <!-- 风格变体 -->
    <Tag variant="outlined" color="purple">outlined</Tag>
    <Tag variant="dashed" color="app-orange">dashed</Tag>
    <Tag variant="soft" color="app-teal">soft</Tag>

    <!-- 尺寸 -->
    <Tag size="small">small</Tag>
    <Tag size="medium">medium</Tag>
    <Tag size="large">large</Tag>

    <!-- 可关闭 -->
    <Tag
        v-for="it in items"
        :key="it.name"
        :color="it.color"
        closable
        @close="removeItem(it)"
    >
        {{ it.name }}
    </Tag>

    <!-- 可点击 -->
    <Tag color="app-blue" @click="() => console.log('clicked')">
        可点击
    </Tag>

    <!-- 禁用 -->
    <Tag disabled>disabled</Tag>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Tag <span :style="tagStyle">4 variants</span>
            <span :style="tagStyle">13 colors</span>
            <span :style="tagStyle">3 sizes</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">variant 风格变体</div>
            <div :style="rowStyle">
                <Tag variant="solid"> solid </Tag>
                <Tag variant="outlined" color="app-blue"> outlined </Tag>
                <Tag variant="dashed" color="app-orange"> dashed </Tag>
                <Tag variant="soft" color="app-pink"> soft </Tag>
            </div>

            <div :style="labelStyle">size 尺寸</div>
            <div :style="rowStyle">
                <Tag size="small" color="app-blue"> small </Tag>
                <Tag size="medium" color="app-blue"> medium </Tag>
                <Tag size="large" color="app-blue"> large </Tag>
            </div>

            <div :style="labelStyle">color 颜色（soft · 同色系）</div>
            <div :style="rowStyle">
                <Tag v-for="c in COLORS" :key="`soft-${c}`" variant="soft" :color="c">
                    {{ c }}
                </Tag>
            </div>

            <div :style="labelStyle">color 颜色（solid）</div>
            <div :style="rowStyle">
                <Tag v-for="c in COLORS" :key="`solid-${c}`" variant="solid" :color="c">
                    {{ c }}
                </Tag>
            </div>

            <div :style="labelStyle">color 颜色（outlined）</div>
            <div :style="rowStyle">
                <Tag v-for="c in COLORS" :key="`outlined-${c}`" variant="outlined" :color="c">
                    {{ c }}
                </Tag>
            </div>

            <div :style="labelStyle">color 颜色（dashed）</div>
            <div :style="rowStyle">
                <Tag v-for="c in COLORS" :key="`dashed-${c}`" variant="dashed" :color="c">
                    {{ c }}
                </Tag>
            </div>

            <div :style="labelStyle">closable 可关闭</div>
            <div :style="rowStyle">
                <Tag
                    v-for="item in closableItems"
                    :key="item.name"
                    :color="item.color"
                    closable
                    @close="removeItem(item)"
                >
                    {{ item.name }}
                </Tag>
                <span
                    v-if="closableItems.length === 0"
                    :style="{ fontSize: '12px', color: '#a0936e' }"
                >
                    所有标签都已关闭
                </span>
            </div>

            <div :style="labelStyle">onClick 可点击（hover + 键盘 Enter / Space 触发）</div>
            <div :style="rowStyle">
                <Tag color="app-blue" @click="alertTag"> 可点击 </Tag>
                <Tag variant="outlined" color="app-green" @click="alertOutlinedTag">
                    outlined 可点击
                </Tag>
                <Tag color="brown" disabled @click="() => {}"> disabled </Tag>
            </div>
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="TAG_API" />
    </div>
</template>
