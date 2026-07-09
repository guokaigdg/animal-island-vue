import { runRule } from './validators';
import type { FieldData, FormInstance, NamePath, RuleObject, Rules, ScrollOptions, ValidateError } from './types';
import { stringifyNamePath } from './types';

interface FieldMeta {
    key: string;
    rules: Rules;
    initialValue: unknown;
    initialSet: boolean;
    currentValue: unknown;
    notify: () => void;
}

interface FormStore {
    registerField: (name: NamePath, rules: Rules, initialValue: unknown, notify: () => void) => void;
    unregisterField: (name: NamePath) => void;
    hasField: (name: NamePath) => boolean;
    updateRules: (name: NamePath, rules: Rules) => void;
    notifyAll: () => void;
    forEachField: (cb: (meta: { key: string; rules: Rules; notify: () => void }) => void) => void;
}

function createFormStore(): FormStore {
    const fields = new Map<string, FieldMeta>();

    const notifyAll = (): void => {
        fields.forEach((meta) => {
            try {
                meta.notify();
            } catch {
                //
            }
        });
    };

    const forEachField = (cb: (meta: { key: string; rules: Rules; notify: () => void }) => void): void => {
        fields.forEach((meta) => {
            cb({ key: meta.key, rules: meta.rules, notify: meta.notify });
        });
    };

    return {
        registerField(name, rules, initialValue, notify) {
            const key = stringifyNamePath(name);
            if (!fields.has(key)) {
                fields.set(key, {
                    key,
                    rules,
                    initialValue,
                    initialSet: initialValue !== undefined,
                    currentValue: initialValue,
                    notify,
                });
            } else {
                const meta = fields.get(key);
                if (meta) {
                    meta.rules = rules;
                    meta.notify = notify;
                }
            }
        },
        unregisterField(name) {
            fields.delete(stringifyNamePath(name));
        },
        hasField(name) {
            return fields.has(stringifyNamePath(name));
        },
        updateRules(name, rules) {
            const key = stringifyNamePath(name);
            const meta = fields.get(key);
            if (meta) {
                meta.rules = rules;
            }
        },
        notifyAll,
        forEachField,
    };
}

function flattenInitialValues(
    values: Record<string, unknown>,
    prefix = '',
    out: Record<string, unknown> = {}
): Record<string, unknown> {
    for (const k of Object.keys(values)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        const v = values[k];
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
            flattenInitialValues(v as Record<string, unknown>, fullKey, out);
        } else {
            out[fullKey] = v;
        }
    }
    return out;
}

interface FormOptions {
    initialValues?: Record<string, unknown>;
    onValuesChange?: (changed: Record<string, unknown>, all: Record<string, unknown>) => void;
    onFinish?: (values: Record<string, unknown>) => void;
    onFinishFailed?: (info: {
        values: Record<string, unknown>;
        errorFields: ValidateError[];
        outOfDate: boolean;
    }) => void;
    submit: () => void;
}

