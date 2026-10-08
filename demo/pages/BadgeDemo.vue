<script setup lang="ts">
import { ref } from 'vue';
import { Badge, Radio, Tag, type BadgeColor } from '@';
import { UserIcon, BellIcon, MailIcon, HeartIcon } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const BADGE_API: ApiRow[] = [
    {
        prop: 'count',
        desc: '展示的内容：数字 / 字符串；需要图标等结构化内容时改用 #count 插槽',
        type: 'string | number',
        defaultVal: '-',
    },
    {
        prop: 'overflowCount',
        desc: '展示封顶的数字值，超过时显示为 `${overflowCount}+`',
        type: 'number',
        defaultVal: '99',
    },
    { prop: 'showZero', desc: '数值为 0 时是否展示', type: 'boolean', defaultVal: 'false' },
    { prop: 'dot', desc: '不展示数字，只展示一个小圆点', type: 'boolean', defaultVal: 'false' },
    {
        prop: 'size',
        desc: "尺寸，仅对数字角标生效（dot 尺寸固定）：'small' / 'medium'",
        type: `'small' | 'medium'`,
        defaultVal: "'medium'",
    },
    { prop: 'color', desc: '颜色，与 Card / Tag 调色板一致（12 色）', type: 'BadgeColor', defaultVal: "'app-red'" },
    { prop: 'default', desc: '被包裹的元素；不传即为独立使用', type: 'slot', defaultVal: '-' },
    { prop: 'count', desc: '自定义角标内容，优先于 count 属性', type: 'slot', defaultVal: '-' },
];

const COLORS: BadgeColor[] = [
    'app-red',
    'app-pink',
    'app-orange',
    'app-yellow',
    'app-teal',
    'app-green',
    'app-blue',
    'purple',
    'lime-green',
    'yellow-green',
    'brown',
    'warm-peach-pink',
];

const color = ref<BadgeColor>('app-red');
const live = ref(3);

const rowStyle = { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' as const };

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Badge, Tag } from 'animal-island-vue';

const live = ref(3);
<\/script>

<template>
    <!-- 包裹元素：角标定位到右上角 -->
    <Badge :count="live">
        <Tag>消息</Tag>
    </Badge>

    <!-- 封顶：100 → 99+ -->
    <Badge :count="100" :overflow-count="99">
        <Tag>未读</Tag>
    </Badge>

    <!-- 小红点 -->
    <Badge dot>
        <Tag>通知</Tag>
    </Badge>

    <!-- 自定义角标内容：#count 插槽 -->
    <Badge>
        <Tag>收藏</Tag>
        <template #count>
            <HeartIcon />
        </template>
    </Badge>

    <!-- 独立使用：不传默认插槽即取消绝对定位 -->
    <Badge :count="11" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Badge <span :style="tagStyle">徽标数</span></div>

        <div :style="labelStyle">基础用法 — 包裹元素，角标落在右上角</div>
        <div :style="rowStyle">
            <Badge :count="1">
                <Tag>消息</Tag>
            </Badge>
            <Badge :count="5">
                <Tag>未读</Tag>
            </Badge>
            <Badge :count="live">
                <Tag>动态计数</Tag>
            </Badge>
        </div>

        <div :style="labelStyle">封顶 — 超过 overflowCount 显示 N+</div>
        <div :style="rowStyle">
            <Badge :count="100">
                <Tag>100</Tag>
            </Badge>
            <Badge :count="99">
                <Tag>99（不封顶）</Tag>
            </Badge>
            <Badge :count="99" :overflow-count="10">
                <Tag>overflow 10</Tag>
            </Badge>
        </div>

        <div :style="labelStyle">零值 — 默认隐藏，showZero 开启后展示</div>
        <div :style="rowStyle">
            <Badge :count="0">
                <Tag>默认隐藏</Tag>
            </Badge>
            <Badge :count="0" show-zero>
                <Tag>showZero</Tag>
            </Badge>
        </div>

        <div :style="labelStyle">dot — 只展示小圆点，不渲染数字</div>
        <div :style="rowStyle">
            <Badge dot>
                <Tag>通知</Tag>
            </Badge>
            <Badge dot>
                <UserIcon :size="22" />
            </Badge>
            <Badge dot>
                <BellIcon :size="22" />
            </Badge>
        </div>

        <div :style="labelStyle">尺寸 — 仅对数字角标生效</div>
        <div :style="rowStyle">
            <Badge :count="9" size="small">
                <Tag>small</Tag>
            </Badge>
            <Badge :count="9">
                <Tag>medium</Tag>
            </Badge>
            <Badge :count="1000" size="small">
                <Tag>胶囊</Tag>
            </Badge>
        </div>

        <div :style="labelStyle">颜色 — 与 Card / Tag 同一调色板</div>
        <div :style="{ marginBottom: '12px' }">
            <Radio v-model="color" :options="COLORS.map((c) => ({ label: c, value: c }))" />
        </div>
        <div :style="rowStyle">
            <Badge :count="8" :color="color">
                <Tag>{{ color }}</Tag>
            </Badge>
        </div>
        <div :style="rowStyle">
            <Badge v-for="c in COLORS" :key="c" :count="3" :color="c" :style="{ marginRight: '10px' }" />
        </div>

        <div :style="labelStyle">自定义内容 — #count 插槽放图标</div>
        <div :style="rowStyle">
            <Badge>
                <Tag>收藏</Tag>
                <template #count>
                    <HeartIcon :size="12" />
                </template>
            </Badge>
            <Badge>
                <Tag>邮件</Tag>
                <template #count>
                    <MailIcon :size="12" />
                </template>
            </Badge>
        </div>

        <div :style="labelStyle">独立使用 — 不传被包裹元素即取消绝对定位</div>
        <div :style="rowStyle">
            <Badge :count="11" />
            <Badge :count="1" size="small" />
            <Badge dot />
        </div>

        <div :style="labelStyle">非数字内容</div>
        <div :style="rowStyle">
            <Badge :count="'NEW'">
                <Tag>字符串</Tag>
            </Badge>
            <Badge :count="'热更'">
                <Tag>两格全角</Tag>
            </Badge>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="BADGE_API" />
    </div>
</template>

<style scoped>
:deep(svg) {
    vertical-align: middle;
}
</style>
