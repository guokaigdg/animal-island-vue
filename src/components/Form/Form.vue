<script setup lang="ts">
import { computed, watch, ref, provide } from 'vue';
import { FormContextKey } from './context';
import { useForm } from './useForm';
import FormItemComponent from './FormItem.vue';
import type { FormInstance, FormProps, ValidateError, FormContextValue } from './types';

const props = withDefaults(defineProps<FormProps>(), {
    layout: 'horizontal',
    size: 'middle',
    disabled: false,
    colon: true,
    requiredMark: false,
});

const emit = defineEmits<{
    (e: 'finish', values: Record<string, unknown>): void;
    (e: 'finishFailed', info: { values: Record<string, unknown>; errorFields: ValidateError[]; outOfDate: boolean }): void;
    (e: 'reset', event: Event): void;
}>();

const isControlledForm = props.form !== undefined;
const [defaultForm] = useForm();
const formInstance = (isControlledForm ? props.form : defaultForm) as FormInstance;

const callbacksRef = ref({
    onFinish: props.onFinish,
    onFinishFailed: props.onFinishFailed,
    onValuesChange: props.onValuesChange,
});

watch(
    () => ({
        onFinish: props.onFinish,
        onFinishFailed: props.onFinishFailed,
        onValuesChange: props.onValuesChange,
    }),
    (val) => {
        callbacksRef.value = val;
        const formAny = formInstance as unknown as {
            __bindCallbacks?: (c: typeof callbacksRef.value) => void;
        };
        if (typeof formAny.__bindCallbacks === 'function') {
            formAny.__bindCallbacks(callbacksRef.value);
        }
    },
    { immediate: true }
);

const lastInitialKeyRef = ref<string | undefined>(undefined);
watch(
    () => props.initialValues,
    (initialValues) => {
        if (!initialValues) return;
        const key = JSON.stringify(initialValues);
        if (key === lastInitialKeyRef.value) return;
        lastInitialKeyRef.value = key;
        formInstance.setFieldsValue(initialValues);
    },
    { immediate: true, deep: true }
);

const ctxValue = computed<FormContextValue>(() => ({
    form: formInstance,
    prefixCls: 'island-form',
    layout: props.layout,
    labelAlign: props.labelAlign ?? (props.layout === 'horizontal' ? 'right' : 'left'),
    labelCol: props.labelCol,
    wrapperCol: props.wrapperCol,
    size: props.size,
    disabled: props.disabled,
    colon: props.colon,
    requiredMark: props.requiredMark,
}));

provide(FormContextKey, ctxValue.value);

function handleSubmit(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    formInstance.validateFields().then(
        (values) => {
            emit('finish', values);
            callbacksRef.value.onFinish?.(values);
        },
        (err: Error & { errorFields?: unknown[]; values?: unknown }) => {
            if (err && Array.isArray(err.errorFields)) {
                const info = {
                    values: (err.values ?? {}) as Record<string, unknown>,
                    errorFields: err.errorFields as ValidateError[],
                    outOfDate: false,
                };
                emit('finishFailed', info);
                callbacksRef.value.onFinishFailed?.(info);
            }
        }
    );
}

function handleReset(e: Event) {
    e.preventDefault();
    formInstance.resetFields();
    emit('reset', e);
    props.onReset?.(e);
}

defineExpose({
    form: formInstance,
});
</script>

<template>
    <form
        class="island-form"
        :class="[
            `island-form--${layout}`,
            `island-form--${size}`,
            { 'island-form--disabled': disabled },
        ]"
        @submit="handleSubmit"
        @reset="handleReset"
    >
        <slot />
    </form>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

@label-color: rgba(0, 0, 0, 0.85);
@required-color: @error-color;
@help-color: rgba(0, 0, 0, 0.45);
@help-font-size: 12px;

@label-font-size-small: 12px;
@label-font-size-middle: 14px;
@label-font-size-large: 16px;

@vertical-gap: 6px;
@inline-gap: 8px;
@form-item-gap: 8px;
@label-line-height: 1.6;

.island-form {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    line-height: @label-line-height;
    list-style: none;

    &--horizontal {
        display: flex;
        flex-direction: column;
        gap: @form-item-gap;

        .island-form-item {
            display: grid;
            grid-template-columns: repeat(24, minmax(0, 1fr));
            align-items: baseline;
            row-gap: @form-item-gap;
        }
    }

    &--vertical {
        display: flex;
        flex-direction: column;
        gap: @form-item-gap;

        .island-form-item {
            display: block;

            &__label {
                display: block;
                margin-bottom: @vertical-gap;
            }
        }
    }

    &--inline {
        display: flex;
        flex-wrap: wrap;
        gap: @inline-gap;

        .island-form-item {
            flex: 0 0 auto;
        }
    }

    &--small {
        .island-form-item__label {
            font-size: @label-font-size-small;
        }
    }

    &--middle {
        .island-form-item__label {
            font-size: @label-font-size-middle;
        }
    }

    &--large {
        .island-form-item__label {
            font-size: @label-font-size-large;
        }
    }

    &--disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
}
</style>