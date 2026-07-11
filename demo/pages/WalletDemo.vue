<script setup lang="ts">
import { Wallet } from '../../src';
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
import leafIcon from '../../src/assets/img/icons/icon-leaf.png';

const WALLET_API: ApiRow[] = [
    {
        prop: 'value',
        desc: '金额数值，number 按千分位格式化；string 原样展示',
        type: 'number | string',
        defaultVal: "'00,000'",
    },
    { prop: 'size', desc: '尺寸', type: `'small' | 'medium' | 'large'`, defaultVal: "'medium'" },
    { prop: 'icon', desc: '自定义货币图标', type: 'string', defaultVal: '钱袋图标' },
    { prop: 'thousandSeparator', desc: '千分位分隔符，传 "" 关闭', type: 'string', defaultVal: "','" },
];

const rowStyle = { display: 'flex', gap: '32px', flexWrap: 'wrap' as const, alignItems: 'flex-end' };

const code = `<script setup lang="ts">
import { Wallet } from 'animal-island-vue';
import leafIcon from './icon-leaf.png';
<\/script>

<template>
    <Wallet />
    <Wallet :value="12345" />
    <Wallet :value="999999" size="large" />
    <Wallet value="00,000" />
    <Wallet :value="999999" thousand-separator="" />
    <Wallet :value="999999" :icon="leafIcon" />
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Wallet <span :style="tagStyle">钱包</span>
        </div>

        <div :style="demoBodyStyle">
            <div :style="labelStyle">默认钱包（value 默认 00,000）</div>
            <div :style="demoBoxStyle">
                <Wallet />
            </div>

            <div :style="labelStyle">size 尺寸</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Wallet :value="12345" size="small" />
                    <Wallet :value="12345" size="medium" />
                    <Wallet :value="12345" size="large" />
                </div>
            </div>

            <div :style="labelStyle">number 数值（自动千分位）</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Wallet :value="12345" />
                    <Wallet :value="999999" />
                </div>
            </div>

            <div :style="labelStyle">string 字符串（原样展示）</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Wallet value="00,000" />
                    <Wallet value="∞" />
                </div>
            </div>

            <div :style="labelStyle">thousandSeparator="" 关闭千分位</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Wallet :value="999999" thousand-separator="" />
                </div>
            </div>

            <div :style="labelStyle">icon 自定义图标</div>
            <div :style="demoBoxStyle">
                <div :style="rowStyle">
                    <Wallet :value="999999" :icon="leafIcon" />
                </div>
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="WALLET_API" />
    </div>
</template>
