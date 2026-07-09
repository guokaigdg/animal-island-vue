import type { InjectionKey } from 'vue';
import type { FormContextValue } from './types';

export const FormContextKey: InjectionKey<FormContextValue | null> = Symbol('FormContext');