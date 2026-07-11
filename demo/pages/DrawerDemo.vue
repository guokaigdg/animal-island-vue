<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, Button } from '../../src';
import {
    sectionStyle,
    sectionTitleStyle,
    tagStyle,
    labelStyle,
    demoBodyStyle,
    demoBoxStyle,
    ApiTable,
    CodeBlock,
} from '../tools';
import type { ApiRow } from '../tools';

const DRAWER_API: ApiRow[] = [
    { prop: 'open', desc: '是否可见', type: 'boolean', defaultVal: '-', required: true },
    { prop: 'title', desc: '标题', type: 'string', defaultVal: '-' },
    {
        prop: 'placement',
        desc: '弹出位置',
        type: `'left' | 'right' | 'top' | 'bottom'`,
        defaultVal: "'right'",
    },
    { prop: 'width', desc: '宽度（left / right 生效）', type: 'number | string', defaultVal: '378' },
    { prop: 'height', desc: '高度（top / bottom 生效）', type: 'number | string', defaultVal: '300' },
    { prop: 'maskClosable', desc: '点击遮罩关闭', type: 'boolean', defaultVal: 'true' },
    { prop: 'pushBackground', desc: '背景下沉景深效果', type: 'boolean', defaultVal: 'true' },
    { prop: 'footer', desc: '底部文本（也可用 #footer 插槽）', type: 'string', defaultVal: '-' },
    { prop: 'onClose / @close', desc: '关闭回调', type: '() => void', defaultVal: '-' },
    { prop: 'default', desc: '内容（默认插槽）', type: 'slot', defaultVal: '-' },
    { prop: '#footer', desc: '自定义底部插槽', type: 'slot', defaultVal: '-' },
];

const rightOpen = ref(false);
const leftOpen = ref(false);
const topOpen = ref(false);
const bottomOpen = ref(false);
const noTitleOpen = ref(false);
const footerOpen = ref(false);
const optionsOpen = ref(false);

const maskClosable = ref(true);
const pushBackground = ref(true);

const rowStyle = { display: 'flex', gap: '16px', flexWrap: 'wrap' as const, alignItems: 'center' };
const checkLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#8a7b66',
    cursor: 'pointer',
};

const code = `<script setup lang="ts">
import { ref } from 'vue';
import { Drawer, Button } from 'animal-island-vue';

const open = ref(false);
<\/script>

<template>
    <Button type="primary" @click="open = true">打开 Drawer</Button>

    <!-- 基础 + 标题 -->
    <Drawer :open="open" title="标题" @close="open = false">
        内容
    </Drawer>

    <!-- 四个方向 -->
    <Drawer :open="open" placement="left" @close="open = false" />
    <Drawer :open="open" placement="top" @close="open = false" />
    <Drawer :open="open" placement="bottom" @close="open = false" />

    <!-- 自定义 footer -->
    <Drawer :open="open" title="确认">
        内容
        <template #footer>
            <Button @click="open = false">取消</Button>
            <Button type="primary" @click="open = false">确认</Button>
        </template>
    </Drawer>

    <!-- 关闭遮罩点击 / 背景景深 -->
    <Drawer :open="open" :mask-closable="false" :push-background="false" @close="open = false" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Drawer <span :style="tagStyle">抽屉</span>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">placement 四个方向</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button type="primary" @click="rightOpen = true">Right</Button>
                    <Button type="primary" @click="leftOpen = true">Left</Button>
                    <Button type="primary" @click="topOpen = true">Top</Button>
                    <Button type="primary" @click="bottomOpen = true">Bottom</Button>
                </div>
            </div>

            <div :style="labelStyle">无标题 / 自定义 footer</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button @click="noTitleOpen = true">无标题</Button>
                    <Button type="dashed" @click="footerOpen = true">自定义 Footer</Button>
                </div>
            </div>

            <div :style="labelStyle">maskClosable / pushBackground 选项</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button type="primary" @click="optionsOpen = true">打开</Button>
                    <label :style="checkLabelStyle">
                        <input type="checkbox" v-model="maskClosable" /> maskClosable
                    </label>
                    <label :style="checkLabelStyle">
                        <input type="checkbox" v-model="pushBackground" /> pushBackground
                    </label>
                </div>
            </div>
        </div>

        <Drawer :open="rightOpen" title="右侧抽屉" @close="rightOpen = false">
            这是右侧抽屉的内容。可以放置表单、详情信息等。
        </Drawer>

        <Drawer :open="leftOpen" title="左侧抽屉" placement="left" @close="leftOpen = false">
            左侧抽屉的内容。
        </Drawer>

        <Drawer :open="topOpen" title="顶部抽屉" placement="top" @close="topOpen = false">
            顶部抽屉的内容。
        </Drawer>

        <Drawer :open="bottomOpen" title="底部抽屉" placement="bottom" @close="bottomOpen = false">
            底部抽屉的内容。
        </Drawer>

        <Drawer :open="noTitleOpen" @close="noTitleOpen = false">
            这个抽屉没有标题，仅展示内容区域。
        </Drawer>

        <Drawer :open="footerOpen" title="确认操作" @close="footerOpen = false">
            确定要执行这个操作吗？此操作不可撤销。
            <template #footer>
                <Button @click="footerOpen = false">取消</Button>
                <Button type="primary" @click="footerOpen = false">确认</Button>
            </template>
        </Drawer>

        <Drawer
            :open="optionsOpen"
            title="选项抽屉"
            :mask-closable="maskClosable"
            :push-background="pushBackground"
            @close="optionsOpen = false"
        >
            <p>当前 maskClosable：{{ maskClosable }}</p>
            <p>当前 pushBackground：{{ pushBackground }}</p>
            <p>切换上方选项后再次打开可观察效果。</p>
        </Drawer>

        <CodeBlock :code="code" />
        <ApiTable :rows="DRAWER_API" />
    </div>
</template>
