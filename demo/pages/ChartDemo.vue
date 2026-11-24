<script setup lang="ts">
import { computed, ref } from 'vue';
import { Chart, Button, type ChartType, type ChartDataEvent } from '@';
import { sectionStyle, sectionTitleStyle, labelStyle, ApiTable } from '../tools';
import type { ApiRow } from '../tools';
import { CHART_PAGES, exampleProps } from './chartData';

const API: ApiRow[] = [
    { prop: 'type', desc: '19 种类型，见下方图表类型切换', type: 'ChartType', defaultVal: "'column'" },
    { prop: 'series', desc: '系列名称、data、颜色，mix 可配置系列 type', type: 'ChartSeries[]', defaultVal: '-', required: true },
    { prop: 'categories', desc: '分类轴或雷达维度标签', type: 'string[]', defaultVal: '-' },
    { prop: 'title / description', desc: '图表标题与说明', type: 'string | VNode', defaultVal: '-' },
    { prop: 'height', desc: '绘图区高度，最小 180px', type: 'number', defaultVal: '300' },
    { prop: 'colors', desc: '自定义配色，系列色和单点色优先', type: 'string[]', defaultVal: '岛屿配色' },
    { prop: 'legend', desc: '可筛选和悬浮联动的图例', type: 'boolean', defaultVal: 'true' },
    { prop: 'tooltip', desc: '提示开关或配置对象，见下方参数', type: 'boolean | ChartTooltipOptions', defaultVal: 'true' },
    { prop: 'tooltip.trigger', desc: '同分类对比 / 单点提示', type: "'axis' | 'item'", defaultVal: "'axis'" },
    { prop: 'tooltip.crosshair / showPercentage', desc: '坐标辅助线 / 占比及漏斗转化率', type: 'boolean', defaultVal: 'true' },
    { prop: 'tooltip.render', desc: '自定义提示，收到 type、name、items、locked；返回 null 隐藏', type: '(context) => VNode | null', defaultVal: '-' },
    { prop: 'highlight / selectable', desc: '悬浮高亮 / 点击锁定，方向键浏览数据，Esc 解除', type: 'boolean', defaultVal: 'true' },
    { prop: 'stacked', desc: '柱状、条状图正负值分别堆叠', type: 'boolean', defaultVal: 'false' },
    { prop: 'smooth', desc: '折线、面积、混合、时序图平滑；山峰图圆润峰顶', type: 'boolean', defaultVal: 'false' },
    { prop: 'showAxes / showLabels', desc: '坐标网格 / 数据标签', type: 'boolean', defaultVal: 'true / false' },
    { prop: 'min / max', desc: '值域；圆弧与仪表盘默认 0–100', type: 'number', defaultVal: '自动' },
    { prop: 'valueFormatter / xFormatter', desc: '数值 / 数值横轴格式化', type: '(value: number) => string', defaultVal: '-' },
    { prop: 'regions', desc: 'map 的平面轮廓，按 name 与数据关联', type: 'ChartMapRegion[]', defaultVal: '-' },
    { prop: 'loading / emptyText', desc: '加载状态 / 空态文案', type: 'boolean / string | VNode', defaultVal: 'false / 暂无数据' },
    { prop: 'animated', desc: '入场淡入，遵循减少动态效果设置', type: 'boolean', defaultVal: 'true' },
    { prop: '@data-click', desc: '点击、Enter 或 Space 触发，携带原数据与下标（对齐 React onDataClick）', type: '(event: ChartDataEvent) => void', defaultVal: '-' },
];

const activeType = ref<ChartType>('column');
const alternate = ref(false);
const empty = ref(false);
const loading = ref(false);
const enhanced = ref(false);
const message = ref('点击图形查看数据；点击图例隐藏或恢复系列。');

const page = computed(() => CHART_PAGES.find((p) => p.type === activeType.value)!);
const example = computed(() => exampleProps(activeType.value, alternate.value));
const supportsStack = computed(() => activeType.value === 'column' || activeType.value === 'bar');
const supportsSmooth = computed(() => ['line', 'area', 'mix', 'time'].includes(activeType.value));

