export type RateSize = 'small' | 'middle' | 'large';

export interface RateProps {
    /** 当前评分（受控，对应 v-model） */
    modelValue?: number;
    /** 当前评分（受控，React `value` prop 的别名，优先级高于 modelValue） */
    value?: number;
    /** 默认评分（非受控初始值） */
    defaultValue?: number;
    /** 星星总数 */
    count?: number;
    /** 尺寸 */
    size?: RateSize;
    /** 只读，仅展示不可交互 */
    readonly?: boolean;
    /** 再次点击同一颗星时清空评分 */
    allowClear?: boolean;
}
