<script setup lang="ts">
import { ref } from 'vue';
import { Form, FormItem, useForm, Input, Button, Radio, Checkbox, Card } from '../../src';
import type { FormInstance } from '../../src';
import type { CardPattern } from '../../src/components/Card/types';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

// 5 个 Card 的随机 pattern：挂载时一次性生成，避免每次渲染抖动
const CARD_PATTERNS: CardPattern[] = [
    'default',
    'app-teal',
    'app-yellow',
    'app-orange',
    'app-green',
    'app-red',
    'warm-peach-pink',
    'lime-green',
    'yellow-green',
    'brown',
];

function makeCardPatterns(): CardPattern[] {
    return Array.from({ length: 5 }, () => CARD_PATTERNS[Math.floor(Math.random() * CARD_PATTERNS.length)]);
}

const cardPatterns = ref<CardPattern[]>(makeCardPatterns());

// 表单实例：演示 setFieldsValue / resetFields
const [form] = useForm<{ name: string; fruit: string; hobby: string[] }>();
const instanceResult = ref<string>('');

// 监听 onValuesChange
const liveValues = ref<Record<string, unknown>>({});

const passwordValidator = (_rule: unknown, value: unknown) => {
    if (typeof value === 'string' && value.length > 0 && value.length < 6) {
        return Promise.reject(new Error('密码至少 6 位'));
    }
    return Promise.resolve();
};

function handleLoginSuccess(values: Record<string, unknown>) {
    console.log('login success:', values);
}

function handleLoginFailed(info: { values: Record<string, unknown>; errorFields: unknown[] }) {
    console.log('login failed:', info);
}

function fillAll() {
    form.setFieldsValue({
        name: '豆狸粒',
        fruit: 'orange',
        hobby: ['fish', 'mine'],
    });
}

function handleValuesChange(_changed: Partial<Record<string, unknown>>, all: Record<string, unknown>) {
    liveValues.value = all;
}

function handleSubmitFinished(values: Record<string, unknown>) {
    instanceResult.value = `onFinish: ${JSON.stringify(values)}`;
}

function handleFinalSubmit(v: Record<string, unknown>) {
    window.alert(`提交: ${JSON.stringify(v)}`);
}

const FORM_API: ApiRow[] = [
    { prop: 'form', desc: '受控 form 实例（Form.useForm() 产出）', type: 'FormInstance', defaultVal: '-' },
    {
        prop: 'initialValues',
        desc: '表单初始值',
        type: 'Record<string, unknown>',
        defaultVal: '-',
    },
    {
        prop: 'layout',
        desc: '布局方向',
        type: "'horizontal' | 'vertical' | 'inline'",
        defaultVal: "'horizontal'",
    },
    {
        prop: 'labelAlign',
        desc: 'label 对齐',
        type: "'left' | 'right'",
        defaultVal: "'right'",
    },
    {
        prop: 'labelCol / wrapperCol',
        desc: 'label / 控件的网格配置',
        type: '{ span?: number; offset?: number }',
        defaultVal: '{ span: 5 / 19 }',
    },
    { prop: 'size', desc: '全局尺寸', type: "'small' | 'middle' | 'large'", defaultVal: "'middle'" },
    { prop: 'disabled', desc: '全局禁用', type: 'boolean', defaultVal: 'false' },
    { prop: 'colon', desc: 'label 后是否显示冒号', type: 'boolean', defaultVal: 'true' },
    {
        prop: 'requiredMark',
        desc: '必填星号显示策略',
        type: "boolean | 'optional'",
        defaultVal: 'true',
    },
    {
        prop: 'onFinish',
        desc: '校验通过、提交时触发',
        type: '(values) => void',
        defaultVal: '-',
    },
    {
        prop: 'onFinishFailed',
        desc: '校验失败时触发',
        type: '(info) => void',
        defaultVal: '-',
    },
    {
        prop: 'onValuesChange',
        desc: '任意字段值变化',
        type: '(changed, all) => void',
        defaultVal: '-',
    },
    { prop: 'onReset', desc: 'reset 事件', type: '(e) => void', defaultVal: '-' },
];

