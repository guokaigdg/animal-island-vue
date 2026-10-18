<script setup lang="ts">
import { computed, ref, useAttrs, watch, onBeforeUnmount, type CSSProperties } from 'vue';
import type { SelectOption, SelectProps } from './types';

const attrs = useAttrs();

const props = withDefaults(defineProps<SelectProps>(), {
    placeholder: '请选择',
    disabled: false,
    allowClear: false,
    clearAriaLabel: '清除',
    showSearch: false,
    filterOption: true,
    optionFilterProp: 'label',
    notFoundContent: '暂无数据',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', value: string): void;
    (e: 'clear'): void;
    (e: 'search', value: string): void;
}>();

const open = ref(false);
const mounted = ref(false);
const activeKey = ref<string | null>(null);
const hoveredKey = ref<string | null>(null);
/** 整个组件的悬停态：清除按钮仅在悬停（含聚焦触发的悬停）时显示 */
const hovered = ref(false);
/** null = 没有在搜索（输入框回显选中项 label），string = 用户正在搜索（空串就是要显示空查询） */
const searchValue = ref<string | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);
const triggerRef = ref<HTMLDivElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const dropdownStyle = ref<CSSProperties>({});

// 唯一 id 前缀（类似 React 的 useId）
const idBase = `animal-select-${Math.random().toString(36).slice(2, 10)}`;
const listboxId = `${idBase}-listbox`;
const optionId = (k: string) => `${idBase}-option-${k}`;

const currentLabel = computed(() => props.options.find((o) => o.key === props.modelValue)?.label || props.placeholder);
// 输入框在非搜索状态下的回显：有选中值显示 label，否则留空让 placeholder 生效
const labelForInput = computed(() => (props.modelValue ? currentLabel.value : ''));

// 关键字过滤；未搜索或搜索词为空时展示全部选项
const filteredOptions = computed<SelectOption[]>(() => {
    if (!props.showSearch || !props.filterOption || !searchValue.value) return props.options;
    const matcher =
        typeof props.filterOption === 'function'
            ? props.filterOption
            : (inputValue: string, option: SelectOption) =>
                  option[props.optionFilterProp].toLowerCase().includes(inputValue.toLowerCase());
    return props.options.filter((option) => matcher(searchValue.value as string, option));
});

/** 收起下拉并把被重置掉的查询告知消费者 */
function closeDropdown() {
    open.value = false;
    mounted.value = false;
    if (searchValue.value) emit('search', '');
    searchValue.value = null;
}

function focusTrigger() {
    if (props.showSearch) searchRef.value?.focus();
    else triggerRef.value?.focus();
}

function handleToggle() {
    if (props.disabled) return;
    open.value = !open.value;
}

function handleSelect(key: string) {
    emit('update:modelValue', key);
    emit('change', key);
    closeDropdown();
    focusTrigger();
}

function handleClear(e: MouseEvent) {
    e.stopPropagation();
    emit('update:modelValue', '');
    emit('change', '');
    emit('clear');
    // 值清空后按钮自身会卸载，把焦点交给 trigger 免得键盘用户掉焦点
    focusTrigger();
}

function handleSearchInput(e: Event) {
    const next = (e.target as HTMLInputElement).value;
    // 输入框此刻显示的是选中的 label（尚无搜索词）时，输入应作为新的查询词，
    // 去掉 label 前缀而非在 label 后面追加
    const editingLabel =
        searchValue.value === null &&
        Boolean(props.modelValue) &&
        labelForInput.value !== '' &&
        next.startsWith(labelForInput.value);
    const query = editingLabel ? next.slice(labelForInput.value.length) : next;
    searchValue.value = query;
    emit('search', query);
    // 闭合时直接输入的第一个字符即开始搜索
    if (!open.value) open.value = true;
}

