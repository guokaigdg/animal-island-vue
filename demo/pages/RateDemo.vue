<script setup lang="ts">
import { ref } from 'vue';
import { Rate, Radio, Tag, type RateSize } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const RATE_API: ApiRow[] = [
    {
        prop: 'v-model',
        desc: '当前评分（受控）',
        type: 'number',
        defaultVal: '-',
    },
    { prop: 'value', desc: '当前评分（受控，React value 别名，优先级高于 v-model）', type: 'number', defaultVal: '-' },
    { prop: 'defaultValue', desc: '默认评分（非受控初始值）', type: 'number', defaultVal: '0' },
    { prop: 'count', desc: '星星总数', type: 'number', defaultVal: '5' },
    {
        prop: 'size',
        desc: "尺寸：'small' / 'middle' / 'large'",
        type: `'small' | 'middle' | 'large'`,
        defaultVal: "'middle'",
    },
    { prop: 'readonly', desc: '只读，仅展示不可交互', type: 'boolean', defaultVal: 'false' },
    { prop: 'allowClear', desc: '再次点击同一颗星时清空评分', type: 'boolean', defaultVal: 'true' },
    { prop: 'change', desc: '评分变化回调，清空时为 0', type: '(value: number) => void', defaultVal: '-' },
];

const size = ref<RateSize>('middle');
const controlled = ref(3);
const lastChange = ref<number | null>(null);

const rowStyle = { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' as const };

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Rate } from 'animal-island-vue';

// 受控：v-model 跟随父级 state
const score = ref(3);
<\/script>

<template>
    <!-- 非受控：内部自维护，defaultValue 给初值 -->
    <Rate :default-value="2" />

    <!-- 受控 -->
    <Rate v-model="score" />

    <!-- 10 颗星 / large 尺寸 / 只读 -->
    <Rate :count="10" size="large" :model-value="4" readonly />

    <!-- 关闭再次点击清空 -->
    <Rate :default-value="3" :allow-clear="false" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Rate <span :style="tagStyle">评分</span></div>

        <div :style="labelStyle">基础用法 — 点击星星选中，再点同一颗清空</div>
        <div :style="rowStyle">
            <Rate />
            <Rate :default-value="2" />
            <Rate :default-value="4" />
        </div>

        <div :style="labelStyle">受控 — v-model 跟随父级 state</div>
        <div :style="rowStyle">
            <Rate v-model="controlled" @change="lastChange = $event" />
            <Tag>{{ controlled }} 星</Tag>
            <Tag v-if="lastChange !== null">最近一次 change: {{ lastChange }}</Tag>
        </div>

        <div :style="labelStyle">只读 — 仅展示不可交互</div>
        <div :style="rowStyle">
            <Rate :model-value="3" readonly />
            <Rate :model-value="5" readonly size="large" />
            <Rate :model-value="4.6" readonly />
        </div>

        <div :style="labelStyle">星星总数</div>
        <div :style="rowStyle">
            <Rate :count="3" :default-value="2" />
            <Rate :count="7" :default-value="5" />
            <Rate :count="10" :default-value="8" size="large" />
        </div>

        <div :style="labelStyle">尺寸</div>
        <div :style="{ marginBottom: '12px' }">
            <Radio
                v-model="size"
                :options="[
                    { label: 'small', value: 'small' },
                    { label: 'middle', value: 'middle' },
                    { label: 'large', value: 'large' },
                ]"
            />
        </div>
        <div :style="rowStyle">
            <Rate :size="size" :default-value="3" />
        </div>

        <div :style="labelStyle">allowClear — 再次点击同一颗星</div>
        <div :style="rowStyle">
            <Rate :default-value="3" />
            <Rate :default-value="3" :allow-clear="false" />
        </div>

        <div :style="labelStyle">键盘可访问性 — ← → ↑ ↓ 调整，Home / End 跳首尾</div>
        <div :style="rowStyle">
            <Rate :default-value="3" />
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="RATE_API" />
    </div>
</template>
