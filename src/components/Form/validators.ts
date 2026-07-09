import type { RuleObject, RuleType } from './types';

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_RE = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

function checkType(value: unknown, type: RuleType): boolean {
    switch (type) {
        case 'string':
            return typeof value === 'string';
        case 'number': {
            if (typeof value === 'number') return !Number.isNaN(value);
            if (typeof value === 'string') {
                const n = Number(value);
                return value.trim() !== '' && !Number.isNaN(n);
            }
            return false;
        }
        case 'boolean':
            return typeof value === 'boolean';
        case 'integer': {
            if (typeof value === 'number') return Number.isInteger(value);
            if (typeof value === 'string') {
                if (value.trim() === '') return false;
                const n = Number(value);
                return !Number.isNaN(n) && Number.isInteger(n);
            }
            return false;
        }
        case 'float': {
            if (typeof value === 'number') return !Number.isInteger(value);
            if (typeof value === 'string') {
                const n = Number(value);
                return !Number.isNaN(n) && !Number.isInteger(n);
            }
            return false;
        }
        case 'array':
            return Array.isArray(value);
        case 'object':
            return (
                value !== null &&
                typeof value === 'object' &&
                !Array.isArray(value) &&
                !(value instanceof Date) &&
                !(value instanceof RegExp)
            );
        case 'email':
            return typeof value === 'string' && EMAIL_RE.test(value);
        case 'url':
            return typeof value === 'string' && URL_RE.test(value);
        case 'date':
            return value instanceof Date && !Number.isNaN(value.getTime());
        default:
            return true;
    }
}

function toComparableNumber(value: unknown, type?: RuleType): unknown {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && (type === 'number' || type === 'integer' || type === 'float')) {
        const n = Number(value);
        if (!Number.isNaN(n)) return n;
    }
    return value;
}

function isEmpty(value: unknown, whitespace = false): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') {
        if (value === '') return true;
        if (whitespace && /^\s+$/.test(value)) return true;
        return false;
    }
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

export async function runRule(rule: RuleObject, value: unknown): Promise<void> {
    const empty = isEmpty(value, rule.whitespace);

    if (rule.required) {
        if (empty) throw new Error(rule.message ?? '此项为必填');
    }

    if (empty) return;

    if (rule.type && !checkType(value, rule.type)) {
        throw new Error(rule.message ?? `类型应为 ${rule.type}`);
    }

    if (typeof rule.min === 'number') {
        const cmp = toComparableNumber(value, rule.type);
        const len = typeof cmp === 'number' ? cmp : (cmp as { length: number }).length;
        if (typeof len === 'number' && len < rule.min) {
            throw new Error(rule.message ?? `不能少于 ${rule.min}`);
        }
    }
    if (typeof rule.max === 'number') {
        const cmp = toComparableNumber(value, rule.type);
        const len = typeof cmp === 'number' ? cmp : (cmp as { length: number }).length;
        if (typeof len === 'number' && len > rule.max) {
            throw new Error(rule.message ?? `不能多于 ${rule.max}`);
        }
    }
    if (typeof rule.len === 'number') {
        const cmp = toComparableNumber(value, rule.type);
        const len = typeof cmp === 'number' ? cmp : (cmp as { length: number }).length;
        if (typeof len === 'number' && len !== rule.len) {
            throw new Error(rule.message ?? `长度必须为 ${rule.len}`);
        }
    }

    if (rule.pattern instanceof RegExp) {
        if (typeof value !== 'string' || !rule.pattern.test(value)) {
            throw new Error(rule.message ?? '格式不正确');
        }
    }

    if (typeof rule.validator === 'function') {
        const result = await rule.validator(rule, value);
        if (typeof result === 'string' && result.length > 0) {
            throw new Error(result);
        }
    }
}