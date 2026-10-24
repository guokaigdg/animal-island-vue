<script setup lang="ts">
import { ref } from 'vue';
import { Calendar, Radio, Tag, type CalendarEvent, type CalendarColor } from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const CALENDAR_API: ApiRow[] = [
    { prop: 'v-model', desc: '当前选中日期（受控），YYYY-MM-DD', type: 'string', defaultVal: '-' },
    {
        prop: 'value',
        desc: '当前选中日期（受控，React value 别名，优先级高于 v-model）',
        type: 'string',
        defaultVal: '-',
    },
    { prop: 'defaultValue', desc: '默认选中日期（非受控）；不传时默认今天', type: 'string', defaultVal: '今天' },
    {
        prop: 'v-model:panel-value',
        desc: '面板当前展示月份（受控）；传了必须回写，否则无法翻月',
        type: 'string',
        defaultVal: '-',
    },
    {
        prop: 'defaultPanelValue',
        desc: '默认展示月份（非受控）；不传时跟随选中值 / 今天',
        type: 'string',
        defaultVal: '-',
    },
    { prop: 'events', desc: '事项列表；布局按数组引用缓存，变更请传新数组', type: 'CalendarEvent[]', defaultVal: '-' },
    { prop: 'showEventTime', desc: '是否在事项条展示起始时间', type: 'boolean', defaultVal: 'true' },
    {
        prop: 'draggableEvents',
        desc: '允许鼠标拖拽跨日期创建事项（松手触发 eventCreate）',
        type: 'boolean',
        defaultVal: 'false',
    },
    {
        prop: 'width',
        desc: '面板宽度，默认铺满父容器；行高与事项密度由实际宽度推导',
        type: 'number | string',
        defaultVal: '-',
    },
    { prop: 'update:modelValue / change', desc: '选中日期变化', type: '(date: string) => void', defaultVal: '-' },
    {
        prop: 'update:panelValue / panelChange',
        desc: '翻月，参数为 YYYY-MM',
        type: '(month: string) => void',
        defaultVal: '-',
    },
    {
        prop: 'eventCreate',
        desc: '拖拽创建事项完成，参数为起止日期',
        type: '(start: string, end: string) => void',
        defaultVal: '-',
    },
    { prop: 'event', desc: '作用域插槽 { event, segment, time }，自定义事项条内容', type: 'slot', defaultVal: '-' },
];

const EVENT_API: ApiRow[] = [
    {
        prop: 'title',
        desc: '事项内容（字符串或数字；结构化内容用 #event 插槽）',
        type: 'string | number',
        defaultVal: '-',
    },
    { prop: 'start', desc: '开始日期 YYYY-MM-DD 或 YYYY-MM-DD HH:mm', type: 'string', defaultVal: '-' },
    { prop: 'end', desc: '结束日期，省略等同于 start；传入则渲染成跨天连续事项条', type: 'string', defaultVal: '-' },
    { prop: 'color', desc: '颜色', type: `'teal' | 'amber' | 'coral' | 'green' | 'purple'`, defaultVal: "'teal'" },
    {
        prop: 'showTime',
        desc: '是否在事项条首段展示起始时间（跨周续接段不重复展示）',
        type: 'boolean',
        defaultVal: '-',
    },
];

const COLORS: CalendarColor[] = ['teal', 'amber', 'coral', 'green', 'purple'];

/** 演示数据：固定日期，避免依赖「今天」导致断言不稳定 */
const EVENTS: CalendarEvent[] = [
    { title: '晨会', start: '2026-03-02 09:00', color: 'teal' },
    { title: '设计评审', start: '2026-03-04', end: '2026-03-06', color: 'amber', showTime: false },
    { title: '联调', start: '2026-03-05', color: 'coral' },
    { title: '上线', start: '2026-03-09', color: 'green' },
    { title: '周报', start: '2026-03-13', color: 'purple' },
];

const selected = ref('2026-03-04');
const panel = ref('2026-03');
const showEventTime = ref<'on' | 'off'>('on');
const draggable = ref<'on' | 'off'>('off');
const pickedEvents = ref<CalendarEvent[]>([]);

/** 演示最大宽度：与组件设计基准宽度一致，避免宽屏下拉得过宽 */
const DEMO_MAX_WIDTH = '750px';

const COLORS_API: ApiRow[] = COLORS.map((c) => ({ prop: c, desc: '事项条配色', type: 'CalendarColor', defaultVal: c }));

const rowStyle = { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' as const };

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Calendar } from 'animal-island-vue';

