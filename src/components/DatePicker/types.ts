export type DatePickerSize = 'small' | 'middle' | 'large';

export type DatePickerStatus = 'error' | 'warning';

/** 选中值：日期模式为 YYYY-MM-DD，范围模式为 [开始, 结束]，清空为 null */
export type DatePickerValue = string | [string, string] | null;

export interface DatePickerProps {
    /** 范围选择模式：联动选择开始日期与结束日期 */
    range?: boolean;
    /** 选择粒度：date 选择日期（YYYY-MM-DD），month 选择月份（YYYY-MM），面板直接打开月份网格 */
    picker?: 'date' | 'month';
    /** 当前选中值（受控）；日期模式为 YYYY-MM-DD，范围模式为 [开始, 结束]，清空为 null */
    modelValue?: DatePickerValue;
    /** 默认选中值（非受控）；日期模式为 YYYY-MM-DD，范围模式为 [开始, 结束] */
    defaultValue?: string | [string, string];
    /** 占位文本 */
    placeholder?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否允许一键清空 */
    allowClear?: boolean;
    /** 尺寸 */
    size?: DatePickerSize;
    /** 校验状态 */
    status?: DatePickerStatus;
    /** 展示格式，支持 YYYY / MM / DD / M / D 占位符，默认 YYYY-MM-DD（month 模式默认 YYYY-MM） */
    format?: string;
    /** 禁用日期判断函数，返回 true 的日期不可选 */
    disabledDate?: (date: Date) => boolean;
    /** 受控展开状态 */
    open?: boolean;
    /** 面板底部是否显示「今天」快捷按钮 */
    showToday?: boolean;
    /** 对外暴露的无障碍标签（无可见 label 时使用） */
    ariaLabel?: string;
    /** 关联外部可见 label 的 id */
    ariaLabelledBy?: string;
}
