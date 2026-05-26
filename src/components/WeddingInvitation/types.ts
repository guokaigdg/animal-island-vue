import type { CSSProperties, VNode } from 'vue';

export interface WeddingInvitationProps {
    /** 新郎名 */
    groomName?: string;
    /** 新娘名 */
    brideName?: string;
    /** 婚礼日期，例如 "2026.06.15" */
    date?: string;
    /** 星期，例如 "星期六" */
    weekday?: string;
    /** 时间，例如 "10:00 AM" */
    time?: string;
    /** 婚礼地点 */
    venue?: string;
    /** 地点详细地址 */
    address?: string;
    /** 标题 —— 字符串；如需富内容请用 #title 插槽 */
    title?: string;
    /** 副标题 —— 字符串；如需富内容请用 #subtitle 插槽 */
    subtitle?: string;
    /** 主信息（动森风邀请语）—— 字符串；如需富内容请用 #message 插槽 */
    message?: string;
    /** 是否显示底部抽奖号码区，默认 true */
    showLotteryNumber?: boolean;
    /** 抽奖号码，默认 '0001' */
    lotteryNumber?: string;
    /** 抽奖号码区前缀文案，默认 'LUCKY NUMBER' */
    lotteryLabel?: string;
    /** 抽奖号码区底部说明文案 */
    lotteryHint?: string;
    /** 自定义类名 */
    class?: string;
    /** 自定义样式 */
    style?: CSSProperties | string;
}

/** 通过模板 ref 暴露的方法 */
export interface WeddingInvitationExpose {
    /** 把请柬导出为 PNG 图片并触发浏览器下载 */
    exportAsImage: (filename?: string) => Promise<void>;
    /** 获取请柬 DOM 根节点 */
    getElement: () => HTMLDivElement | null;
}

export interface WeddingInvitationExportButtonProps {
    /** 关联的请柬 ref */
    target: WeddingInvitationExpose | null | undefined;
    /** 文件名（不含扩展名） */
    filename?: string;
    /** 自定义类名 */
    class?: string;
    /** 自定义样式 */
    style?: CSSProperties | string;
}

// 仅供文档/类型扩展占位
export type WeddingNode = string | VNode;
