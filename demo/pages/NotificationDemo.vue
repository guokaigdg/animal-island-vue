<script setup lang="ts">
import { Notification, NotificationContainer, Button } from '../../src';
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

const NOTIFICATION_API: ApiRow[] = [
    { prop: 'message', desc: '标题', type: 'string', defaultVal: '-', required: true },
    { prop: 'description', desc: '描述', type: 'string', defaultVal: '-' },
    {
        prop: 'type',
        desc: '类型（也可直接用对应方法）',
        type: `'success' | 'info' | 'warning' | 'error'`,
        defaultVal: "'info'",
    },
    {
        prop: 'position',
        desc: '位置',
        type: `'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'`,
        defaultVal: "'top'",
    },
    { prop: 'duration', desc: '自动关闭时长（秒），0 = 不自动关闭', type: 'number', defaultVal: '4.5' },
    { prop: 'key', desc: '唯一标识，相同 key 会更新已有通知', type: 'string', defaultVal: '-' },
    { prop: 'onClose', desc: '关闭回调', type: '() => void', defaultVal: '-' },
    { prop: 'onClick', desc: '点击回调', type: '() => void', defaultVal: '-' },
    { prop: 'className', desc: '自定义类名', type: 'string', defaultVal: '-' },
];

const rowStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'center' };

const code = `<script setup lang="ts">
import { Notification, NotificationContainer } from 'animal-island-vue';

// 必须渲染 NotificationContainer，否则通知不会显示
// 4 种类型
Notification.success('成功');
Notification.info('信息');
Notification.warning('警告');
Notification.error('错误');

// 字符串配置
Notification('纯字符串 message');

// 对象配置 + 描述
Notification.open({ message: '标题', description: '描述文字' });

// 不同位置
Notification.info({ message: '右上', position: 'topRight' });

// 不自动关闭
Notification.warning({ message: '常驻', duration: 0 });

// 销毁全部
Notification.destroy();
<\/script>

<template>
    <NotificationContainer />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Notification <span :style="tagStyle">通知提醒</span>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">4 种类型</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button type="primary" @click="Notification.success('操作成功！')">Success</Button>
                    <Button @click="Notification.info('这是一条信息提醒')">Info</Button>
                    <Button @click="Notification.warning('请注意风险')">Warning</Button>
                    <Button danger @click="Notification.error('操作失败，请重试')">Error</Button>
                </div>
            </div>

            <div :style="labelStyle">字符串配置（仅 message）</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button @click="Notification('直接调用：纯字符串')">字符串通知</Button>
                    <Button @click="Notification.open('open 方法：纯字符串')">open</Button>
                </div>
            </div>

            <div :style="labelStyle">对象配置 + description</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button
                        type="primary"
                        @click="Notification.success({ message: '钓到鱼了！', description: '这是一条鲈鱼，可以卖 300 铃钱。' })"
                    >
                        带描述
                    </Button>
                    <Button
                        @click="Notification.info({ message: '新邮件', description: '妈妈寄来了包裹，请到邮局领取。' })"
                    >
                        带描述
                    </Button>
                </div>
            </div>

            <div :style="labelStyle">position 6 个位置</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button size="small" @click="Notification.info({ message: 'top', position: 'top' })">top</Button>
                    <Button size="small" @click="Notification.info({ message: 'topLeft', position: 'topLeft' })">topLeft</Button>
                    <Button size="small" @click="Notification.info({ message: 'topRight', position: 'topRight' })">topRight</Button>
                    <Button size="small" @click="Notification.info({ message: 'bottom', position: 'bottom' })">bottom</Button>
                    <Button size="small" @click="Notification.info({ message: 'bottomLeft', position: 'bottomLeft' })">bottomLeft</Button>
                    <Button size="small" @click="Notification.info({ message: 'bottomRight', position: 'bottomRight' })">bottomRight</Button>
                </div>
            </div>

            <div :style="labelStyle">duration 自定义时长（0 = 不自动关闭）</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button @click="Notification.warning({ message: '2 秒后关闭', duration: 2 })">2s</Button>
                    <Button @click="Notification.warning({ message: '不自动关闭，需手动关闭', duration: 0 })">duration=0</Button>
                </div>
            </div>

            <div :style="labelStyle">destroy all 销毁全部</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Button danger @click="Notification.destroy()">销毁全部通知</Button>
                </div>
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="NOTIFICATION_API" />

        <!-- 必须渲染 NotificationContainer，通知才会显示 -->
        <NotificationContainer />
    </div>
</template>
