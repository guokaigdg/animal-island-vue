<script setup lang="ts">
import { ref } from 'vue';
import { Button, Typewriter } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, demoDashedBoxStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const TYPEWRITER_API: ApiRow[] = [
    { prop: 'default', desc: '需要逐字显示的内容（slot）', type: 'slot', defaultVal: '-' },
    { prop: 'speed', desc: '每字间隔 (ms)', type: 'number', defaultVal: '90' },
    { prop: 'trigger', desc: '值变化时重新播放', type: 'unknown', defaultVal: '-' },
    { prop: 'autoPlay', desc: '是否自动从头开始播放', type: 'boolean', defaultVal: 'true' },
    { prop: 'onDone / @done', desc: '播放完成回调', type: '() => void', defaultVal: '-' },
];

const replayKey = ref(0);

const rowStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' as const };

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Typewriter } from 'animal-island-vue';

const key = ref(0);
<\/script>

<template>
    <Typewriter :trigger="key">你好，欢迎来到动物岛！</Typewriter>

    <!-- 多行 / 富内容 -->
    <Typewriter :speed="40" :trigger="key">
        <div>第一行</div>
        <div :style="{ color: 'orange' }">第二行</div>
    </Typewriter>

    <button @click="key++">重新播放</button>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Typewriter <span :style="tagStyle">打字机</span>
        </div>

        <div :style="demoBodyStyle">
            <div>
                <div :style="labelStyle">基础用法</div>
                <div :style="{ ...demoDashedBoxStyle, marginBottom: '20px' }">
                    <Typewriter :trigger="replayKey">你好，欢迎来到动物岛！今天的天气真不错呢～</Typewriter>
                </div>
            </div>

            <div>
                <div :style="labelStyle">保留多行与富内容 (速度 40ms)</div>
                <div :style="{ ...demoDashedBoxStyle, flexDirection: 'column', alignItems: 'flex-start', marginBottom: '20px', gap: '8px' }">
                    <Typewriter :speed="40" :trigger="replayKey">
                        <div>第一行：钓到石头了！</div>
                        <div>第二行：竟然连这种都能钓起来...</div>
                        <div :style="{ color: '#FD9303', fontWeight: 700 }">第三行：继续加油吧！</div>
                    </Typewriter>
                </div>
            </div>

            <div :style="rowStyle">
                <Button type="primary" @click="replayKey++">重新播放</Button>
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="TYPEWRITER_API" />
    </div>
</template>
