<script setup lang="ts">
import { inject, computed, watch, ref, onUnmounted, useSlots, cloneVNode, isVNode } from 'vue';
import type { VNode } from 'vue';
import { FormContextKey } from './context';
import { stringifyNamePath, defaultGetValueFromEvent } from './types';
import type { FormItemProps, NamePath, Rules } from './types';

const props = withDefaults(defineProps<FormItemProps>(), {
    rules: () => [],
    required: false,
    // Vue 约定：受控 prop 名为 modelValue，change 事件为 update:modelValue。
    // 与 React 端的 'value' / 'onChange' 保持等价语义但贴合 Vue 习惯。
    valuePropName: 'modelValue',
    trigger: 'onUpdate:modelValue',
    getValueFromEvent: defaultGetValueFromEvent,
    hidden: false,
    hasFeedback: false,
    noStyle: false,
    // Vue 3 会把未传的 boolean prop 强制转换为 false，
    // 这会让 `props.colon ?? ctxColon` 始终是 false，破坏"未传时回退到 ctx"的语义。
    // 显式给 null 默认值，让 ?? 在未传时正确回退。
    colon: null,
    requiredMark: null,
});

const ctx = inject(FormContextKey, null);
if (!ctx) {
    throw new Error('Form.Item must be used inside <Form> or <Form.Provider>');
}

const { form, layout: ctxLayout, labelAlign, labelCol: ctxLabelCol, wrapperCol: ctxWrapperCol, size, disabled: ctxDisabled, colon: ctxColon, requiredMark: ctxRequiredMark } = ctx;

const fieldKey = computed(() => (props.name !== undefined ? stringifyNamePath(props.name) : null));

// 订阅触发器：每次 form 状态变化时让 FormItem 重新渲染
const tick = ref(0);
const notify = () => {
    tick.value++;
};

onUnmounted(() => {
    if (!fieldKey.value) return;
    const formAny = form as unknown as {
        __store?: { unregisterField: (n: NamePath) => void };
    };
    formAny.__store?.unregisterField?.(fieldKey.value);
});

// 注册字段：在 name/rules/initialValue 变化时同步到 store
watch(
    () => [fieldKey.value, props.rules, props.initialValue] as const,
    (curr, prev) => {
        const [key, rules, initialValue] = curr;
        const prevKey = prev?.[0];
        const formAny = form as unknown as {
            __store?: {
                registerField: (n: NamePath, rules: Rules, initialValue: unknown, notify: () => void) => void;
                unregisterField: (n: NamePath) => void;
            };
        };
        const store = formAny.__store;
        if (!store) return;
        // 字段名变了：注销旧的
        if (prevKey && prevKey !== key) {
            store.unregisterField(prevKey);
        }
        if (key) {
            store.registerField(props.name!, rules, initialValue, notify);
        }
    },
    { immediate: true, flush: 'post' }
);

// 单独同步 rules（避免每次重注册）
watch(
    () => props.rules,
    (newRules) => {
        if (!fieldKey.value) return;
        const formAny = form as unknown as {
            __store?: { updateRules: (n: NamePath, rules: Rules) => void };
        };
        formAny.__store?.updateRules?.(fieldKey.value, newRules);
    }
);

// 让所有读取 form 状态的 computed 依赖 tick，
// 这样 form 内部状态变化时通过 notify 触发 re-render。
// 返回 tick 值本身（而非常量），确保 Vue 3 的 computed 缓存能检测到变化并传播。
const _readTick = computed(() => tick.value);

const value = computed(() => {
    _readTick.value;
    return fieldKey.value ? form.getFieldValue(props.name!) : undefined;
});
const errors = computed(() => {
    _readTick.value;
    return fieldKey.value ? form.getFieldError(props.name!) : undefined;
});
const isValidating = computed(() => {
    _readTick.value;
    return fieldKey.value ? form.isFieldValidating(props.name!) : false;
});
const touched = computed(() => {
    _readTick.value;
    return fieldKey.value ? form.isFieldTouched(props.name!) : false;
});

