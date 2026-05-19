export interface ModalProps {
    open: boolean;
    title?: string;
    width?: number | string;
    maskClosable?: boolean;
    showFooter?: boolean;
    /** 启用打字机效果（每次 open 切换为 true 时重启） */
    typewriter?: boolean;
    /** 打字机每字间隔 (ms) */
    typeSpeed?: number;
}
