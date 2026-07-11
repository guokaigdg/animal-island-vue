import FormComponent from './Form.vue';
import FormItemComponent from './FormItem.vue';
import FormProviderComponent from './FormProvider.vue';
import { useForm } from './useForm';

// 静态属性挂载（对齐 React 端 Form.Item / Form.useForm / Form.Provider）
(FormComponent as unknown as { Item: typeof FormItemComponent }).Item = FormItemComponent;
(FormComponent as unknown as { useForm: typeof useForm }).useForm = useForm;
(FormComponent as unknown as { Provider: typeof FormProviderComponent }).Provider = FormProviderComponent;

export { default as Form } from './Form.vue';
export { default as FormItem } from './FormItem.vue';
export { default as FormProvider } from './FormProvider.vue';
export { useForm } from './useForm';

export type {
    ColProps,
    FieldData,
    FormContextValue,
    FormInstance,
    FormItemLayout,
    FormItemProps,
    FormLabelAlign,
    FormLayout,
    FormProps,
    FormProviderProps,
    FormSize,
    NamePath,
    RequiredMark,
    RuleObject,
    RuleRender,
    RuleType,
    Rules,
    ScrollOptions,
    StoreValue,
    ValidateError,
    ValidateInfo,
    ValidateStatus,
} from './types';
