<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { NoData, Button, Input, Table } from '@';
import type { TableColumn } from '@';
import { FolderIcon } from 'naive-icons-vue';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const API: ApiRow[] = [
    {
        prop: 'variant',
        desc: '默认 / 搜索无结果 / 简洁',
        type: "'default' | 'search' | 'simple'",
        defaultVal: "'default'",
    },
    { prop: 'size', desc: '尺寸', type: "'small' | 'medium' | 'large'", defaultVal: "'medium'" },
    {
        prop: 'title',
        desc: '标题，null / false 隐藏',
        type: 'string | VNode | null | false',
        defaultVal: '暂无数据 / 没有找到相关结果',
    },
    {
        prop: 'description',
        desc: '补充说明，null / false 隐藏',
        type: 'string | VNode | null | false',
        defaultVal: '-',
    },
    {
        prop: 'icon',
        desc: '自定义装饰图标，null / false 隐藏',
        type: 'VNode | null | false',
        defaultVal: '空纸箱 / 放大镜插画',
    },
    { prop: 'extra', desc: '操作区，优先于默认插槽', type: 'VNode | string | null | false', defaultVal: '-' },
    { prop: 'bordered', desc: '奶油背景与沙色虚线边框', type: 'boolean', defaultVal: 'false' },
    { prop: 'icon 插槽', desc: '自定义装饰图标，优先于 icon 属性', type: 'slot', defaultVal: '-' },
    { prop: 'default 插槽', desc: '操作区，extra 优先于它', type: 'slot', defaultVal: '-' },
];

interface Note extends Record<string, unknown> {
    key: string;
    name: string;
}

const query = ref('星星');
const created = ref(false);
const islands = computed(() => ['薄荷岛', '蜜桃岛', '珊瑚岛'].filter((name) => name.includes(query.value)));

const columns: TableColumn<Note>[] = [{ title: '岛屿手账', dataIndex: 'name' }];
const notes = computed<Note[]>(() => (created.value ? [{ key: '1', name: '第一篇海岛手账' }] : []));

const code = `import { NoData, Button } from 'animal-island-vue';

// 基础空态：内置插画 + 「暂无数据」
<NoData description="这里还没有记录，新的故事可以从开始。" />

// 搜索无结果：换放大镜插画与对应默认文案
<NoData variant="search" title="没有找到相关结果" />

// 表格里的简洁空态：隐藏插画，只留说明 + 按钮
<NoData variant="simple" size="small" :icon="null" description="写下今天的第一件小事。">
    <Button size="small">新建手账</Button>
</NoData>

// 也可以直接放进 Table 的 #empty 插槽
<Table :columns="columns" :data-source="notes">
    <template #empty>
        <NoData variant="simple" size="small" :icon="null" description="写下今天的第一件小事。">
            <Button size="small">新建手账</Button>
        </NoData>
    </template>
</Table>

// 自定义装饰图标（#icon 插槽优先于 icon 属性）
<NoData>
    <template #icon>
        <FolderIcon />
    </template>
</NoData>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            NoData <span :style="tagStyle">空状态</span> <span :style="tagStyle">海岛风插画</span>
        </div>

        <!-- ---- 原生图标空态预览 ---- -->
        <div :style="labelStyle">内置插画：空纸箱 / 放大镜</div>
        <div
            :style="{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                gap: '24px',
            }"
        >
            <NoData bordered title="这里还是空白的一页" description="记录下一件小事，让海岛的故事慢慢展开。" />
            <NoData variant="search" bordered title="暂时没有找到" description="换个关键词试试，也许会有新的发现。" />
        </div>

        <!-- ---- 基础空态 ---- -->
        <div :style="labelStyle">基础空态</div>
        <NoData description="这里还没有记录，新的故事可以从现在开始。" />

        <!-- ---- 搜索无结果与恢复 ---- -->
        <div :style="labelStyle">搜索无结果与恢复</div>
        <Input v-model="query" aria-label="搜索岛屿" placeholder="搜索岛屿名称" />
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            :style="{ marginTop: '12px', fontSize: '14px', color: '#725d42' }"
        >
            {{ islands.length ? `找到 ${islands.length} 个岛屿` : `没有找到“${query}”相关的岛屿` }}
        </div>
        <ul v-if="islands.length" aria-label="岛屿搜索结果" :style="{ margin: '12px 0 0', paddingLeft: '20px' }">
            <li v-for="name in islands" :key="name">{{ name }}</li>
        </ul>
        <NoData
            v-else
            variant="search"
            :title="`没有找到“${query}”`"
            description="试试其他名称，或清除条件查看全部岛屿。"
            :extra="h(Button, { onClick: () => (query = '') }, () => '清除搜索')"
        />

        <!-- ---- 表格内的简洁空态 ---- -->
        <div :style="labelStyle">表格内的简洁空态</div>
        <Table :columns="columns" :data-source="notes">
            <template #empty>
                <NoData variant="simple" size="small" :icon="null" description="写下今天的第一件小事。">
                    <Button size="small" @click="created = true">新建手账</Button>
                </NoData>
            </template>
        </Table>
        <Button v-if="created" size="small" :style="{ marginTop: '12px' }" @click="created = false">
            重新体验空态
        </Button>

        <!-- ---- 尺寸与自定义内容 ---- -->
        <div :style="labelStyle">尺寸与自定义内容</div>
        <div
            :style="{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: '20px',
            }"
        >
            <NoData size="small" bordered title="小尺寸" description="适合列表与卡片内部" />
            <NoData bordered title="标准尺寸" description="适合常规内容区" />
            <NoData size="large" bordered title="大尺寸" description="适合整页空态" />
        </div>
        <div :style="{ marginTop: '24px' }">
            <NoData
                :icon="h(FolderIcon, { color: 'currentColor' })"
                title="收藏夹还是空的"
                description="遇到喜欢的内容时，记得收藏到这里。"
            />
        </div>
        <div :style="{ marginTop: '24px' }">
            <NoData :icon="null" title="仅文字提示" description="图标、标题、说明和操作区都可以单独配置。" />
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="API" />
    </div>
</template>
