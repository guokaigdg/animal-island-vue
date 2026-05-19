<script setup lang="ts">
import { CodeBlock as CodeBlockBase } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBoxStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const CODEBLOCK_API: ApiRow[] = [
    { prop: 'code', desc: '代码字符串', type: 'string', defaultVal: '-', required: true },
];

const sample1 = `<script setup lang="ts">
import { Button } from 'animal-island-vue';
<\/script>

<template>
    <Button type="primary">按钮</Button>
</template>`;

const sample2 = `<script setup lang="ts">
import { CodeBlock } from 'animal-island-vue';
<\/script>

<template>
    <CodeBlock
        :code="codeString"
        :style="{ borderRadius: '5px', backgroundColor: '#242c46ff' }"
    />
</template>`;

const code = `<script setup lang="ts">
import { CodeBlock } from 'animal-island-vue';
<\/script>

<template>
    <!-- 基础用法 -->
    <CodeBlock :code="codeString" />
    <!-- 自定义样式 -->
    <CodeBlock
        :code="codeString"
        :style="{ borderRadius: '5px', backgroundColor: '#242c46ff' }"
    />
</template>`;

const demoBox = demoBoxStyle;

</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            CodeBlock <span :style="tagStyle">代码高亮</span>
        </div>
        <div :style="labelStyle">基础用法</div>
        <div :style="demoBox">
            <CodeBlockBase :code="sample1" />
        </div>

        <div :style="labelStyle">自定义样式</div>
        <div :style="demoBox">
            <CodeBlockBase :code="sample2" :style="{ borderRadius: '5px', backgroundColor: '#242c46ff' }" />
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="CODEBLOCK_API" />
    </div>
</template>
