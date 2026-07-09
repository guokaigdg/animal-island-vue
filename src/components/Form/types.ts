export type NamePath = string | number | (string | number)[];

export type StoreValue = unknown;

export function defaultGetValueFromEvent(event: unknown): StoreValue {
    if (event === null || event === undefined) return event;
    if (typeof event !== 'object') return event;
    const target = (event as { target?: { value?: unknown; checked?: unknown; type?: string } }).target;
    if (target && typeof target === 'object') {
        if (target.type === 'checkbox' || target.type === 'radio') {
            if ('checked' in target) return target.checked;
        }
        if ('value' in target && target.value !== undefined) return target.value;
    }
    if ('value' in (event as Record<string, unknown>)) {
        return (event as { value: unknown }).value;
    }
    return event;
}

export function stringifyNamePath(name: NamePath): string {
    if (typeof name === 'string') return name;
    if (typeof name === 'number') return String(name);
    return name.map((n) => String(n)).join('.');
}

export type RuleType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'integer'
    | 'float'
    | 'array'
    | 'object'
    | 'email'
    | 'url'
    | 'date';

export interface RuleObject {
    required?: boolean;
    message?: string;
    min?: number;
    max?: number;
    len?: number;
    pattern?: RegExp;
    whitespace?: boolean;
    type?: RuleType;
    validator?: (rule: RuleObject, value: unknown) => Promise<void | string> | void | string;
}

export type RuleRender = RuleObject | ((form: FormInstance) => RuleObject);
export type Rules = RuleRender[];

export interface ValidateError {
    name: NamePath;
    errors: string[];
}

export interface ValidateInfo {
    values: Record<string, unknown>;
    errorFields: ValidateError[];
    outOfDate: boolean;
}

export interface FieldData {
    name: NamePath;
    value?: unknown;
    errors?: string[];
    touched?: boolean;
    validating?: boolean;
}

export interface FormInstance<T = Record<string, unknown>> {
    getFieldValue: (name: NamePath) => unknown;
    getFieldsValue: (nameList?: NamePath[] | true) => T;
    setFieldValue: (name: NamePath, value: unknown) => void;
    setFieldsValue: (values: Partial<T>) => void;
    resetFields: (nameList?: NamePath[]) => void;
    validateFields: (nameList?: NamePath[]) => Promise<T>;
    submit: () => void;
    setFields: (fields: FieldData[]) => void;
    isFieldTouched: (name: NamePath) => boolean;
    isFieldValidating: (name: NamePath) => boolean;
    getFieldError: (name: NamePath) => string[] | undefined;
    scrollToField: (name: NamePath, options?: ScrollOptions) => void;
}

export interface ScrollOptions {
    behavior?: 'auto' | 'smooth';
    block?: 'start' | 'center' | 'end' | 'nearest';
    inline?: 'start' | 'center' | 'end' | 'nearest';
}

export type FormLayout = 'horizontal' | 'vertical' | 'inline';
export type FormLabelAlign = 'left' | 'right';
export type FormSize = 'small' | 'middle' | 'large';
export type RequiredMark = boolean | 'optional';

export interface ColProps {
    span?: number;
    offset?: number;
}

export interface FormProps<T = Record<string, unknown>> {
    form?: FormInstance<T>;
    initialValues?: Partial<T>;
    layout?: FormLayout;
    labelAlign?: FormLabelAlign;
    labelCol?: ColProps;
    wrapperCol?: ColProps;
    size?: FormSize;
    disabled?: boolean;
    colon?: boolean;
    requiredMark?: RequiredMark;
    onFinish?: (values: T) => void;
    onFinishFailed?: (info: ValidateInfo) => void;
    onValuesChange?: (changedValues: Partial<T>, allValues: T) => void;
    onReset?: (e: Event) => void;
    class?: string;
}

export type FormItemLayout = 'horizontal' | 'vertical';
export type ValidateStatus = 'success' | 'warning' | 'error' | 'validating' | '';

export interface FormContextValue {
    form: FormInstance;
    prefixCls: string;
    layout: FormLayout;
    labelAlign: FormLabelAlign;
    labelCol?: ColProps;
    wrapperCol?: ColProps;
    size: FormSize;
    disabled: boolean;
    colon: boolean;
    requiredMark: RequiredMark;
}

export interface FormItemProps {
    name?: NamePath;
    label?: string;
    rules?: Rules;
    required?: boolean;
    dependencies?: NamePath[];
    valuePropName?: string;
    trigger?: string;
    getValueFromEvent?: (event: unknown) => unknown;
    normalize?: (value: unknown, prevValue: unknown, prevAllValues: Record<string, unknown>) => unknown;
    hidden?: boolean;
    hasFeedback?: boolean;
    validateStatus?: ValidateStatus;
    help?: string;
    noStyle?: boolean;
    labelCol?: ColProps;
    wrapperCol?: ColProps;
    colon?: boolean;
    requiredMark?: RequiredMark;
    layout?: FormItemLayout;
    initialValue?: StoreValue;
    class?: string;
}