const computedStatus = computed(() => props.validateStatus ?? (isValidating.value ? 'validating' : errors.value?.[0] ? 'error' : ''));
const displayError = computed(() => {
    const e = touched.value && errors.value?.[0] ? errors.value[0] : undefined;
    return e;
});
const showHelp = computed(() => displayError.value ?? props.help);

const mergedRequiredMark = computed(() => props.requiredMark ?? ctxRequiredMark);
const isRequired = computed(() => props.required || props.rules.some((r) => (typeof r === 'object' ? r.required : false)));
const showRequiredMark = computed(() => isRequired.value && mergedRequiredMark.value !== false);

const itemLayoutTyped = computed(() => (props.layout ?? ctxLayout) as 'horizontal' | 'vertical' | 'inline');
const layout = computed(() => (itemLayoutTyped.value === 'inline' ? 'vertical' : itemLayoutTyped.value));
const mergedLabelCol = computed(() => props.labelCol ?? ctxLabelCol);
const mergedWrapperCol = computed(() => props.wrapperCol ?? ctxWrapperCol);
const showColon = computed(() => props.colon ?? ctxColon);

function buildGridStyle(col: { span?: number; offset?: number } | undefined, startCol = 1): Record<string, string> {
    if (!col) return {};
    const span = col.span ?? 24;
    const offset = col.offset ?? 0;
    return {
        gridColumn: `${startCol + offset} / span ${span}`,
    };
}

const labelEndCol = computed(() => (mergedLabelCol.value?.span ?? 0) + (mergedLabelCol.value?.offset ?? 0));
const labelColStyle = computed(() => buildGridStyle(mergedLabelCol.value, 1));
const wrapperColStyle = computed(() => buildGridStyle(mergedWrapperCol.value, labelEndCol.value + 1));

// 透传处理 children：克隆首个子 vnode 注入 value / trigger / size / status / disabled
const slots = useSlots();

function buildChildProps(originalProps: Record<string, unknown> | null): Record<string, unknown> {
    const childProps: Record<string, unknown> = {};

    if (fieldKey.value) {
        childProps[props.valuePropName] = value.value;
        // 保留用户原 trigger（如 @onChange / @update:modelValue）——与 React 版语义一致
        const userTrigger = originalProps?.[props.trigger];
        const userTriggerFn = typeof userTrigger === 'function' ? (userTrigger as (e: unknown) => void) : null;
        childProps[props.trigger] = (event: unknown) => {
            // 先调用用户原 trigger（链式回调）
            if (userTriggerFn) {
                try {
                    userTriggerFn(event);
                } catch {
                    // 用户回调异常不影响 Form 数据流
                }
            }
            if (!fieldKey.value) return;
            const rawValue = props.getValueFromEvent(event);
            const prevValue = form.getFieldValue(props.name!);
            const finalValue = props.normalize ? props.normalize(rawValue, prevValue, form.getFieldsValue(true)) : rawValue;
            form.setFieldValue(props.name!, finalValue);
        };
    }

    if (ctxDisabled && childProps.disabled === undefined) {
        childProps.disabled = true;
    }
    if (childProps.size === undefined) {
        childProps.size = size;
    }
    if (childProps.status === undefined && computedStatus.value === 'error') {
        childProps.status = 'error';
    }

    return childProps;
}

function getFirstChild(): VNode | null {
    const children = slots.default?.() ?? null;
    if (!children || (Array.isArray(children) && children.length === 0)) return null;
    const first = Array.isArray(children) ? children[0] : children;
    if (!first || !isVNode(first)) return null;
    return first;
}

const renderedFirstChild = computed<VNode | null>(() => {
    // 触发响应式依赖
    _readTick.value;
    const first = getFirstChild();
    if (!first) return null;
    const originalProps = (first.props as Record<string, unknown> | null) ?? null;
    // 保留原 props，再注入受控 props（链式回调：用户原 trigger 会被新 trigger 包裹后调用）
    const merged: Record<string, unknown> = {
        ...originalProps,
        ...buildChildProps(originalProps),
    };
    return cloneVNode(first, merged, false);
});

