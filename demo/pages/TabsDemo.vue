<script setup lang="ts">
import { ref } from 'vue';
import { Tabs } from '../../src';
import type { TabItem } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBoxStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const TABS_API: ApiRow[] = [
    { prop: 'items', desc: '标签页配置列表', type: 'TabItem[]', defaultVal: '-', required: true },
    { prop: 'modelValue', desc: '当前激活标签 (v-model)', type: 'string', defaultVal: '第一个标签' },
    { prop: 'shadow', desc: '是否显示选中状态阴影', type: 'boolean', defaultVal: 'true' },
    { prop: 'leafAnimation', desc: '是否启用叶子动画', type: 'boolean', defaultVal: 'true' },
    { prop: '@change', desc: '标签切换回调', type: '(key: string) => void', defaultVal: '-' },
    { prop: 'slot[item.key]', desc: '通过同名 slot 提供每个 tab 内容', type: 'slot', defaultVal: '-' },
];

const itemsBasic: TabItem[] = [
    { key: 'a', label: '鱼类' },
    { key: 'b', label: '昆虫' },
];
const itemsThree: TabItem[] = [
    { key: 'a', label: '鱼类' },
    { key: 'b', label: '昆虫' },
    { key: 'c', label: '海洋生物' },
];
const items: TabItem[] = [
    { key: 'tab1', label: '岛屿概况' },
    { key: 'tab2', label: '商店' },
    { key: 'tab3', label: '服务台' },
];

const activeKey = ref('tab1');
const tab1 = ref('a');
const tab2 = ref('a');
const tab3 = ref('a');
const tab4 = ref('a');
const tab5 = ref('a');

const demoBox = demoBoxStyle;

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Tabs } from 'animal-island-vue';
import type { TabItem } from 'animal-island-vue';

const items: TabItem[] = [
    { key: 'tab1', label: '标签一' },
    { key: 'tab2', label: '标签二' },
];
const active = ref('tab1');
<\/script>

<template>
    <Tabs v-model="active" :items="items">
        <template #tab1><p>内容一</p></template>
        <template #tab2><p>内容二</p></template>
    </Tabs>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">Tabs <span :style="tagStyle">基础用法</span></div>

        <div :style="labelStyle">shadow 阴影控制</div>
        <div :style="{ display: 'flex', gap: '16px', flexWrap: 'wrap' }">
            <div :style="demoBox">
                <Tabs v-model="tab1" :items="itemsBasic">
                    <template #a><p>鲈鱼、鲷鱼...</p></template>
                    <template #b><p>蝴蝶、瓢虫...</p></template>
                </Tabs>
            </div>
            <div :style="demoBox">
                <Tabs v-model="tab2" :items="itemsBasic" :shadow="false">
                    <template #a><p>鲈鱼、鲷鱼...</p></template>
                    <template #b><p>蝴蝶、瓢虫...</p></template>
                </Tabs>
            </div>
        </div>

        <div :style="labelStyle">非受控模式（默认第一个）</div>
        <div :style="demoBox">
            <Tabs v-model="tab3" :items="itemsThree">
                <template #a><p>鲈鱼、鲷鱼、河童...</p></template>
                <template #b><p>蝴蝶、瓢虫、蜻蜓...</p></template>
                <template #c><p>海星、珊瑚、小丑鱼...</p></template>
            </Tabs>
        </div>

        <div :style="labelStyle">受控模式</div>
        <div :style="demoBox">
            <Tabs v-model="activeKey" :items="items">
                <template #tab1>
                    <p :style="{ marginBottom: '12px' }">这里是一座无人岛，环境优美，气候宜人。</p>
                    <p>可以钓鱼、捉虫、种植各种植物。</p>
                </template>
                <template #tab2>
                    <p :style="{ marginBottom: '12px' }">狸然超市营业中！</p>
                    <p>各种商品应有尽有，价格实惠。</p>
                </template>
                <template #tab3>
                    <p :style="{ marginBottom: '12px' }">欢迎来到服务台！</p>
                    <p>可以办理各种服务业务。</p>
                </template>
            </Tabs>
        </div>
        <div :style="{ marginTop: '16px', fontSize: '13px', color: '#a08060' }">
            当前选中:
            <span :style="{ color: '#19c8b9', fontWeight: 600 }">{{ items.find(i => i.key === activeKey)?.label }}</span>
        </div>

        <div :style="labelStyle">leafAnimation 叶子动画控制</div>
        <div :style="{ display: 'flex', gap: '16px', flexWrap: 'wrap' }">
            <div :style="demoBox">
                <Tabs v-model="tab4" :items="itemsBasic" :leaf-animation="true">
                    <template #a><p>鲈鱼、鲷鱼...</p></template>
                    <template #b><p>蝴蝶、瓢虫...</p></template>
                </Tabs>
                <div :style="{ fontSize: '12px', color: '#a0936e', marginTop: '8px' }">leafAnimation=true (默认)</div>
            </div>
            <div :style="demoBox">
                <Tabs v-model="tab5" :items="itemsBasic" :leaf-animation="false">
                    <template #a><p>鲈鱼、鲷鱼...</p></template>
                    <template #b><p>蝴蝶、瓢虫...</p></template>
                </Tabs>
                <div :style="{ fontSize: '12px', color: '#a0936e', marginTop: '8px' }">leafAnimation=false</div>
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="TABS_API" />
    </div>
</template>
