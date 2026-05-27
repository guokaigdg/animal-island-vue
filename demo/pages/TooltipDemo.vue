<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { Tooltip, Button } from '../../src';
import {
    sectionStyle,
    sectionTitleStyle,
    tagStyle,
    labelStyle,
    demoBoxStyle,
    ApiTable,
    CodeBlock,
} from '../tools';
import type { ApiRow } from '../tools';

const TOOLTIP_API: ApiRow[] = [
    { prop: 'title', desc: '提示文本（也可使用 #title 插槽）', type: 'string', defaultVal: '-' },
    { prop: 'placement', desc: '位置', type: "12 个方向，详见类型", defaultVal: "'top'" },
    { prop: 'trigger', desc: '触发方式', type: "'hover' | 'focus' | 'click'", defaultVal: "'hover'" },
    { prop: 'variant', desc: '视觉风格', type: "'default' | 'island'", defaultVal: "'default'" },
    { prop: 'bordered', desc: '是否显示边框', type: 'boolean', defaultVal: 'true' },
    { prop: '#default', desc: '触发元素插槽', type: 'slot', defaultVal: '-' },
    { prop: '#title', desc: '提示内容自定义插槽（覆盖 title prop）', type: 'slot', defaultVal: '-' },
];

const leftColStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'flex-start',
};
const rightColStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'flex-end',
};
const placementRowStyle: CSSProperties = { display: 'flex', gap: '12px' };
const placementBoxStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
};
const centerMarkStyle: CSSProperties = {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    background: '#f0e8d8',
    color: '#a0936e',
    fontSize: '12px',
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.3,
    flexShrink: 0,
};

