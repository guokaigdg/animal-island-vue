<script setup lang="ts">
import { ref } from 'vue';
import { Pagination, Table } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';
import type { TableColumn } from '@';

const PAGINATION_API: ApiRow[] = [
    { prop: 'total', desc: '数据总数', type: 'number', defaultVal: '-', required: true },
    { prop: 'v-model:current', desc: '当前页（受控）', type: 'number', defaultVal: '-' },
    { prop: 'defaultCurrent', desc: '默认当前页', type: 'number', defaultVal: '1' },
    { prop: 'v-model:pageSize', desc: '每页条数（受控）', type: 'number', defaultVal: '-' },
    { prop: 'defaultPageSize', desc: '默认每页条数', type: 'number', defaultVal: '10' },
    { prop: 'change', desc: '页码或每页条数变化回调', type: '(page, pageSize) => void', defaultVal: '-' },
    { prop: 'showSizeChange', desc: '每页条数变化回调', type: '(current, size) => void', defaultVal: '-' },
    { prop: 'showSizeChanger', desc: '是否显示每页条数切换器', type: 'boolean', defaultVal: 'false' },
    { prop: 'pageSizeOptions', desc: '可选的每页条数列表', type: 'number[]', defaultVal: '[10, 20, 50, 100]' },
    { prop: 'showQuickJumper', desc: '是否显示快速跳转输入框', type: 'boolean', defaultVal: 'false' },
    { prop: 'showTotal', desc: '是否显示总条数文本', type: 'boolean', defaultVal: 'false' },
    { prop: 'disabled', desc: '是否禁用', type: 'boolean', defaultVal: 'false' },
    {
        prop: 'variant',
        desc: '配色：orange 琥珀橘（默认）/ teal 青',
        type: "'orange' | 'teal'",
        defaultVal: "'orange'",
    },
];

const TABLE_PAGINATION_API: ApiRow[] = [
    {
        prop: 'pagination',
        desc: '分页配置；传入对象开启客户端分页，false 或缺省不分页（total 由 Table 内部按数据量计算）',
        type: 'false | object',
        defaultVal: '-',
    },
    { prop: 'change', desc: '页码或每页条数变化回调', type: '(page, pageSize) => void', defaultVal: '-' },
];

interface Islander extends Record<string, unknown> {
    key: string;
    name: string;
    age: number;
    island: string;
}

const COLUMNS: TableColumn<Islander>[] = [
    { title: '岛民', dataIndex: 'name', width: 120 },
    { title: '年龄', dataIndex: 'age', width: 80, align: 'center' },
    { title: '岛屿', dataIndex: 'island' },
];

const ISLANDERS: Islander[] = [
    '豆狸|26|彩虹岛',
    '粒狸|24|彩虹岛',
    '西施惠|28|好评岛',
    '喻哥|30|无人岛',
    '小润|22|摸鱼岛',
    '狸克|45|无人岛',
    '傅达|38|博物馆岛',
    '狐利|35|艺术品岛',
    '巴猎|29|拍照岛',
    '曹卖|60|大头菜岛',
    '幽幽|18|幽灵岛',
    '薛革|33|鞋岛',
    '麻儿|27|裁缝岛',
    '磊石|41|石头岛',
    '阿猎|36|猎人之岛',
    '然然|31|园艺岛',
    '俞司廷|34|音乐岛',
    '龙克斯|37|化石岛',
    '肯恩|25|旅行岛',
    '绵绵|23|云朵岛',
    '企鹅|20|冰岛',
    '阿呆|21|呆萌岛',
    '章立安|39|新闻岛',
    '美玲|26|体操岛',
    '静江|44|温泉岛',
    'JK|28|健身岛',
    '小薇|27|花岛',
    '安仔|24|玩具岛',
    '小慧|29|书本岛',
    '佩琪|32|派对岛',
].map((row, i) => {
    const [name, age, island] = row.split('|');
    return { key: String(i + 1), name, age: Number(age), island };
});

const page = ref(1);
const pageSize = ref(20);

const code = `import { ref } from 'vue';
import { Pagination, Table } from 'animal-island-vue';

const page = ref(1);
const pageSize = ref(20);

// 独立使用（受控）
<Pagination
    v-model:current="page"
    v-model:page-size="pageSize"
    :total="500"
    show-total
    show-quick-jumper
/>

// Table 内置客户端分页
<Table
    :columns="columns"
    :data-source="data"
    :pagination="{ defaultPageSize: 5, showTotal: true, showSizeChanger: true }"
/>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Pagination <span :style="tagStyle">分页</span> <span :style="tagStyle">受控 / 非受控</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">基础用法</div>
            <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
                <div style="display: flex; align-items: center; gap: 8px">
                    <span :style="tagStyle">orange（默认）</span>
                    <Pagination :total="85" :default-page-size="10" :default-current="4" />
                </div>
                <div style="display: flex; align-items: center; gap: 8px">
                    <span :style="tagStyle">teal</span>
                    <Pagination :total="85" :default-page-size="10" :default-current="4" variant="teal" />
                </div>
            </div>

            <div :style="labelStyle">总条数 + 每页条数切换</div>
            <Pagination
                :total="85"
                :default-current="3"
                show-total
                show-size-changer
                :page-size-options="[10, 20, 50]"
            />

            <div :style="labelStyle">快速跳转（受控）</div>
            <Pagination
                v-model:current="page"
                v-model:page-size="pageSize"
                :total="500"
                show-total
                show-quick-jumper
            />

            <div :style="labelStyle">禁用</div>
            <Pagination :total="85" :default-current="4" disabled />

            <div :style="labelStyle">配合 Table（pagination 属性）</div>
            <Table
                :columns="COLUMNS"
                :data-source="ISLANDERS"
                :pagination="{
                    defaultPageSize: 5,
                    showTotal: true,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20],
                }"
            />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="PAGINATION_API" />
        <div :style="labelStyle">Table 分页属性</div>
        <ApiTable :rows="TABLE_PAGINATION_API" />
    </div>
</template>