function selectType(type: ChartType) {
    activeType.value = type;
    alternate.value = false;
    empty.value = false;
    loading.value = false;
    enhanced.value = false;
    message.value = '点击图形查看数据；点击图例隐藏或恢复系列。';
}

function onDataClick(event: ChartDataEvent) {
    message.value = `${event.seriesName} / ${event.name}：${event.value}`;
}
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">海岛统计手账 · 19 种图表</div>
        <p class="note">19 种统计图形，共用岛屿配色、数据提示、图例筛选和键盘操作。以下均为虚构演示数据；地图为自绘岛屿分区，不代表真实行政区。</p>

        <div :style="labelStyle">图表类型</div>
        <div class="catalog">
            <button
                v-for="item in CHART_PAGES"
                :key="item.type"
                type="button"
                class="catalog-item"
                :class="{ active: activeType === item.type }"
                @click="selectType(item.type)"
            >
                <strong>{{ item.label }}</strong>
                <span>{{ item.englishLabel }}</span>
            </button>
        </div>

        <div :style="labelStyle">{{ page.label }} · 海岛统计</div>
        <p class="note">{{ page.desc }}</p>
        <div class="controls">
            <Button size="small" @click="alternate = !alternate">切换数据</Button>
            <Button size="small" @click="empty = !empty">{{ empty ? '恢复数据' : '查看空态' }}</Button>
            <Button size="small" @click="loading = !loading">{{ loading ? '结束加载' : '查看加载态' }}</Button>
            <Button v-if="supportsStack || supportsSmooth" size="small" @click="enhanced = !enhanced">
                {{ supportsStack ? (enhanced ? '切换分组' : '切换堆叠') : enhanced ? '切换直线' : '切换曲线' }}
            </Button>
        </div>

        <Chart
            v-bind="example"
            :series="empty ? [] : example.series"
            :title="`岛屿${page.label}`"
            :description="page.desc"
            :stacked="supportsStack && enhanced"
            :smooth="supportsSmooth && enhanced"
            :loading="loading"
            :height="320"
            @data-click="onDataClick"
        />
        <p class="note" role="status">{{ message }}</p>

        <div v-if="['column', 'bar', 'line', 'area'].includes(activeType)" :style="labelStyle">边界示例：负值、零值与缺测</div>
        <Chart
            v-if="['column', 'bar', 'line', 'area'].includes(activeType)"
            :type="activeType"
            title="盈余与支出"
            :categories="['周一', '周二', '周三', '周四', '周五']"
            :series="[{ name: '净变化', data: [18, -12, null, 0, 26] }]"
            :height="240"
        />

        <div :style="labelStyle">交互说明</div>
        <ul class="note">
            <li>悬浮或按 Tab 聚焦数据点查看提示，同分类系列自动聚合。</li>
            <li>点击（或 Enter / Space）锁定读数，再次点击或按 Esc 解除。</li>
            <li>方向键 / Home / End 在数据点之间浏览；点击图例可隐藏或恢复系列。</li>
            <li>所有图表底部均可展开「查看数据」获取完整明细。</li>
        </ul>

        <ApiTable :rows="API" />
    </div>
</template>

<style scoped>
.note {
    font-size: 13px;
    color: #8a7b66;
    line-height: 1.7;
    margin: 8px 0;
}
.note ul {
    padding-left: 20px;
}
.catalog {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.catalog-item {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 8px 14px;
    border: 1px solid #e8e2d6;
    border-radius: 12px;
    background: #faf8f3;
    color: #725d42;
    font: inherit;
    cursor: pointer;
    transition: all 0.15s;
}
.catalog-item:hover {
    background: #e5dcc8;
}
.catalog-item.active {
    background: #b7c6e5;
    border-color: #b7c6e5;
    color: #fff;
}
.catalog-item strong {
    font-size: 13px;
}
.catalog-item span {
    font-size: 11px;
    opacity: 0.75;
}
.controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0;
}
</style>