function moveActive(delta: 1 | -1) {
    if (!filteredOptions.value.length) return;
    const idx = filteredOptions.value.findIndex((o) => o.key === activeKey.value);
    const nextIdx =
        idx < 0
            ? delta === 1
                ? 0
                : filteredOptions.value.length - 1
            : (idx + delta + filteredOptions.value.length) % filteredOptions.value.length;
    activeKey.value = filteredOptions.value[nextIdx].key;
}

function handleKeyDown(e: KeyboardEvent) {
    if (props.disabled) return;
    // 只接管 trigger 与搜索框的按键；清除按钮等子元素保留自身 Enter/Space 行为
    const fromControl = e.target === triggerRef.value || e.target === searchRef.value;
    if (!fromControl) return;
    const { key } = e;
    if (!open.value) {
        if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
            e.preventDefault();
            open.value = true;
        }
        return;
    }
    if (key === 'Escape') {
        e.preventDefault();
        // 有搜索词时先清空搜索词，再按一次才关闭
        if (props.showSearch && searchValue.value) {
            searchValue.value = null;
            emit('search', '');
            return;
        }
        closeDropdown();
        focusTrigger();
    } else if (key === 'ArrowDown') {
        e.preventDefault();
        moveActive(1);
    } else if (key === 'ArrowUp') {
        e.preventDefault();
        moveActive(-1);
    } else if (key === 'Home') {
        e.preventDefault();
        if (filteredOptions.value[0]) activeKey.value = filteredOptions.value[0].key;
    } else if (key === 'End') {
        e.preventDefault();
        if (filteredOptions.value.length) activeKey.value = filteredOptions.value[filteredOptions.value.length - 1].key;
    } else if (key === 'Enter' || (key === ' ' && !props.showSearch)) {
        // 空格在搜索模式下属于正常输入，只有非搜索模式才当作确认
        e.preventDefault();
        if (activeKey.value && filteredOptions.value.some((o) => o.key === activeKey.value)) {
            handleSelect(activeKey.value);
        }
    }
}

function handleClickOutside(e: MouseEvent) {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
        closeDropdown();
    }
}

// 展开或过滤结果变化时，把高亮落到当前选中项或第一个可见项
// 注意：Vue 的 ref 不支持 React setState 那种「传函数当 updater」的写法，
// 必须先把旧值读进局部变量再判断，否则会把函数本身赋给 activeKey。
watch([open, () => props.modelValue, filteredOptions], ([isOpen]) => {
    if (!isOpen) {
        activeKey.value = null;
        return;
    }
    const prev = activeKey.value;
    if (prev && filteredOptions.value.some((o) => o.key === prev)) return;
    activeKey.value =
        filteredOptions.value.find((o) => o.key === props.modelValue)?.key ?? filteredOptions.value[0]?.key ?? null;
});

watch(open, (isOpen) => {
    if (isOpen && wrapperRef.value) {
        document.addEventListener('mousedown', handleClickOutside);

        const rect = wrapperRef.value.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const dropdownHeight = props.options.length * 44 + 24;
        const newStyle: CSSProperties = { position: 'absolute' };

        if (rect.right + 200 > viewportWidth) {
            newStyle.right = '100%';
            newStyle.marginRight = '6px';
            newStyle.left = 'auto';
        } else {
            newStyle.left = '100%';
            newStyle.marginLeft = '6px';
            newStyle.right = 'auto';
        }

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            newStyle.top = 'auto';
            newStyle.bottom = '100%';
            newStyle.marginBottom = '6px';
        } else if (spaceBelow < dropdownHeight) {
            newStyle.top = '100%';
            newStyle.marginTop = '6px';
            newStyle.bottom = 'auto';
        } else if (rect.top < dropdownHeight) {
            newStyle.top = '100%';
            newStyle.marginTop = '6px';
            newStyle.bottom = 'auto';
        } else {
            newStyle.top = '50%';
            newStyle.transform = 'translateY(-50%)';
            newStyle.bottom = 'auto';
        }
        dropdownStyle.value = newStyle;
        requestAnimationFrame(() => {
            mounted.value = true;
        });
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
        mounted.value = false;
    }
});

