export interface SelectOption {
    key: string;
    label: string;
}

/** 过滤规则：true 按 optionFilterProp 匹配、false 不过滤、传函数则自行判定 */
export type SelectFilterOption = boolean | ((inputValue: string, option: SelectOption) => boolean);

export interface SelectProps {
    modelValue: string;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    /** 允许一键清空当前选中值 */
    allowClear?: boolean;
    /** 清除按钮的无障碍标签，默认「清除」 */
    clearAriaLabel?: string;
    /** 允许在触发区内输入关键字过滤选项 */
    showSearch?: boolean;
    /** 过滤规则，默认 true */
    filterOption?: SelectFilterOption;
    /** filterOption 为 true 时参与匹配的字段，默认 'label' */
    optionFilterProp?: 'key' | 'label';
    /** 无匹配选项时展示的文案，默认「暂无数据」；需要富文本时改用 #not-found 插槽 */
    notFoundContent?: string;
    /** 对外暴露的无障碍标签（无可见 label 时使用） */
    ariaLabel?: string;
    /** 关联外部可见 label 的 id */
    ariaLabelledBy?: string;
}
// 插槽：
//   #not-found — 无匹配时的自定义内容，优先于 notFoundContent
// Emits:
//   update:modelValue (string)
//   change (string) — 选中项变化，清空时为 ''
//   clear () — 通过清除按钮清空时触发
//   search (string) — 搜索词变化，收起时以空串通知一次
