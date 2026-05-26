<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import {
    WeddingInvitation,
    WeddingInvitationExportButton,
    Input,
    Switch,
} from '../../src';
import type { WeddingInvitationExpose } from '../../src';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const groomName = ref('小狸');
const brideName = ref('小兔');
const date = ref('2026.06.15');
const weekday = ref('星期六');
const time = ref('10:00 AM');
const venue = ref('彩虹岛 · 樱花广场');
const address = ref('动物之森 · 无人岛 · K.K. 演奏台前');
const title = ref('Wedding Invitation');
const message = ref(
    '哎呀，恭喜恭喜！我们要在小岛上举办婚礼啦~ 诚挚邀请您一同前来见证这个被花瓣和音符包围的日子！',
);
const showLotteryNumber = ref(true);
const lotteryNumber = ref('0001');
const lotteryLabel = ref('LUCKY NUMBER');
const lotteryHint = ref('凭此号码参与现场抽奖 · Keep this stub for the lucky draw');

const cardRef = useTemplateRef<WeddingInvitationExpose>('cardRef');

const WEDDING_API: ApiRow[] = [
    { prop: 'brideName', desc: '新娘名字', type: 'string', defaultVal: '小兔' },
    { prop: 'groomName', desc: '新郎名字', type: 'string', defaultVal: '小狸' },
    { prop: 'date', desc: '婚礼日期', type: 'string', defaultVal: '2026.06.15' },
    { prop: 'weekday', desc: '星期', type: 'string', defaultVal: '星期六' },
    { prop: 'time', desc: '时间', type: 'string', defaultVal: '10:00 AM' },
    { prop: 'venue', desc: '婚礼地点', type: 'string', defaultVal: '彩虹岛 · 樱花广场' },
    { prop: 'address', desc: '详细地址', type: 'string', defaultVal: '-' },
    { prop: 'title', desc: '英文主标题', type: 'string', defaultVal: 'Wedding Invitation' },
    { prop: 'subtitle', desc: '中文副标题（默认渲染 wedding.PNG 标题图，可通过 #subtitle 插槽自定义）', type: 'string', defaultVal: '<img src={wedding.PNG} />' },
    { prop: 'message', desc: '邀请正文（也可通过 #message 插槽传入富内容）', type: 'string', defaultVal: '-' },
    { prop: 'showLotteryNumber', desc: '是否显示底部抽奖号码区', type: 'boolean', defaultVal: 'true' },
    { prop: 'lotteryNumber', desc: '抽奖号码', type: 'string', defaultVal: '0001' },
    { prop: 'lotteryLabel', desc: '抽奖区标题', type: 'string', defaultVal: 'LUCKY NUMBER' },
    { prop: 'lotteryHint', desc: '抽奖区底部说明', type: 'string', defaultVal: '凭此号码参与现场抽奖…' },
    { prop: 'class', desc: '自定义类名', type: 'string', defaultVal: '-' },
    { prop: 'style', desc: '自定义样式', type: 'CSSProperties | string', defaultVal: '-' },
];

const WEDDING_REF_API: ApiRow[] = [
    { prop: 'exportAsImage', desc: '导出为 PNG 并触发下载', type: '(filename?: string) => Promise<void>', defaultVal: '-' },
    { prop: 'getElement', desc: '获取请柬根 DOM', type: '() => HTMLDivElement | null', defaultVal: '-' },
];

const EXPORT_BTN_API: ApiRow[] = [
    { prop: 'target', desc: '关联的 WeddingInvitation 实例（template ref）', type: 'WeddingInvitationExpose | null', defaultVal: '-' },
    { prop: 'filename', desc: '文件名（不含扩展名）', type: 'string', defaultVal: 'wedding-invitation' },
    { prop: 'class', desc: '自定义类名', type: 'string', defaultVal: '-' },
    { prop: 'style', desc: '自定义样式', type: 'CSSProperties | string', defaultVal: '-' },
];