// 展开时聚焦搜索框；输入框回显 label 时只聚焦不做全选，让回显文字保持未选中状态
watch([open, () => props.showSearch, searchValue, () => props.modelValue], ([isOpen]) => {
    if (!props.showSearch || !isOpen) return;
    searchRef.value?.focus();
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});

/** 清除按钮只在 allowClear 且有值、未禁用、悬停时出现 */
const showClear = computed(() => props.allowClear && Boolean(props.modelValue) && !props.disabled && hovered.value);
</script>

<template>
    <div
        ref="wrapperRef"
        class="animal-select"
        :class="{ 'animal-select--disabled': disabled }"
        v-bind="attrs"
        @keydown="handleKeyDown"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
    >
        <div
            ref="triggerRef"
            class="animal-select__trigger"
            :class="{ 'animal-select__trigger--disabled': disabled, 'animal-select__trigger--open': open }"
            :role="showSearch ? undefined : 'combobox'"
            :tabindex="showSearch || disabled ? undefined : 0"
            :aria-disabled="showSearch ? undefined : disabled || undefined"
            :aria-haspopup="showSearch ? undefined : 'listbox'"
            :aria-expanded="showSearch ? undefined : open"
            :aria-controls="showSearch || !open ? undefined : listboxId"
            :aria-activedescendant="showSearch || !open || !activeKey ? undefined : optionId(activeKey)"
            :aria-label="ariaLabel"
            :aria-labelledby="ariaLabelledBy"
            @click="
                (e) => {
                    if (disabled) return;
                    // 点搜索框内部只是为了移动光标，不应该把已展开的下拉收起来
                    if (showSearch && e.target === searchRef && open) return;
                    handleToggle();
                }
            "
        >
            <input
                v-if="showSearch"
                ref="searchRef"
                class="animal-select__search-input"
                role="combobox"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                :aria-expanded="open"
                :aria-controls="open ? listboxId : undefined"
                :aria-activedescendant="open && activeKey ? optionId(activeKey) : undefined"
                :aria-label="ariaLabel"
                :aria-labelledby="ariaLabelledBy"
                :value="open ? (searchValue ?? labelForInput) : labelForInput"
                :placeholder="placeholder"
                :disabled="disabled"
                autocomplete="off"
                @input="handleSearchInput"
            />
            <span v-else class="animal-select__value" :class="{ 'animal-select__value--placeholder': !modelValue }">
                {{ currentLabel }}
            </span>
            <button
                v-if="showClear"
                type="button"
                class="animal-select__clear"
                :aria-label="clearAriaLabel"
                tabindex="-1"
                @click="handleClear"
                @mousedown.prevent
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                        d="M3 3L9 9M9 3L3 9"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
            <span class="animal-select__arrow" :class="{ 'animal-select__arrow--open': open }" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </span>
        </div>
        <div
            v-if="open && mounted"
            :id="listboxId"
            class="animal-select__dropdown"
            :style="dropdownStyle"
            role="listbox"
            :aria-label="ariaLabel"
            :aria-labelledby="ariaLabelledBy"
        >
            <!-- listbox 必须包含 option（aria-required-children），所以空态渲染成禁用的 option -->
            <div
                v-if="filteredOptions.length === 0"
                class="animal-select__not-found"
                role="option"
                aria-disabled="true"
                aria-selected="false"
            >
                <slot name="not-found">{{ notFoundContent }}</slot>
            </div>
            <div
                v-for="option in filteredOptions"
                :id="optionId(option.key)"
                :key="option.key"
                class="animal-select__option"
                :class="{
                    'animal-select__option--active': modelValue === option.key,
                    'animal-select__option--hovered': hoveredKey === option.key,
                }"
                role="option"
                :aria-selected="modelValue === option.key"
                @click="handleSelect(option.key)"
                @mouseenter="
                    hoveredKey = option.key;
                    activeKey = option.key;
                "
                @mouseleave="hoveredKey = null"
            >
                <span class="animal-select__spacer" aria-hidden="true" />
                {{ option.label }}
                <div v-if="modelValue === option.key" class="animal-select__highlight" />
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import '@/styles/variables.less';