function createFormInstance(options: FormOptions): FormInstance {
    const store = new Map<string, unknown>();
    const initialStore = new Map<string, unknown>();
    const errorsStore = new Map<string, string[]>();
    const touchedSet = new Set<string>();
    const validatingSet = new Set<string>();
    const fieldStore = createFormStore();

    if (options.initialValues) {
        const flat = flattenInitialValues(options.initialValues);
        Object.keys(flat).forEach((k) => {
            store.set(k, flat[k]);
            initialStore.set(k, flat[k]);
        });
    }

    function getFieldValue(name: NamePath): unknown {
        return store.get(stringifyNamePath(name));
    }

    function getFieldsValue(nameList?: NamePath[] | true): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        if (nameList === true || !nameList) {
            store.forEach((v, k) => {
                result[k] = v;
            });
        } else {
            nameList.forEach((n) => {
                const k = stringifyNamePath(n);
                if (store.has(k)) result[k] = store.get(k);
            });
        }
        return result;
    }

    function setFieldValue(name: NamePath, value: unknown): void {
        const key = stringifyNamePath(name);
        const prev = store.get(key);
        store.set(key, value);
        touchedSet.add(key);
        fieldStore.forEachField((meta) => {
            if (meta.key === key) meta.notify();
        });
        if (prev !== value) {
            options.onValuesChange?.({ [key]: value }, getFieldsValue(true));
        }
    }

    function setFieldsValue(values: Record<string, unknown>): void {
        const flat = flattenInitialValues(values);
        Object.keys(flat).forEach((k) => {
            store.set(k, flat[k]);
            if (!initialStore.has(k)) {
                initialStore.set(k, flat[k]);
            }
        });
        fieldStore.notifyAll();
    }

    function resetFields(nameList?: NamePath[]): void {
        const keys = nameList ? nameList.map(stringifyNamePath) : Array.from(store.keys());
        keys.forEach((k) => {
            store.set(k, initialStore.get(k));
            errorsStore.delete(k);
            touchedSet.delete(k);
        });
        fieldStore.notifyAll();
    }

    function isFieldTouched(name: NamePath): boolean {
        return touchedSet.has(stringifyNamePath(name));
    }

    function isFieldValidating(name: NamePath): boolean {
        return validatingSet.has(stringifyNamePath(name));
    }

    function getFieldError(name: NamePath): string[] | undefined {
        return errorsStore.get(stringifyNamePath(name));
    }

    function setFields(fields: FieldData[]): void {
        fields.forEach((f) => {
            const key = stringifyNamePath(f.name);
            if (f.value !== undefined) store.set(key, f.value);
            if (f.errors !== undefined) {
                if (f.errors.length === 0) errorsStore.delete(key);
                else errorsStore.set(key, f.errors);
            }
            if (f.touched) touchedSet.add(key);
            if (f.validating) validatingSet.add(key);
            else validatingSet.delete(key);
        });
        fieldStore.notifyAll();
    }

    async function validateFields(nameList?: NamePath[]): Promise<Record<string, unknown>> {
        const targetMetas: { key: string; rules: Rules }[] = [];
        fieldStore.forEachField((meta) => {
            if (!nameList || nameList.some((n) => stringifyNamePath(n) === meta.key)) {
                targetMetas.push({ key: meta.key, rules: meta.rules });
            }
        });

        targetMetas.forEach((m) => validatingSet.add(m.key));
        fieldStore.notifyAll();

        const errorFields: ValidateError[] = [];
        await Promise.all(
            targetMetas.map(async (meta) => {
                const value = store.get(meta.key);
                const ruleList = meta.rules;
                const errs: string[] = [];
                for (const r of ruleList) {
                    const rule: RuleObject = typeof r === 'function' ? r(formInstance) : r;
                    try {
                        await runRule(rule, value);
                    } catch (e) {
                        errs.push(e instanceof Error ? e.message : String(e));
                    }
                }
                if (errs.length > 0) {
                    errorsStore.set(meta.key, errs);
                    touchedSet.add(meta.key);
                    errorFields.push({ name: meta.key, errors: errs });
                } else {
                    errorsStore.delete(meta.key);
                }
            })
        );

        targetMetas.forEach((m) => validatingSet.delete(m.key));
        fieldStore.notifyAll();

        if (errorFields.length > 0) {
            const err = new Error('Validation failed') as Error & {
                errorFields: ValidateError[];
                values: Record<string, unknown>;
            };
            err.errorFields = errorFields;
            err.values = getFieldsValue(true);
            throw err;
        }
        return getFieldsValue(true);
    }

    function submit(): void {
        validateFields()
            .then((values) => {
                options.onFinish?.(values);
            })
            .catch((err: Error & { errorFields?: ValidateError[]; values?: Record<string, unknown> }) => {
                if (err && err.errorFields && err.values !== undefined) {
                    options.onFinishFailed?.({
                        values: err.values,
                        errorFields: err.errorFields,
                        outOfDate: false,
                    });
                }
            });
    }

    function bindCallbacks(c: {
        onFinish?: (values: Record<string, unknown>) => void;
        onFinishFailed?: (info: {
            values: Record<string, unknown>;
            errorFields: ValidateError[];
            outOfDate: boolean;
        }) => void;
        onValuesChange?: (changed: Record<string, unknown>, all: Record<string, unknown>) => void;
    }): void {
        if (c.onFinish) options.onFinish = c.onFinish;
        if (c.onFinishFailed) options.onFinishFailed = c.onFinishFailed;
        if (c.onValuesChange) options.onValuesChange = c.onValuesChange;
    }

    function scrollToField(name: NamePath, _options?: ScrollOptions): void {
        const key = stringifyNamePath(name);
        if (typeof document !== 'undefined') {
            const el = document.querySelector(`[data-field-name="${key}"]`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    const formInstance: FormInstance = {
        getFieldValue,
        getFieldsValue,
        setFieldValue,
        setFieldsValue,
        resetFields,
        validateFields,
        submit,
        setFields,
        isFieldTouched,
        isFieldValidating,
        getFieldError,
        scrollToField,
    };

    (formInstance as unknown as { __store: FormStore }).__store = fieldStore;
    (formInstance as unknown as { __bindCallbacks: typeof bindCallbacks }).__bindCallbacks = bindCallbacks;

    return formInstance;
}

const formInstances = new Map<string, FormInstance<Record<string, unknown>>>();

export function useForm<T = Record<string, unknown>>(options?: Omit<FormOptions, 'submit'>): [FormInstance<T>] {
    const instanceKey = 'default';
    let formInstance = formInstances.get(instanceKey) as FormInstance<T>;
    
    if (!formInstance) {
        const inst = createFormInstance({
            ...(options as FormOptions | undefined),
            submit: () => inst.submit(),
        });
        formInstance = inst as unknown as FormInstance<T>;
        formInstances.set(instanceKey, inst);
    }
    
    return [formInstance];
}