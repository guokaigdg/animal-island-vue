<script setup lang="ts">
import { Collapse } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const COLLAPSE_API: ApiRow[] = [
    { prop: 'question', desc: '问题标题（slot 或 prop）', type: 'string | slot', defaultVal: '-', required: true },
    { prop: 'default', desc: '答案内容（默认 slot）', type: 'slot', defaultVal: '-', required: true },
    { prop: 'defaultExpanded', desc: '是否默认展开', type: 'boolean', defaultVal: 'false' },
    { prop: 'disabled', desc: '是否禁用', type: 'boolean', defaultVal: 'false' },
];

const code = `<script setup lang="ts">
import { Collapse } from 'animal-island-vue';
<\/script>

<template>
    <Collapse question="问题">
        <p>回答内容</p>
    </Collapse>
    <Collapse question="默认展开" default-expanded>
        <p>答案</p>
    </Collapse>
    <Collapse question="禁用" disabled>
        <p>答案</p>
    </Collapse>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Collapse <span :style="tagStyle">FAQ</span>
        </div>
        <div :style="demoBodyStyle">
            <div :style="labelStyle">基础用法</div>
            <div :style="{ maxWidth: '720px' }">
                <Collapse question="1個島嶼可以登錄多少名用戶?">
                    <p>1座島嶼最多可以容納8位居民（用戶）。</p>
                </Collapse>
                <Collapse question="可以多少人一起玩?">
                    <p>同住1個島的居民可以最多4人一起遊玩。透過通訊最多8人一起遊玩。</p>
                </Collapse>
            </div>
            <div :style="labelStyle">defaultExpanded 默认展开</div>
            <div :style="{ maxWidth: '720px' }">
                <Collapse question="这个问题默认展开" default-expanded>
                    <p>答案已经展示出来了！可以点击收起。</p>
                </Collapse>
            </div>
            <div :style="labelStyle">disabled 禁用状态</div>
            <div :style="{ maxWidth: '720px' }">
                <Collapse question="这个问题已被禁用（无法展开）" disabled>
                    <p>这段文字不应该被看到。</p>
                </Collapse>
            </div>
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="COLLAPSE_API" />
    </div>
</template>