.animal-select {
    position: relative;
    display: inline-block;
    min-width: 140px;
    font-family: @font-family;
    user-select: none;

    &__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: @spacing-sm 13px;
        background: #fff;
        border: 2px solid #e8dcc8;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            border-color: #d4c4a8;
            background: #fffdf7;
        }

        // React .trigger.open：展开期间 hover 保持纯白，避免底色闪动
        &--open,
        &--open:hover {
            background: #fff;
            border-radius: 12px;
        }

        &--disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: #f5f5f0;

            &:hover {
                background: #f5f5f0 !important;
                border-color: #e8dcc8 !important;
            }
        }
    }

    &__value {
        font-size: @font-size-base;
        color: #725d42;
        font-weight: 600;

        &--placeholder {
            color: #a09080;
            font-weight: 400;
        }
    }

    // 搜索模式下由 input 取代只读文本，两者共享 trigger 的排版
    &__search-input {
        flex: 1;
        min-width: 0;
        padding: 0;
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        color: #725d42;
        background: transparent;
        border: none;
        outline: none;

        &::placeholder {
            color: #a09080;
            font-weight: 400;
        }

        &:disabled {
            cursor: not-allowed;
        }
    }

    // 清除按钮仅在悬停时出现（见 showClear）
    &__clear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-right: 6px;
        padding: 0;
        color: @text-color-disabled;
        cursor: pointer;
        background: transparent;
        border: none;
        border-radius: 50%;
        transition: all @motion-duration-fast @motion-ease;

        &:hover {
            color: #725d42;
            background: rgba(114, 93, 66, 0.1);
        }

        &:focus-visible {
            outline: 2px solid @primary-color;
            outline-offset: 1px;
        }
    }

    &__not-found {
        padding: 10px 14px;
        font-size: 14px;
        font-weight: 500;
        color: #a09080;
        text-align: center;
        white-space: nowrap;
    }

    &__arrow {
        display: flex;
        align-items: center;
        color: #a09080;
        transition: transform 0.2s;

        &--open {
            transform: rotate(180deg);
            color: @primary-color;
        }
    }

    &__dropdown {
        background: #ffeea0;
        border-radius: 28px;
        padding: @spacing-md 0;
        z-index: 100;
        overflow: visible;
        opacity: 0;
        animation: animal-select-fade-in 0.2s ease forwards;
    }

    &__option {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 30px 10px 14px;
        font-size: @font-size-base;
        font-weight: 500;
        color: #725d42;
        cursor: pointer;
        white-space: nowrap;

        &--active {
            z-index: 1;
            font-weight: 700;
        }

        &--hovered {
            font-weight: 700;

            // 纯 CSS 三角箭头指示（与 React select.module.less 的 .option:hover::before 完全一致），
            // 不再依赖 select-cursor.svg 位图资源
            &::before {
                content: '';
                position: absolute;
                left: -14px;
                top: 50%;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-top: 7px solid transparent;
                border-bottom: 7px solid transparent;
                border-left: 10px solid #f5a623;
                animation: animal-select-cursor-in 0.5s ease-out forwards;
            }
        }
    }

    &__spacer {
        width: 16px;
        font-size: 12px;
    }

    &__highlight {
        position: absolute;
        left: 0;
        right: 0;
        top: 56%;
        transform: translateY(-50%);
        height: 14px;
        margin: 0 20px;
        background: #ffcc00;
        border-radius: 7px;
        z-index: -1;
        opacity: 0.3;
    }
}

@keyframes animal-select-fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes animal-select-cursor-in {
    0% {
        opacity: 0;
        transform: translateY(-50%) translateX(-20px) rotate(-15deg);
    }
    60% {
        opacity: 1;
        transform: translateY(-50%) translateX(5px) rotate(5deg);
    }
    100% {
        opacity: 1;
        transform: translateY(-50%) translateX(0) rotate(0deg);
    }
}
</style>