const FORM_ITEM_API: ApiRow[] = [
    { prop: 'name', desc: '字段名（无 name 仅作展示）', type: 'NamePath', defaultVal: '-' },
    { prop: 'label', desc: 'label 文本', type: 'string', defaultVal: '-' },
    { prop: 'rules', desc: '校验规则', type: 'RuleObject[]', defaultVal: '-' },
    { prop: 'required', desc: '显示必填星号（不参与校验）', type: 'boolean', defaultVal: 'false' },
    { prop: 'valuePropName', desc: '子节点接收的 value prop 名', type: 'string', defaultVal: "'modelValue'" },
    { prop: 'trigger', desc: '子节点的 change 事件名', type: 'string', defaultVal: "'onUpdate:modelValue'" },
    {
        prop: 'getValueFromEvent',
        desc: '从事件对象取值（默认兼容 input/checkbox/radio）',
        type: '(event) => unknown',
        defaultVal: '-',
    },
    { prop: 'normalize', desc: '写入前的标准化处理', type: '(value, prev, all) => unknown', defaultVal: '-' },
    { prop: 'hidden', desc: '不渲染 DOM', type: 'boolean', defaultVal: 'false' },
    { prop: 'help', desc: '帮助文本（错误时显示错误）', type: 'string', defaultVal: '-' },
    { prop: 'noStyle', desc: '不渲染 label/wrapper，仅包 children', type: 'boolean', defaultVal: 'false' },
    { prop: 'labelCol / wrapperCol', desc: '覆盖父级网格', type: 'ColProps', defaultVal: '-' },
    { prop: 'initialValue', desc: '字段初始值', type: 'unknown', defaultVal: '-' },
];

