<script setup lang="ts">
import { inject, computed, watch, ref, onMounted, onUnmounted, h, useSlots } from 'vue';
import { FormContextKey } from './context';
import { stringifyNamePath, defaultGetValueFromEvent } from './types';
import type { FormItemProps, NamePath, Rules, FormContextValue } from './types';

const props = withDefaults(defineProps<FormItemProps>(), {
    rules: () => [],
    required: false,
    valuePropName: 'value',
    trigger: 'onChange',
    getValueFromEvent: defaultGetValueFromEvent,
    hidden: false,
    hasFeedback: false,
    noStyle: false,
});

const ctx = inject<FormContextValue | null>(FormContextKey, null);
if (!ctx) {
    throw new Error('Form.Item must be used inside <Form>');
}

const { form, layout: ctxLayout, labelAlign, labelCol: ctxLabelCol, wrapperCol: ctxWrapperCol, size, disabled: ctxDisabled, colon: ctxColon, requiredMark: ctxRequiredMark } = ctx;

const fieldKey = computed(() => (props.name !== undefined ? stringifyNamePath(props.name) : null));

const tick = ref(0);
const notify = () => tick.value++;

onMounted(() => {
    if (!fieldKey.value) return;
    const formAny = form as unknown as {
        __store?: {
            registerField: (n: NamePath, rules: Rules, initialValue: unknown, notify: () => void) => void;
            unregisterField: (n: NamePath) => void;
        };
    };
    const store = formAny.__store;
    if (!store) return;
    store.registerField(props.name!, props.rules, props.initialValue, notify);
});

onUnmounted(() => {
    if (!fieldKey.value) return;
    const formAny = form as unknown as {
        __store?: {
            unregisterField: (n: NamePath) => void;
        };
    };
    formAny.__store?.unregisterField?.(fieldKey.value);
});

watch(
    () => props.rules,
    (newRules) => {
        if (!fieldKey.value) return;
        const formAny = form as unknown as {
            __store?: {
                updateRules: (n: NamePath, rules: Rules) => void;
            };
        };
        formAny.__store?.updateRules?.(fieldKey.value, newRules);
    }
);

const value = computed(() => (fieldKey.value ? form.getFieldValue(props.name!) : undefined));
const errors = computed(() => (fieldKey.value ? form.getFieldError(props.name!) : undefined));
const isValidating = computed(() => (fieldKey.value ? form.isFieldValidating(props.name!) : false));
const touched = computed(() => (fieldKey.value ? form.isFieldTouched(props.name!) : false));

const computedStatus = computed(() => props.validateStatus ?? (isValidating.value ? 'validating' : errors.value?.[0] ? 'error' : ''));
const displayError = computed(() => (touched.value && errors.value?.[0] ? errors.value[0] : undefined));
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

function handleTrigger(event: unknown) {
    if (!fieldKey.value) return;
    const rawValue = props.getValueFromEvent(event);
    const prevValue = form.getFieldValue(props.name!);
    const finalValue = props.normalize ? props.normalize(rawValue, prevValue, form.getFieldsValue(true)) : rawValue;
    form.setFieldValue(props.name!, finalValue);
}

function renderChildren() {
    const slots = useSlots();
    if (!slots.default) return null;

    const children = slots.default();
    if (!children || children.length === 0) return null;

    const child = children[0];
    if (!child) return children;

    const isComponent = typeof child.type === 'object' || typeof child.type === 'function';
    if (!isComponent) return children;

    const childProps: Record<string, unknown> = { ...child.props };

    if (fieldKey.value) {
        childProps[props.valuePropName] = value.value;
        const userTrigger = childProps[props.trigger];
        childProps[props.trigger] = (event: unknown) => {
            if (typeof userTrigger === 'function') {
                userTrigger(event);
            }
            handleTrigger(event);
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

    return h(child.type as never, childProps, child.children ?? undefined);
}
</script>

<template>
    <template v-if="hidden">
        <slot></slot>
    </template>

    <template v-else-if="noStyle">
        <template v-for="(_, index) in 1" :key="index">
            <slot></slot>
            <div
                v-if="showHelp !== undefined"
                class="island-form-item__explain"
                :class="{ 'island-form-item__explain--error': computedStatus === 'error' }"
            >
                <span v-if="hasFeedback && computedStatus === 'error'" class="island-form-item__feedback-icon">✕</span>
                {{ showHelp }}
            </div>
        </template>
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
                <slot></slot>
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