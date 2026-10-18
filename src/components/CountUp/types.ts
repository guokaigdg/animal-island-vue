export type CountUpSize = 'small' | 'middle' | 'large';

export type CountUpVariant = 'default' | 'island';

/** 内置缓动曲线名 */
export type CountUpEasingName = 'linear' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeOutExpo';

/** 自定义缓动：入参是 0→1 的线性进度，返回 0→1 的缓动进度 */
export type CountUpEasingFunction = (progress: number) => number;

export type CountUpEasing = CountUpEasingName | CountUpEasingFunction;

/** 插槽暴露给默认插槽的状态 */
export interface CountUpRenderState {
    /** 当前展示值 */
    value: number;
    /** 重置到起始值并重新播放 */
    reset: (newStartAt?: number) => void;
}

export interface CountUpCelebrateOptions {
    /** 贴纸文案；需要富文本时改用 #celebrate 插槽 */
    text?: string;
}

export interface CountUpProps {
    /** 起始值，默认 0 */
    start?: number;
    /** 目标值（比如本局总分） */
    end: number;
    /** 动画时长（秒），默认 2；传 0 直接显示目标值 */
    duration?: number;
    /** 是否正在计数，默认 false。改为 false 会暂停并保留当前值，再改回 true 从暂停处继续 */
    isCounting?: boolean;
    /** 小数位数，默认取 start / end 中较大的小数位数 */
    decimalPlaces?: number;
    /** 小数点符号，默认 '.' */
    decimalSeparator?: string;
    /** 千分位符号，默认 ''（不分组） */
    thousandsSeparator?: string;
    /** 缓动曲线，默认 'easeOutCubic' */
    easing?: CountUpEasing;
    /** 数字格式化，优先级高于 decimalPlaces / decimalSeparator / thousandsSeparator；需要完全接管渲染请用默认插槽 */
    formatter?: (value: number) => string | number;
    /** 展示值刷新间隔（秒），0 表示每帧刷新，默认 0 */
    updateInterval?: number;
    /** 尺寸 */
    size?: CountUpSize;
    /** 显示风格 */
    variant?: CountUpVariant;
    /** 数字块是否带边框，默认无 */
    bordered?: boolean;
    /**
     * 数码管式逐位滚动：每个数字位是一根独立的滚轮，值变化时该位向上/向下滚到新数字，
     * 非数字字符（分隔符、前后缀）保持静止。默认关闭，此时就是普通的数值插值。
     *
     * Vue 端独有：React 的 CountUp 没有逐位滚动（上游只有数值缓动插值），
     * 所以这是 opt-in 的扩展能力，关掉后行为与 React 完全一致。
     */
    digitRoll?: boolean;
    /** 计数结束后的庆祝动效（数字弹跳 + 光环 + 星芒），默认关闭；传对象并带 text 可额外弹出一张贴纸 */
    celebrate?: boolean | CountUpCelebrateOptions;
    /** 结束后自动重播（Vue 的 emit 无法返回值，故重播改由这两个 prop 声明式驱动） */
    repeat?: boolean;
    /** 重播前的等待时间（秒），默认 0 */
    repeatDelay?: number;
    /** 重播时的起始值，默认回到 start */
    repeatStartAt?: number;
    // 插槽：
    //   #prefix / #suffix — 数字前缀 / 后缀（React 版是 ReactNode prop）
    //   #celebrate       — 庆祝贴纸文案，优先于 celebrate.text
    //   #default         — 作用域插槽 { value, reset }，完全接管数字渲染
    // 注：数字块整体对辅助技术隐藏（aria-hidden），可聚焦元素请放到组件外面
}
// Emits:
//   update (value: number) — 展示值更新时触发（每帧，与 updateInterval 无关）
//   complete (elapsedTime: number) — 计数结束时触发，单位秒
// 通过 ref 暴露 reset(newStartAt?)，可主动重播
