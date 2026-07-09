import FormComponent from './Form.vue';
import FormItemComponent from './FormItem.vue';
import { useForm } from './useForm';

(FormComponent as unknown as { Item: typeof FormItemComponent; useForm: typeof useForm }).Item = FormItemComponent;
(FormComponent as unknown as { Item: typeof FormItemComponent; useForm: typeof useForm }).useForm = useForm;

export { default as Form } from './Form.vue';
export { default as FormItem } from './FormItem.vue';
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