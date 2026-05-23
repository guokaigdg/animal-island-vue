<script setup lang="ts">
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, demoDashedBoxStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';
import { Cursor } from '../../src';

const CURSOR_API: ApiRow[] = [
    {
        prop: 'forceAll',
        desc: '是否对所有后代元素强制覆盖光标。true 全覆盖；false 仅容器自身设置自定义光标，交互元素保留 pointer/text/not-allowed',
        type: 'boolean',
        defaultVal: 'true',
    },
    { prop: 'class', desc: '自定义类名（透传到根 div）', type: 'string', defaultVal: '-' },
    { prop: 'style', desc: '自定义样式（透传到根 div）', type: 'string | object', defaultVal: '-' },
    { prop: 'default', desc: '子元素 slot', type: 'slot', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { Cursor } from 'animal-island-vue';
<\/script>

<template>
    <!-- 默认 forceAll=true：全覆盖所有后代 -->
    <Cursor>
        <div>鼠标移入此区域将显示自定义光标</div>
    </Cursor>

    <!-- forceAll=false：保留交互语义（a/button 仍是 pointer，input 仍是 text） -->
    <Cursor :force-all="false">
        <a href="#">链接保留 pointer</a>
        <button>按钮保留 pointer</button>
        <input type="text" placeholder="输入框保留 text" />
    </Cursor>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Cursor <span :style="tagStyle">光标</span>
        </div>
        <p :style="labelStyle">
            Cursor 组件通过 CSS cursor 属性将子元素的鼠标光标替换为自定义手指图标。
            默认 <code>forceAll=true</code> 全覆盖所有后代；设置 <code>forceAll=false</code> 可保留 a/button 的 pointer 和输入框的 text 语义。
        </p>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">forceAll=true（默认）：全覆盖</div>
            <Cursor>
                <div :style="{ ...demoDashedBoxStyle, padding: '24px', justifyContent: 'center' }">
                    鼠标移入此区域将显示自定义光标
                </div>
            </Cursor>
            <div :style="labelStyle">forceAll=false：保留原生光标语义</div>
            <Cursor :force-all="false">
                <div
                    :style="{
                        ...demoDashedBoxStyle,
                        padding: '24px',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                    }"
                >
                    <div>鼠标移入此区域，交互元素恢复语义光标</div>
                    <div :style="{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }">
                        <a href="#" @click.prevent>链接 (pointer)</a>
                        <button type="button">按钮 (pointer)</button>
                        <button type="button" disabled>禁用 (not-allowed)</button>
                        <input type="text" placeholder="输入框 (text)" :style="{ padding: '4px 8px' }" />
                        <span :style="{ userSelect: 'text' }">可选中文本 (默认)</span>
                    </div>
                </div>
            </Cursor>
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="CURSOR_API" />
    </div>
</template>