const code = `<script setup lang="ts">
import { useTemplateRef } from 'vue';
import {
    WeddingInvitation,
    WeddingInvitationExportButton,
} from 'animal-island-vue';
import type { WeddingInvitationExpose } from 'animal-island-vue';

const cardRef = useTemplateRef<WeddingInvitationExpose>('cardRef');
<\/script>

<template>
    <div style="display: flex; gap: 45px; align-items: flex-start;">
        <WeddingInvitation
            ref="cardRef"
            bride-name="小兔"
            groom-name="小狸"
            date="2026.06.15"
            venue="彩虹岛 · 樱花广场"
        />
        <WeddingInvitationExportButton
            :target="cardRef"
            filename="我们的请柬"
        />
    </div>
</template>

<!-- 也可直接通过 ref 调用 -->
<!-- cardRef.value?.exportAsImage('wedding') -->`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            WeddingInvitation <span :style="tagStyle">婚礼请柬</span>
        </div>
        <div :style="labelStyle">
            动森风格婚礼请柬，定位为「设计 → 导出图片 → 分享 / 打印」。组件本身只渲染卡面，导出按钮通过 ref 在外部触发。
        </div>

        <div
            :style="{
                ...demoBodyStyle,
                padding: '32px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: '45px',
                flexWrap: 'wrap',
            }"
        >
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                <WeddingInvitation
                    ref="cardRef"
                    :bride-name="brideName"
                    :groom-name="groomName"
                    :date="date"
                    :weekday="weekday"
                    :time="time"
                    :venue="venue"
                    :address="address"
                    :title="title"
                    :message="message"
                    :show-lottery-number="showLotteryNumber"
                    :lottery-number="lotteryNumber"
                    :lottery-label="lotteryLabel"
                    :lottery-hint="lotteryHint"
                />
            </div>

            <div
                style="
                    flex: 0 0 405px;
                    max-width: 445px;
                    min-width: 365px;
                    padding: 20px;
                    border-radius: 20px;
                    background: #F8F4E8;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                "
            >
                <div style="font-size: 14px; font-weight: 700; color: #725d42;">
                    编辑请柬
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div class="field">
                        <span class="field__label">新娘</span>
                        <Input v-model="brideName" />
                    </div>
                    <div class="field">
                        <span class="field__label">新郎</span>
                        <Input v-model="groomName" />
                    </div>
                </div>

                <div class="field">
                    <span class="field__label">主标题</span>
                    <Input v-model="title" />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                    <div class="field">
                        <span class="field__label">日期</span>
                        <Input v-model="date" />
                    </div>
                    <div class="field">
                        <span class="field__label">星期</span>
                        <Input v-model="weekday" />
                    </div>
                    <div class="field">
                        <span class="field__label">时间</span>
                        <Input v-model="time" />
                    </div>
                </div>

                <div class="field">
                    <span class="field__label">地点</span>
                    <Input v-model="venue" />
                </div>
                <div class="field">
                    <span class="field__label">详细地址</span>
                    <Input v-model="address" />
                </div>

                <div class="field">
                    <span class="field__label">邀请正文</span>
                    <textarea
                        v-model="message"
                        rows="3"
                        style="
                            width: 100%;
                            padding: 8px 10px;
                            border-radius: 8px;
                            border: 2px solid #e9d6a8;
                            background: #fff;
                            font-size: 13px;
                            color: #5b4628;
                            resize: vertical;
                            font-family: inherit;
                            outline: none;
                            box-sizing: border-box;
                        "
                    />
                </div>

                <div
                    style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 4px 0;
                    "
                >
                    <span style="font-size: 12px; color: #725d42; font-weight: 600;">
                        显示抽奖券
                    </span>
                    <Switch v-model="showLotteryNumber" />
                </div>

                <template v-if="showLotteryNumber">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div class="field">
                            <span class="field__label">抽奖号码</span>
                            <Input v-model="lotteryNumber" />
                        </div>
                        <div class="field">
                            <span class="field__label">抽奖区标题</span>
                            <Input v-model="lotteryLabel" />
                        </div>
                    </div>
                    <div class="field">
                        <span class="field__label">抽奖区说明</span>
                        <Input v-model="lotteryHint" />
                    </div>
                </template>

                <div style="margin-top: 4px; display: flex; justify-content: center;">
                    <WeddingInvitationExportButton
                        :target="cardRef"
                        :filename="`${brideName}-${groomName}-请柬`"
                    />
                </div>
            </div>
        </div>

        <CodeBlock :code="code" />

        <ApiTable :rows="WEDDING_API" />

        <div :style="{ ...labelStyle, marginTop: '12px' }">WeddingInvitation Ref 方法</div>
        <ApiTable :rows="WEDDING_REF_API" />

        <div :style="{ ...labelStyle, marginTop: '12px' }">WeddingInvitationExportButton Props</div>
        <ApiTable :rows="EXPORT_BTN_API" />
    </div>
</template>

<style scoped>
.field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.field__label {
    font-size: 12px;
    color: #725d42;
    font-weight: 600;
}
</style>
