<script setup lang="ts">
import { ref } from 'vue';
import { Button, Modal } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const MODAL_API: ApiRow[] = [
    { prop: 'open', desc: '是否可见', type: 'boolean', defaultVal: '-', required: true },
    { prop: 'title', desc: '标题', type: 'string', defaultVal: '-' },
    { prop: 'width', desc: '宽度', type: 'number | string', defaultVal: '520' },
    { prop: 'maskClosable', desc: '点击遮罩关闭', type: 'boolean', defaultVal: 'true' },
    { prop: 'showFooter', desc: '是否显示底部按钮', type: 'boolean', defaultVal: 'true' },
    { prop: 'typewriter', desc: '是否启用打字机效果', type: 'boolean', defaultVal: 'true' },
    { prop: 'typeSpeed', desc: '打字机每字间隔(ms)', type: 'number', defaultVal: '80' },
    { prop: 'onClose / @close', desc: '关闭回调', type: '() => void', defaultVal: '-' },
    { prop: 'onOk / @ok', desc: '确认回调', type: '() => void', defaultVal: '-' },
    { prop: 'default', desc: '内容（默认 slot）', type: 'slot', defaultVal: '-' },
    { prop: 'footer', desc: '自定义底部 slot', type: 'slot', defaultVal: '-' },
];

const modalOpen = ref(false);
const titleModalOpen = ref(false);
const customFooterOpen = ref(false);
const noTypewriterOpen = ref(false);

const rowStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' as const };

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Button, Modal } from 'animal-island-vue';

const open = ref(false);
<\/script>

<template>
    <Button type="primary" @click="open = true">打开 Modal</Button>
    <Modal v-model:open="open" @ok="open = false">Modal 内容</Modal>

    <!-- 带标题 -->
    <Modal v-model:open="open" title="标题">内容</Modal>

    <!-- 自定义 footer -->
    <Modal v-model:open="open" title="确认">
        内容
        <template #footer>
            <Button @click="open = false">再想想</Button>
            <Button type="primary" danger @click="open = false">确认</Button>
        </template>
    </Modal>

    <!-- 无 footer -->
    <Modal v-model:open="open" :show-footer="false">无底部按钮</Modal>

    <!-- 关闭打字机 -->
    <Modal v-model:open="open" :typewriter="false">直接显示全部内容</Modal>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Modal <span :style="tagStyle">弹窗</span>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">基础弹窗</div>
            <div :style="rowStyle">
                <Button type="primary" @click="modalOpen = true">基础 Modal</Button>
                <Button @click="titleModalOpen = true">带标题 Modal</Button>
                <Button type="dashed" @click="customFooterOpen = true">自定义 Footer</Button>
            </div>
            <div :style="labelStyle">关闭打字机效果</div>
            <div :style="rowStyle">
                <Button type="primary" @click="noTypewriterOpen = true">关闭打字机效果</Button>
            </div>
        </div>

        <Modal v-model:open="modalOpen" @ok="modalOpen = false">
            <div :style="{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }">
                <span>钓到<span :style="{ color: '#FD9303' }">石头</span>了!</span>
                <span>竟然连这种都能钓起来...</span>
            </div>
        </Modal>

        <Modal v-model:open="titleModalOpen" title="博物馆捐赠" @ok="titleModalOpen = false">
            是否愿意将这条鱼捐赠给博物馆呢？傅达会好好照顾它的！这可是博物馆的新展品哦~
        </Modal>

        <Modal v-model:open="customFooterOpen" title="确认操作">
            确定要让这位居民搬走吗？这个操作不可撤销。
            <template #footer>
                <Button @click="customFooterOpen = false">再想想</Button>
                <Button type="primary" danger @click="customFooterOpen = false">确认搬家</Button>
            </template>
        </Modal>

        <Modal v-model:open="noTypewriterOpen" title="天气预报" :typewriter="false" @ok="noTypewriterOpen = false">
            明天天气晴朗，气温 20-28°C，适合外出活动！
        </Modal>

        <CodeBlock :code="code" />
        <ApiTable :rows="MODAL_API" />
    </div>
</template>
