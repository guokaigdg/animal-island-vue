export type CalendarColor = 'teal' | 'amber' | 'coral' | 'green' | 'purple';

/** 事项标题：纯文本或数字。结构化内容请改用 `event` 插槽自定义渲染 */
export type CalendarEventTitle = string | number;

/** 日历事项：同一天用同一个日期，跨天传不同的 start / end */
export interface CalendarEvent {
    /** 事项内容 */
    title?: CalendarEventTitle;
    /** 开始日期：YYYY-MM-DD 或 YYYY-MM-DD HH:mm 字符串 */
    start: string;
    /** 结束日期，省略时等同于 start；传入时渲染成跨天的连续事项条 */
    end?: string;
    /** 颜色，默认 teal */
    color?: CalendarColor;
    /** 是否在事项条首段展示起始时间 HH:mm（跨周续接段不重复展示） */
    showTime?: boolean;
}

export interface CalendarProps {
    /** 当前选中日期（受控，对应 v-model），YYYY-MM-DD */
    modelValue?: string;
    /** 当前选中日期（受控，React `value` prop 的别名，优先级高于 modelValue），YYYY-MM-DD */
    value?: string;
    /** 默认选中日期（非受控），YYYY-MM-DD；不传时默认选中今天 */
    defaultValue?: string;
    /** 面板当前展示的月份（受控），YYYY-MM 或 YYYY-MM-DD；传入后必须配合 `panelChange` 回写，否则面板无法翻月 */
    panelValue?: string;
    /** 默认展示的月份（非受控），YYYY-MM 或 YYYY-MM-DD；不传时跟随选中值 / 今天 */
    defaultPanelValue?: string;
    /** 事项列表。布局按数组引用缓存，就地改 `start` / `end` 不会重新排布，变更请传入新数组 */
    events?: CalendarEvent[];
    /** 是否在事项条上展示起始时间，默认 true */
    showEventTime?: boolean;
    /** 是否允许鼠标拖拽跨日期创建事项（松手时通过 `eventCreate` 回调） */
    draggableEvents?: boolean;
    /** 面板宽度，默认铺满父容器（数值按 px 处理）。行高、字号与事项密度都由实际宽度推导 */
    width?: number | string;
    /** 无可见标题时给面板一个无障碍标签 */
    ariaLabel?: string;
    /** 关联外部可见 label 的 id */
    ariaLabelledBy?: string;
}