const selected = ref('2026-03-04');
const panel = ref('2026-03');
const events = ref([
    { title: '晨会', start: '2026-03-02 09:00', color: 'teal' },
    // 跨天事项：start / end 不同，渲染成跨周的连续条
    { title: '设计评审', start: '2026-03-04', end: '2026-03-06', color: 'amber' },
]);
<\/script>

<template>
    <!-- 受控：v-model 选日期，v-model:panel-value 翻月（传了必须回写） -->
    <Calendar v-model="selected" v-model:panel-value="panel" :events="events" />

    <!-- 非受控 -->
    <Calendar default-value="2026-03-04" :events="events" />

    <!-- 拖拽创建事项 -->
    <Calendar v-model="selected" draggable-events @event-create="onCreate" />

    <!-- 自定义事项条内容 -->
    <Calendar v-model="selected" :events="events">
        <template #event="{ event, segment }">
            <span>{{ segment.date }} · {{ event.title }}</span>
        </template>
    </Calendar>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Calendar <span :style="tagStyle">日历</span></div>

        <div :style="labelStyle">基础用法 — 点日期查看选中项（受控）</div>
        <Calendar v-model="selected" :events="EVENTS" :style="{ maxWidth: DEMO_MAX_WIDTH }" />
        <div :style="{ fontSize: '13px', color: '#a0936e', marginTop: '10px' }">
            当前选中：<Tag>{{ selected }}</Tag>
        </div>

        <div :style="labelStyle">非受控 — defaultValue 指定初始日期</div>
        <Calendar default-value="2026-03-11" :events="EVENTS" :style="{ maxWidth: DEMO_MAX_WIDTH }" />

        <div :style="labelStyle">受控翻月 — v-model:panel-value 必须回写</div>
        <Calendar v-model="selected" v-model:panel-value="panel" :events="EVENTS" :style="{ maxWidth: DEMO_MAX_WIDTH }" />
        <div :style="{ fontSize: '13px', color: '#a0936e', marginTop: '10px' }">
            当前面板：<Tag>{{ panel }}</Tag>
        </div>

        <div :style="labelStyle">事项时间 — showEventTime 控制是否展示起始时间</div>
        <div :style="{ marginBottom: '12px' }">
            <Radio
                v-model="showEventTime"
                :options="[
                    { label: '展示时间', value: 'on' },
                    { label: '只显示标题', value: 'off' },
                ]"
            />
        </div>
        <Calendar
            v-model="selected"
            :events="EVENTS"
            :show-event-time="showEventTime === 'on'"
            :style="{ maxWidth: DEMO_MAX_WIDTH }"
        />

        <div :style="labelStyle">颜色 — 5 种事项配色</div>
        <div :style="rowStyle">
            <Tag v-for="c in COLORS" :key="c" :style="{ marginRight: '8px' }">{{ c }}</Tag>
        </div>
        <Calendar
            v-model="selected"
            :events="COLORS.map((c, i) => ({ title: c, start: `2026-03-0${i + 2}`, color: c }))"
            :style="{ maxWidth: DEMO_MAX_WIDTH }"
        />

        <div :style="labelStyle">拖拽创建事项 — draggableEvents + eventCreate</div>
        <div :style="{ marginBottom: '12px' }">
            <Radio
                v-model="draggable"
                :options="[
                    { label: '开启拖拽', value: 'on' },
                    { label: '关闭', value: 'off' },
                ]"
            />
        </div>
        <Calendar
            v-model="selected"
            :events="EVENTS"
            :draggable-events="draggable === 'on'"
            :style="{ maxWidth: DEMO_MAX_WIDTH }"
            @event-create="
                (start, end) => {
                    pickedEvents.push({ title: '新事项', start, end });
                }
            "
        />
        <div :style="{ fontSize: '13px', color: '#a0936e', marginTop: '10px' }">
            已创建：<Tag v-for="(e, i) in pickedEvents" :key="i">{{ e.start }} → {{ e.end }}</Tag>
            <span v-if="!pickedEvents.length">在日历上按住拖动试试</span>
        </div>

        <div :style="labelStyle">宽度 — 行高与事项密度随宽度自适应</div>
        <Calendar v-model="selected" :events="EVENTS" :width="420" />
        <div :style="{ height: '16px' }" />
        <Calendar v-model="selected" :events="EVENTS" :style="{ maxWidth: DEMO_MAX_WIDTH }" />

        <CodeBlock :code="code" />
        <ApiTable :rows="CALENDAR_API" />
        <ApiTable :rows="EVENT_API" />
        <ApiTable :rows="COLORS_API" />
    </div>
</template>
