// ============================================
// Upload — 类型定义（对齐 React 版 animal-island-ui）
// ============================================

/** 单个文件的状态 */
export type UploadFileStatus = 'uploading' | 'done' | 'error' | 'removed';

/** 文件列表的展示形态 */
export type UploadListType = 'text' | 'picture' | 'picture-card';

/** 文件列表项（组件内部以 uid 追踪） */
export interface UploadFile {
    /** 唯一标识 */
    uid: string;
    /** 文件名 */
    name: string;
    /** 字节数 */
    size?: number;
    /** MIME 类型 */
    type?: string;
    /** 上传状态，默认 'uploading'；删除时经 change 上报为 'removed' */
    status?: UploadFileStatus;
    /** 上传进度 0–100 */
    percent?: number;
    /** 下载/服务端地址（语义上区别于缩略图）；由自定义/受控 fileList 或服务端提供 */
    url?: string;
    /** 缩略图地址（与本地上传时组件自动生成的 ObjectURL）；展示时优先于 url */
    thumbUrl?: string;
    /** 用户选择的原始 File 对象（beforeUpload 返回转换后的 File 时，这里仍是未转换的原始文件） */
    originFileObj?: File;
    /** 服务端返回（action XHR 的 response，或 customRequest 调 onSuccess(resp) 时传入） */
    response?: unknown;
    /** 失败信息（action XHR 出错，或 customRequest 调 onError(err) 时传入） */
    error?: unknown;
}

/** customRequest 收到的回调集合 */
export interface UploadCustomRequestOptions {
    file: File;
    /** 上报进度 0–100 */
    onProgress: (percent: number) => void;
    /** 标记成功，可附带服务端返回 */
    onSuccess: (response?: unknown) => void;
    /** 标记失败，可附带错误信息 */
    onError: (error?: unknown) => void;
}

/** change 事件收到的信息（file 为本次变化的文件，fileList 为最新列表） */
export interface UploadChangeParam {
    /** 本次发生变化的文件 */
    file: UploadFile;
    /** 最新文件列表（受控模式下以此为准） */
    fileList: UploadFile[];
    /** 进度事件（仅 XHR 上传进度跳变时携带） */
    event?: ProgressEvent;
}

/** 列表显隐配置（布尔形式等价 `{ showPreviewIcon: true, showRemoveIcon: true }`） */
export interface UploadShowUploadList {
    /** 是否显示预览图标（picture-card 下点击缩略图触发 preview），默认 true */
    showPreviewIcon?: boolean;
    /** 是否显示删除图标，默认 true */
    showRemoveIcon?: boolean;
}

export interface UploadProps {
    /** 接受的文件类型，透传给 <input accept>，如 "image/*" 或 ".pdf,.png" */
    accept?: string;
    /** 是否支持多选 */
    multiple?: boolean;
    /**
     * 最多上传的文件数。语义如下：
     * - `1`：新文件替换已有的那个（头像 / 单文件场景）
     * - `>1`：保留最早的 N 个，超出的新文件直接丢弃且不触发 change（改用 exceed 事件通知）
     * 触发区 / 添加块始终可点，由消费方决定是否自行隐藏。
     * `0` 或负数视为未设置（不限量）。
     */
    maxCount?: number;
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否按目录选择上传（透传 webkitdirectory，浏览器支持整文件夹选择） */
    directory?: boolean;
    /** 文件列表（受控，v-model）；传入后列表完全由外部驱动 */
    modelValue?: UploadFile[];
    /** 默认文件列表（非受控） */
    defaultFileList?: UploadFile[];
    /** 列表形态：text 文件行 / picture 带行内缩略图 / picture-card 图片卡片，默认 'text' */
    listType?: UploadListType;
    /** 是否展示文件列表，或传入对象分别控制预览/删除图标，默认 true */
    showUploadList?: boolean | UploadShowUploadList;
    /** 是否开启拖拽上传区域 */
    drag?: boolean;
    /** 触发区下方的提示文字 */
    tip?: string;
    /** 无可见说明时的无障碍标签（默认「上传文件」） */
    ariaLabel?: string;
    /**
     * 上传前的钩子；返回 false（或 Promise<false> / 抛错）则跳过该文件，
     * 返回 File（或 Promise<File>）则改为上传该转换后的文件。
     * 以 prop 函数形式提供（组件需要其返回值决定是否跳过）。
     */
    beforeUpload?: (file: File, fileList: File[]) => boolean | File | Promise<boolean | File>;
    /** 自定义上传实现；优先级高于 action（若同时提供则优先 customRequest） */
    customRequest?: (options: UploadCustomRequestOptions) => void;
    /**
     * 上传地址；提供时用原生 XMLHttpRequest 真实上传（优先级低于 customRequest）。
     * 也接受 (file) => 地址 或异步 (file) => Promise<地址> 的形式（便于每文件取 OSS 直传签名）。
     * 解析结果为空字符串时该文件标记为 error，不会静默停在 uploading。
     */
    action?: string | ((file: File) => string | Promise<string>);
    /** 请求方法，默认 POST */
    method?: 'POST' | 'PUT' | 'PATCH';
    /** 追加到请求的自定义请求头 */
    headers?: Record<string, string>;
    /** 随文件一起提交的附加表单字段；也接受 (file) => 字段 或异步 (file) => Promise<字段> 的形式 */
    data?:
        | Record<string, unknown>
        | ((file: File) => Record<string, unknown> | undefined | Promise<Record<string, unknown> | undefined>);
    /** 文件字段名，默认 'file' */
    name?: string;
    /** 是否携带跨域凭证（withCredentials） */
    withCredentials?: boolean;
    /** 删除前的钩子；返回 false（或 Promise<false> / 抛错）则阻止删除 */
    onRemove?: (file: UploadFile) => boolean | void | Promise<boolean | void>;
}
