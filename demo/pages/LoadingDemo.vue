<script setup lang="ts">
import { ref } from 'vue';
import { Loading, Button } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const LOADING_API: ApiRow[] = [
    { prop: 'active', desc: '是否显示加载动画', type: 'boolean', defaultVal: 'true' },
];

const active = ref(true);

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Loading } from 'animal-island-vue';

const active = ref(true);
<\/script>

<template>
    <div :style="{ position: 'relative', height: '800px' }">
        <div :style="{ position: 'absolute', inset: 0 }">底层内容</div>
        <Loading :active="active" :style="{ position: 'absolute', inset: 0, height: '100%' }" />
        <button @click="active = !active">{{ active ? '关闭' : '开启' }} Loading</button>
    </div>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Loading <span :style="tagStyle">加载动画</span>
        </div>
        <div :style="labelStyle">
            动森风格小岛 Loading 动画组件，带有漂浮的小岛、摇曳的树叶和游动的鱼。关闭时会从中间圆形透明扩散，露出底层内容。
        </div>
        <div :style="{ marginBottom: '16px' }">
            <Button :type="active ? 'default' : 'primary'" @click="active = !active">
                {{ active ? '关闭 Loading' : '开启 Loading' }}
            </Button>
        </div>
        <div :style="{ ...demoBodyStyle, position: 'relative', height: '800px', padding: '0', overflow: 'hidden' }">
            <div
                :style="{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #ffd6a5 0%, #fdffb6 25%, #caffbf 50%, #9bf6ff 75%, #a0c4ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#333',
                }"
            >
                底层内容 · Underlying Content
            </div>
            <Loading :active="active" :style="{ height: '100%', position: 'absolute', inset: 0 }" />
        </div>
        <CodeBlock :code="code" />
        <ApiTable :rows="LOADING_API" />
    </div>
</template>