const code = `<script setup lang="ts">
import { Tooltip, Button } from 'animal-island-vue';
<\/script>

<template>
    <!-- 基础用法 -->
    <Tooltip title="提示文字">
        <Button>Hover 我</Button>
    </Tooltip>

    <!-- 动森 island 风格 -->
    <Tooltip variant="island" bordered title="有边框有机气泡">
        <Button>Island</Button>
    </Tooltip>

    <!-- 12 个方向 -->
    <Tooltip title="我在上方" placement="top">
        <Button>Top</Button>
    </Tooltip>

    <!-- Click 触发 -->
    <Tooltip title="点击触发" trigger="click">
        <Button>Click</Button>
    </Tooltip>

    <!-- Focus 触发 -->
    <Tooltip title="聚焦显示" trigger="focus">
        <input placeholder="点击聚焦" />
    </Tooltip>

    <!-- 多行内容（具名插槽 + 换行符） -->
    <Tooltip title="第一行\\n第二行\\n第三行 🍃">
        <Button>多行</Button>
    </Tooltip>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Tooltip <span :style="tagStyle">气泡提示</span>
        </div>

        <div :style="labelStyle">基础用法 — hover 触发</div>
        <div :style="demoBoxStyle">
            <div :style="{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }">
                <Tooltip title="提示文字">
                    <Button type="primary" size="small">Hover 我</Button>
                </Tooltip>
            </div>
        </div>

        <div :style="labelStyle">风格 — island 动森不规则气泡</div>
        <div :style="{ ...demoBoxStyle, overflow: 'visible' }">
            <div :style="{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }">
                <Tooltip title="标准矩形气泡" placement="top">
                    <Button size="small">default</Button>
                </Tooltip>
                <Tooltip title="无边框矩形" placement="top" :bordered="false">
                    <Button size="small">default 无边框</Button>
                </Tooltip>
                <Tooltip variant="island" :bordered="true" placement="top">
                    <template #title>
                        钓到<span :style="{ color: '#d4834a' }">石头</span>了！<br />
                        竟然连这种都能钓起来…
                    </template>
                    <Button size="small">island 有边框</Button>
                </Tooltip>
                <Tooltip variant="island" :bordered="false" placement="top">
                    <template #title>
                        无边框有机气泡<br />
                        圆点指示方向
                    </template>
                    <Button size="small">island 无边框</Button>
                </Tooltip>
            </div>
        </div>

        <div :style="labelStyle">12 个方向</div>
        <div :style="{ ...demoBoxStyle, overflow: 'visible' }">
            <div :style="placementBoxStyle">
                <div :style="placementRowStyle">
                    <Tooltip title="top-start" placement="top-start">
                        <Button size="small">top-start</Button>
                    </Tooltip>
                    <Tooltip title="top" placement="top">
                        <Button size="small">top</Button>
                    </Tooltip>
                    <Tooltip title="top-end" placement="top-end">
                        <Button size="small">top-end</Button>
                    </Tooltip>
                </div>

                <div :style="{ display: 'flex', alignItems: 'center', gap: '48px' }">
                    <div :style="leftColStyle">
                        <Tooltip placement="left-start">
                            <template #title>left-start<br />箭头在右侧<br />指向触发按钮</template>
                            <Button size="small">left-start</Button>
                        </Tooltip>
                        <Tooltip placement="left">
                            <template #title>left<br />箭头在右侧<br />指向触发按钮</template>
                            <Button size="small">left</Button>
                        </Tooltip>
                        <Tooltip placement="left-end">
                            <template #title>left-end<br />箭头在右侧<br />指向触发按钮</template>
                            <Button size="small">left-end</Button>
                        </Tooltip>
                    </div>

                    <div :style="centerMarkStyle">
                        12<br />placements
                    </div>

                    <div :style="rightColStyle">
                        <Tooltip placement="right-start">
                            <template #title>right-start<br />箭头在左侧<br />指向触发按钮</template>
                            <Button size="small">right-start</Button>
                        </Tooltip>
                        <Tooltip placement="right">
                            <template #title>right<br />箭头在左侧<br />指向触发按钮</template>
                            <Button size="small">right</Button>
                        </Tooltip>
                        <Tooltip placement="right-end">
                            <template #title>right-end<br />箭头在左侧<br />指向触发按钮</template>
                            <Button size="small">right-end</Button>
                        </Tooltip>
                    </div>
                </div>

                <div :style="placementRowStyle">
                    <Tooltip title="bottom-start" placement="bottom-start">
                        <Button size="small">bottom-start</Button>
                    </Tooltip>
                    <Tooltip title="bottom" placement="bottom">
                        <Button size="small">bottom</Button>
                    </Tooltip>
                    <Tooltip title="bottom-end" placement="bottom-end">
                        <Button size="small">bottom-end</Button>
                    </Tooltip>
                </div>
            </div>
        </div>

        <div :style="labelStyle">触发方式 — click</div>
        <div :style="demoBoxStyle">
            <Tooltip title="点击触发，再点关闭" trigger="click" placement="bottom">
                <Button size="small">Click 触发</Button>
            </Tooltip>
        </div>

        <div :style="labelStyle">触发方式 — focus</div>
        <div :style="demoBoxStyle">
            <Tooltip title="聚焦时显示" trigger="focus" placement="right">
                <input
                    type="text"
                    placeholder="点击输入框聚焦"
                    :style="{
                        padding: '8px 16px',
                        borderRadius: '50px',
                        border: '2px solid #c4b89e',
                        background: 'rgb(247, 243, 223)',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        color: '#725d42',
                        outline: 'none',
                    }"
                />
            </Tooltip>
        </div>

        <div :style="labelStyle">多行内容</div>
        <div :style="demoBoxStyle">
            <div :style="{ display: 'flex', gap: '16px', flexWrap: 'wrap' }">
                <Tooltip placement="top">
                    <template #title>
                        第一行文字<br />
                        第二行文字<br />
                        第三行文字 🍃
                    </template>
                    <Button size="small">多行 slot</Button>
                </Tooltip>

                <Tooltip title="第一行\n第二行\n第三行 🌿" placement="top">
                    <Button size="small">换行符 \n</Button>
                </Tooltip>

                <Tooltip
                    title="这是一段比较长的提示文字，用来测试 Tooltip 的自动换行效果。当文字超过最大宽度时会自动换行。"
                    placement="top"
                >
                    <Button size="small">自动换行长文本</Button>
                </Tooltip>
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="TOOLTIP_API" />
    </div>
</template>