const codeExample = `<script setup lang="ts">
import { Form, FormItem, useForm, Input, Button } from 'animal-island-vue';

const [form] = useForm();
` + '</' + 'script>' + `

<template>
    <Form
        :form="form"
        layout="vertical"
        :initial-values="{ username: '' }"
        @finish="(values) => console.log('success', values)"
        @finish-failed="(info) => console.log('failed', info)"
    >
        <FormItem
            label="用户名"
            name="username"
            required
            :rules="[
                { required: true, message: '请输入用户名' },
                { min: 3, max: 12, message: '长度 3 - 12' },
            ]"
        >
            <Input placeholder="请输入" />
        </FormItem>
        <FormItem>
            <Button type="primary" html-type="submit">提交</Button>
            <Button @click="form.resetFields()">重置</Button>
        </FormItem>
    </Form>
</template>`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Form <span :style="tagStyle">表单</span> <span :style="tagStyle">useForm</span>{' '}
            <span :style="tagStyle">校验</span>
        </div>

        <div :style="labelStyle">Form 表单组件 — 集成表单实例、校验规则、布局网格、依赖字段等基础能力。</div>

        <!-- ========== 基础用法：登录表单 ========== -->
        <div :style="labelStyle">基础用法：登录表单（required / minLength / 自定义 validator）</div>
        <Card :pattern="cardPatterns[0]" :style="{ marginTop: '12px', cursor: 'default', maxWidth: '360px' }">
            <Form
                layout="vertical"
                :style="{ maxWidth: '300px' }"
                :initial-values="{ username: '', password: '' }"
                @finish="handleLoginSuccess"
                @finish-failed="handleLoginFailed"
            >
                <FormItem
                    label="用户名"
                    name="username"
                    required
                    :rules="[
                        { required: true, message: '请输入用户名' },
                        { min: 3, max: 12, message: '长度需在 3 - 12 字符之间' },
                    ]"
                >
                    <Input placeholder="请输入用户名" />
                </FormItem>
                <FormItem
                    label="密码"
                    name="password"
                    required
                    :rules="[
                        { required: true, message: '请输入密码' },
                        { validator: passwordValidator },
                    ]"
                >
                    <Input type="password" placeholder="请输入密码" />
                </FormItem>
                <FormItem>
                    <div :style="{ marginTop: '8px' }">
                        <Button type="primary" html-type="submit" block>登录</Button>
                    </div>
                </FormItem>
            </Form>
        </Card>

        <!-- ========== 三种布局 ========== -->
        <div :style="labelStyle">三种布局：horizontal / vertical / inline</div>
        <Card
            :pattern="cardPatterns[1]"
            :style="{
                marginTop: '12px',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxWidth: '360px',
            }"
        >
            <div :style="{ fontSize: '12px', color: '#a08060', marginBottom: '4px' }">layout="horizontal"</div>
            <Form
                layout="horizontal"
                :style="{ maxWidth: '300px' }"
                :label-col="{ span: 6 }"
                :wrapper-col="{ span: 18 }"
                label-align="left"
                :initial-values="{ a: '' }"
            >
                <FormItem label="昵称" name="a" required>
                    <Input placeholder="输入昵称" />
                </FormItem>
                <FormItem label="签名" name="a-sign">
                    <Input placeholder="输入签名" />
                </FormItem>
            </Form>

            <div :style="{ fontSize: '12px', color: '#a08060', marginTop: '12px', marginBottom: '4px' }">
                layout="vertical"
            </div>
            <Form layout="vertical" :style="{ maxWidth: '300px' }" :initial-values="{ b: '' }">
                <FormItem label="标题" name="b" required>
                    <Input placeholder="输入标题" />
                </FormItem>
            </Form>

            <div :style="{ fontSize: '12px', color: '#a08060', marginTop: '12px', marginBottom: '4px' }">
                layout="inline"
            </div>
            <Form layout="inline" :style="{ maxWidth: '300px' }" :initial-values="{ c: '' }">
                <FormItem name="c">
                    <Input placeholder="搜索关键词" />
                </FormItem>
                <FormItem>
                    <Button type="primary" html-type="submit" size="small">搜索</Button>
                </FormItem>
            </Form>
        </Card>

        <!-- ========== Form.useForm + 命令式 API ========== -->
        <div :style="labelStyle">Form.useForm + 命令式 API（setFieldsValue / resetFields）</div>
        <Card :pattern="cardPatterns[2]" :style="{ marginTop: '12px', cursor: 'default', maxWidth: '360px' }">
            <Form
                :form="form"
                layout="vertical"
                :style="{ maxWidth: '300px' }"
                :initial-values="{ name: '', fruit: 'apple', hobby: [] }"
                @finish="handleSubmitFinished"
            >
                <FormItem label="姓名" name="name" required>
                    <Input placeholder="请输入姓名" />
                </FormItem>
                <FormItem label="最爱水果" name="fruit" :initial-value="'apple'">
                    <Input placeholder="apple / orange / grape" />
                </FormItem>
                <FormItem label="爱好" name="hobby">
                    <Checkbox
                        :options="[
                            { value: 'fish', label: '🎣 钓鱼' },
                            { value: 'wood', label: '🪵 砍树' },
                            { value: 'mine', label: '⛏️ 挖矿' },
                        ]"
                    />
                </FormItem>
                <FormItem>
                    <div :style="{ marginTop: '8px' }">
                        <Button
                            type="dashed"
                            :style="{ marginRight: '8px' }"
                            @click="fillAll"
                        >一键填充</Button>
                        <Button :style="{ marginRight: '8px' }" @click="form.resetFields()">重置</Button>
                        <Button type="primary" html-type="submit">提交</Button>
                    </div>
                </FormItem>
            </Form>
            <div
                v-if="instanceResult"
                :style="{
                    marginTop: '8px',
                    padding: '6px 10px',
                    background: '#fffbe6',
                    border: '1px solid #ffe58f',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#874d00',
                }"
            >
                {{ instanceResult }}
            </div>
        </Card>

        <!-- ========== 同步值（onValuesChange）========== -->
        <div :style="labelStyle">onValuesChange：实时同步字段值</div>
        <Card :pattern="cardPatterns[3]" :style="{ marginTop: '12px', cursor: 'default', maxWidth: '360px' }">
            <Form
                layout="vertical"
                :style="{ maxWidth: '300px' }"
                :initial-values="{ radio: 'cat', check: ['b'] }"
                @values-change="handleValuesChange"
            >
                <FormItem label="你是？" name="radio">
                    <Radio
                        :options="[
                            { value: 'cat', label: '🐱 猫' },
                            { value: 'dog', label: '🐶 狗' },
                            { value: 'rabbit', label: '🐰 兔子' },
                        ]"
                    />
                </FormItem>
                <FormItem label="你喜欢？" name="check">
                    <Checkbox
                        :options="[
                            { value: 'a', label: 'A' },
                            { value: 'b', label: 'B' },
                            { value: 'c', label: 'C' },
                        ]"
                    />
                </FormItem>
            </Form>
            <div
                :style="{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#5b8def',
                    fontFamily: 'monospace',
                }"
            >
                liveValues: {{ JSON.stringify(liveValues) }}
            </div>
        </Card>

        <!-- ========== 多种校验规则 ========== -->
        <div :style="labelStyle">校验规则：pattern / type / max / 自定义 async</div>
        <Card :pattern="cardPatterns[4]" :style="{ marginTop: '12px', cursor: 'default', maxWidth: '360px' }">
            <Form
                layout="vertical"
                :style="{ maxWidth: '300px' }"
                :initial-values="{ email: '', age: '', code: '' }"
                @finish="handleFinalSubmit"
            >
                <FormItem
                    label="邮箱"
                    name="email"
                    required
                    :rules="[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '邮箱格式不正确' },
                    ]"
                >
                    <Input placeholder="example@animal.com" />
                </FormItem>
                <FormItem
                    label="年龄"
                    name="age"
                    required
                    :rules="[
                        { required: true, message: '请输入年龄' },
                        { type: 'integer', message: '请输入整数' },
                        { min: 0, max: 150, message: '年龄应在 0 - 150 之间' },
                    ]"
                >
                    <Input placeholder="整数" />
                </FormItem>
                <FormItem label="邀请码" name="code" :rules="[{ pattern: /^[A-Z]{4}$/, message: '4 位大写字母' }]">
                    <Input placeholder="如：ACNH" />
                </FormItem>
                <FormItem>
                    <div :style="{ marginTop: '8px' }">
                        <Button type="primary" html-type="submit" block>提交</Button>
                    </div>
                </FormItem>
            </Form>
        </Card>

        <CodeBlock :code="codeExample" />
        <ApiTable :rows="FORM_API" title="Form API" />
        <ApiTable :rows="FORM_ITEM_API" title="FormItem API" />
    </div>
</template>
