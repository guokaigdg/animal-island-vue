export type CardType = 'default' | 'dashed';

export type CardColor =
    | 'default'
    | 'app-pink'
    | 'purple'
    | 'app-blue'
    | 'app-yellow'
    | 'app-orange'
    | 'app-teal'
    | 'app-green'
    | 'app-red'
    | 'lime-green'
    | 'yellow-green'
    | 'brown'
    | 'warm-peach-pink';

export type CardPattern =
    | 'none'
    | 'default'
    | 'app-pink'
    | 'purple'
    | 'app-blue'
    | 'app-yellow'
    | 'app-orange'
    | 'app-teal'
    | 'app-green'
    | 'app-red'
    | 'lime-green'
    | 'yellow-green'
    | 'brown'
    | 'warm-peach-pink';

export interface CardProps {
    type?: CardType;
    color?: CardColor;
    pattern?: CardPattern;
    /**
     * 是否启用 hover 效果（光标 pointer + translateY -2px）。
     * 默认 `false`（只读卡片）：无 hover、无 cursor 变化。
     * 设为 `true` 开启（可点击卡片 / 列表项等交互场景）。
     * @default false
     */
    hoverable?: boolean;
}
