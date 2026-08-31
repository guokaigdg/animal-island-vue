export interface CodeBlockProps {
    /** 要高亮的 JSX / TypeScript 源码 */
    code: string;
    /** 是否显示复制按钮，默认 true */
    copyable?: boolean;
}