function renderChildren(): VNode | VNode[] | null {
    const children = slots.default?.() ?? null;
    if (!children || (Array.isArray(children) && children.length === 0)) return null;
    const first = Array.isArray(children) ? children[0] : children;
    if (!first || !isVNode(first)) {
        return Array.isArray(children) ? children : [first as VNode].filter(Boolean);
    }
    // 首个子 vnode 由 renderedFirstChild 提供
    const rest = Array.isArray(children) ? children.slice(1) : [];
    if (!renderedFirstChild.value) {
        return rest.length > 0 ? rest : null;
    }
    return rest.length > 0 ? [renderedFirstChild.value, ...rest] : renderedFirstChild.value;
}
</script>

<template>
    <template v-if="hidden">
        <slot></slot>
    </template>

    <template v-else-if="noStyle">
        <component :is="renderChildren()" />
        <div
            v-if="showHelp !== undefined"
            class="island-form-item__explain"
            :class="{ 'island-form-item__explain--error': computedStatus === 'error' }"
        >
            <span v-if="hasFeedback && computedStatus === 'error'" class="island-form-item__feedback-icon">✕</span>
            {{ showHelp }}
        </div>
    </template>

    <div
        v-else
        class="island-form-item"
        :class="[
            `island-form-item--${layout}`,
            `island-form-item--${size}`,
            {
                'island-form-item--has-error': computedStatus === 'error',
                'island-form-item--has-warning': computedStatus === 'warning',
                'island-form-item--has-success': computedStatus === 'success',
                'island-form-item--is-validating': computedStatus === 'validating',
                'island-form-item--required': showRequiredMark,
            },
        ]"
        :data-field-name="fieldKey"
    >
        <label
            v-if="label !== undefined"
            :for="fieldKey ?? undefined"
            class="island-form-item__label"
            :class="{
                'island-form-item__label--required': showRequiredMark,
                'island-form-item__label--colon': showColon && label !== '',
            }"
            :style="{ ...labelColStyle, textAlign: labelAlign }"
        >
            {{ label }}
        </label>

        <div class="island-form-item__control" :style="wrapperColStyle">
            <div class="island-form-item__control-input">
                <component :is="renderChildren()" />
            </div>
            <div
                v-if="showHelp !== undefined"
                class="island-form-item__explain"
                :class="{ 'island-form-item__explain--error': computedStatus === 'error' }"
            >
                <span v-if="hasFeedback && computedStatus === 'error'" class="island-form-item__feedback-icon">✕</span>
                {{ showHelp }}
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

@label-color: rgba(0, 0, 0, 0.85);
@required-color: @error-color;
@help-color: rgba(0, 0, 0, 0.45);
@help-font-size: 12px;
@label-line-height: 1.6;

.island-form-item {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    vertical-align: top;

    &__label {
        display: inline-block;
        flex: 0 0 auto;
        line-height: @label-line-height;
        color: @label-color;
        font-weight: normal;
        white-space: nowrap;

        &--required {
            &::before {
                content: '*';
                color: @required-color;
                margin-right: 4px;
            }
        }

        &--colon {
            &::after {
                content: ':';
                margin: 0 4px 0 2px;
            }
        }
    }

    &__control {
        min-width: 0;
    }

    &__control-input {
        position: relative;
        display: flex;
        align-items: center;
        min-height: 32px;

        > * {
            flex: 1 1 auto;
            max-width: 100%;
        }
    }

    &__explain {
        min-height: 22px;
        color: @help-color;
        font-size: @help-font-size;
        line-height: 1.5;
        margin-top: 4px;

        &--error {
            color: @error-color;
        }
    }

    &__feedback-icon {
        display: inline-block;
        margin-right: 4px;
        color: @error-color;
        font-size: 12px;
    }

    &--has-error {
        .island-form-item__explain {
            color: @error-color;
        }
    }

    &--has-warning {
        .island-form-item__explain {
            color: @warning-color;
        }
    }

    &--has-success {
        .island-form-item__explain {
            color: @success-color;
        }
    }

    &--is-validating {
        .island-form-item__explain {
            color: #1677ff;
        }
    }
}
</style>
