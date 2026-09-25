<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref, useSlots, watch } from 'vue';
import Icon from '../Icon/Icon.vue';
import type { UploadChangeParam, UploadFile, UploadProps } from './types';

const props = withDefaults(defineProps<UploadProps>(), {
    accept: undefined,
    multiple: false,
    maxCount: undefined,
    disabled: false,
    directory: false,
    modelValue: undefined,
    defaultFileList: undefined,
    listType: 'text',
    showUploadList: true,
    drag: false,
    tip: undefined,
    ariaLabel: undefined,
    beforeUpload: undefined,
    customRequest: undefined,
    action: undefined,
    method: 'POST',
    headers: undefined,
    data: undefined,
    name: undefined,
    withCredentials: false,
    onRemove: undefined,
});

const emit = defineEmits<{
    (e: 'update:modelValue', fileList: UploadFile[]): void;
    (e: 'change', info: UploadChangeParam): void;
    (e: 'preview', file: UploadFile): void;
    (e: 'exceed', files: File[], fileList: UploadFile[]): void;
}>();

let uidSeed = 0;
const genUid = () => `animal-upload-${Date.now().toString(36)}-${(uidSeed += 1)}`;

const clampPercent = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** 字节数格式化为 B / KB / MB */
const formatFileSize = (size?: number): string => {
    if (size === undefined || size === null || Number.isNaN(size)) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * 按 accept 校验单个文件（拖拽进来的文件不受 <input accept> 约束，必须自己过滤）。
 * 规则同浏览器：`.ext` 比扩展名、`image/*` 比主类型、`image/png` 精确比 MIME。
 */
const matchAccept = (file: File, accept?: string): boolean => {
    if (!accept) return true;
    const patterns = accept
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    if (patterns.length === 0) return true;
    const name = (file.name || '').toLowerCase();
    const mime = (file.type || '').toLowerCase();
    // 部分系统拖进来的文件没有 MIME 信息，此时只按扩展名判断，避免误杀
    if (!mime) return patterns.some((p) => p.startsWith('.') && name.endsWith(p));
    const baseMime = mime.replace(/\/.*$/, '');
    return patterns.some((p) => {
        if (p.startsWith('.')) return name.endsWith(p);
        if (p.endsWith('/*')) return baseMime === p.replace(/\/.*$/, '');
        return mime === p;
    });
};

// ---------- 列表状态 ----------
const isControlled = computed(() => props.modelValue !== undefined);
const innerList = ref<UploadFile[]>(props.defaultFileList ?? []);
const list = computed<UploadFile[]>(() => (isControlled.value ? (props.modelValue ?? []) : innerList.value));
// 同步追踪当前列表：同一次事件里 commit 后立即 patchFile（如模拟进度首跳）需读到新列表
let listRef: UploadFile[] = list.value;
watch(
    list,
    (v) => {
        listRef = v;
    },
    { immediate: true }
);

// ---------- 展示配置 ----------
const listVisible = computed(() => props.showUploadList !== false);
const showRemoveIcon = computed(() =>
    typeof props.showUploadList === 'object' ? props.showUploadList.showRemoveIcon !== false : true
);
const showPreviewIcon = computed(() =>
    typeof props.showUploadList === 'object' ? props.showUploadList.showPreviewIcon !== false : true
);

// ---------- 引用与 UI 状态 ----------
const inputRef = ref<HTMLInputElement | null>(null);
const closeBtnRef = ref<HTMLButtonElement | null>(null);
const previewLayerRef = ref<HTMLDivElement | null>(null);
const dragging = ref(false);
const dragDepth = ref(0);
const previewTarget = ref<UploadFile | null>(null);

// uid -> 模拟上传定时器 / 组件生成的 ObjectURL / 真实 XHR（卸载与删除时清理）
const timers = new Map<string, ReturnType<typeof setInterval>>();
const blobUrls = new Map<string, string>();
const xhrRef = new Map<string, XMLHttpRequest>();

// ---------- 插槽与 preview 监听探测 ----------
const slots = useSlots() as { default?: (...args: never[]) => unknown };
const hasSlot = computed(() => Boolean(slots.default));
const instance = getCurrentInstance();
// 消费方是否监听了 preview 事件：监听了则由消费方处理预览，否则组件内置大图弹层
const hasPreview = computed(() =>
    Boolean((instance?.vnode.props as Record<string, unknown> | undefined)?.['onPreview'])
);

// ---------- 图片预览 ----------
// 缩略图优先取 thumbUrl，回退到 url（下载/服务端地址）。
const previewSrc = (file: UploadFile) => file.thumbUrl ?? file.url;
const isImage = (file: UploadFile) =>
    Boolean(file.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(file.name || ''));
const canPreview = (file: UploadFile) => Boolean(previewSrc(file)) && isImage(file);

const openPreview = (file: UploadFile) => {
    if (hasPreview.value) {
        emit('preview', file);
        return;
    }
    if (previewSrc(file)) previewTarget.value = file;
};

// 预览目标若已从列表移除（被删除 / 被替换），它的 ObjectURL 已被 revoke，
// 继续展示会裂图 —— 这里直接关闭弹层。
watch(list, (current) => {
    if (previewTarget.value && !current.some((f) => f.uid === previewTarget.value!.uid)) {
        previewTarget.value = null;
    }
});

// ---------- 内置预览弹层：焦点陷阱 + 背景滚动锁 + Esc ----------
let restoredOverflow: string | null = null;
let openerEl: HTMLElement | null = null;
const onPreviewKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        previewTarget.value = null;
        return;
    }
    // 焦点陷阱：弹层打开时 Tab 不该跑到背景内容上，在弹层内循环
    if (e.key !== 'Tab') return;
    const focusables = Array.from(
        previewLayerRef.value?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
    );
    if (focusables.length === 0) {
        e.preventDefault();
        closeBtnRef.value?.focus();
        return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === previewLayerRef.value)) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
    }
};
watch(previewTarget, (target) => {
    if (target) {
        document.addEventListener('keydown', onPreviewKey);
        // 打开期间锁住背景滚动（关闭时恢复原值，避免覆盖消费方自己的样式）
        restoredOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        // 打开时把焦点移入弹层
        openerEl = document.activeElement as HTMLElement | null;
        void nextTick(() => closeBtnRef.value?.focus());
    } else {
        document.removeEventListener('keydown', onPreviewKey);
        if (restoredOverflow !== null) document.body.style.overflow = restoredOverflow;
        restoredOverflow = null;
        openerEl?.focus?.();
        openerEl = null;
    }
});

// ---------- 资源管理 ----------
const stopTransfer = (uid: string) => {
    const timer = timers.get(uid);
    if (timer !== undefined) {
        clearInterval(timer);
        timers.delete(uid);
    }
    const xhr = xhrRef.get(uid);
    if (xhr) {
        xhr.abort();
        xhrRef.delete(uid);
    }
};

// 停止传输并释放组件生成的 ObjectURL。
const releaseFile = (uid: string) => {
    stopTransfer(uid);
    const blobUrl = blobUrls.get(uid);
    if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        blobUrls.delete(uid);
    }
};

// 统一提交入口：非受控更新内部 state，受控只通知（列表由外部回传）。
// changed 为本次变化的文件；event 仅 XHR 进度跳变时携带。
// notify=false 时只更新列表不上报 change（maxCount 满员丢弃新文件的场景）。
const commit = (next: UploadFile[], changed?: UploadFile, event?: ProgressEvent, notify = true) => {
    listRef = next;
    if (!isControlled.value) innerList.value = next;
    emit('update:modelValue', next);
    if (notify) emit('change', { file: changed ?? next[0], fileList: next, event });
};

const patchFile = (uid: string, patch: Partial<UploadFile>, event?: ProgressEvent) => {
    // 文件已不在列表（被删除、被丢弃、受控下被外部移除）时忽略迟到的回调：
    // 否则会误报 change，且 file 会兜底成 undefined 让消费方崩溃。
    if (!listRef.some((f) => f.uid === uid)) return;
    const next = listRef.map((f) => (f.uid === uid ? { ...f, ...patch } : f));
    const changed = next.find((f) => f.uid === uid)!;
    commit(next, changed, event);
};

const clearTimers = () => {
    timers.forEach((t) => clearInterval(t));
    timers.clear();
    xhrRef.forEach((xhr) => xhr.abort());
    xhrRef.clear();
    blobUrls.forEach((url) => URL.revokeObjectURL(url));
    blobUrls.clear();
};

const onBeforeUnmountCleanup = () => {
    clearTimers();
    document.removeEventListener('keydown', onPreviewKey);
    if (restoredOverflow !== null) document.body.style.overflow = restoredOverflow;
};
onBeforeUnmount(onBeforeUnmountCleanup);

// 受控模式下外部直接移除列表项时组件无从感知，这里 diff 一次补做资源清理，
// 否则该文件的 ObjectURL 会一直泄漏到组件卸载（被移除图片的 blob 无法回收）。
let prevUids: string[] = [];
watch(
    list,
    (current) => {
        const uids = current.map((f) => f.uid);
        if (!isControlled.value) {
            prevUids = uids;
            return;
        }
        const currentUids = new Set(uids);
        prevUids.forEach((uid) => {
            if (!currentUids.has(uid)) releaseFile(uid);
        });
        prevUids = uids;
    },
    { immediate: true, deep: true }
);

// ---------- 上传实现 ----------
// 默认上传实现：定时器模拟进度（每 220ms 增 12%–20%，走完后置 done）
const simulateUpload = (uid: string) => {
    patchFile(uid, { percent: 6 });
    const timer = setInterval(() => {
        const current = listRef.find((f) => f.uid === uid);
        const next = (current?.percent ?? 0) + 12 + Math.round(Math.random() * 8);
        if (next >= 100) {
            clearInterval(timer);
            timers.delete(uid);
            patchFile(uid, { percent: 100, status: 'done' });
        } else {
            patchFile(uid, { percent: next });
        }
    }, 220);
    timers.set(uid, timer);
};

// 真实上传实现：action 存在时用 XMLHttpRequest 提交 FormData，支持进度与取消。
const startRealUpload = async (file: File, uid: string) => {
    let resolvedAction: string;
    let resolvedData: Record<string, unknown> | undefined;
    try {
        resolvedAction = (typeof props.action === 'function' ? await props.action(file) : props.action) ?? '';
        resolvedData = typeof props.data === 'function' ? await props.data(file) : props.data;
    } catch (err) {
        patchFile(uid, { status: 'error', percent: 100, error: err });
        return;
    }
    // 解析期间文件可能已被删除 / 被丢弃，此时不该再发请求
    if (!listRef.some((f) => f.uid === uid)) return;
    // 地址为空（如签名接口返回空）时标记失败，否则文件会永久停在 uploading 0%
    if (!resolvedAction) {
        patchFile(uid, { status: 'error', percent: 100, error: new Error('upload action is empty') });
        return;
    }
    const xhr = new XMLHttpRequest();
    xhrRef.set(uid, xhr);

    const form = new FormData();
    form.append(props.name ?? 'file', file, file.name);
    if (resolvedData) {
        Object.entries(resolvedData).forEach(([key, value]) => {
            // Blob / File 直接透传，避免被 String() 序列化破坏（其余值转为字符串）
            if (value instanceof Blob) {
                form.append(key, value as Blob);
            } else {
                form.append(key, String(value));
            }
        });
    }

    xhr.open(props.method, resolvedAction, true);
    if (props.withCredentials) xhr.withCredentials = true;
    if (props.headers) {
        Object.entries(props.headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    }

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            patchFile(uid, { status: 'uploading', percent: clampPercent((e.loaded / e.total) * 100) }, e);
        }
    };
    xhr.onload = () => {
        xhrRef.delete(uid);
        const ok = xhr.status >= 200 && xhr.status < 300;
        patchFile(
            uid,
            ok
                ? { status: 'done', percent: 100, response: xhr.response }
                : { status: 'error', percent: 100, error: xhr.response }
        );
    };
    xhr.onerror = () => {
        xhrRef.delete(uid);
        patchFile(uid, { status: 'error', percent: 100, error: new Error('network error') });
    };
    xhr.onabort = () => {
        xhrRef.delete(uid);
    };
    xhr.send(form);
};

const runRequest = (file: File, uid: string) => {
    if (props.customRequest) {
        try {
            props.customRequest({
                file,
                onProgress: (pct) => patchFile(uid, { percent: clampPercent(pct), status: 'uploading' }),
                onSuccess: (response) => patchFile(uid, { status: 'done', percent: 100, response }),
                onError: (error) => patchFile(uid, { status: 'error', percent: 100, error }),
            });
        } catch (err) {
            // 同步抛错时不让它冒泡成未捕获的 rejection（会中断同批其他文件），
            // 直接把该文件标记为失败
            console.error('[Upload] customRequest threw:', err);
            patchFile(uid, { status: 'error', percent: 100, error: err });
        }
    } else if (props.action) {
        void startRealUpload(file, uid);
    } else {
        simulateUpload(uid);
    }
};

const handleFiles = async (rawFiles: File[]) => {
    if (props.disabled || rawFiles.length === 0) return;
    // multiple=false 时只取第一个：<input multiple={false}> 管不到拖拽进来的文件，
    // 拖入多个必须在这里截断，否则单选语义会被绕过。
    // directory（整文件夹选择）视为多选 —— 截断会让用户只上传到文件夹里的第一个文件。
    const truncated = props.multiple || props.directory ? rawFiles : rawFiles.slice(0, 1);
    // 拖拽同样绕不过 accept：<input accept> 只约束文件选择框，drop 进来的要自己过滤
    const rawFilesIn = truncated.filter((f) => matchAccept(f, props.accept));
    if (rawFilesIn.length === 0) return;
    // 0 / 负数视为未设置（否则 `added.length >= 0` 会让组件永远加不进文件）
    const limit = props.maxCount && props.maxCount > 0 ? props.maxCount : undefined;

    const added: UploadFile[] = [];
    const requests: Array<[File, string]> = [];
    // 因达到 maxCount 而压根没被处理的文件（循环 break 掉的），也要通知消费方
    let overflow: Array<File> = [];
    // uid -> 用户选择的原始 File（beforeUpload 可能返回转换后的文件，通知时回传原始的）
    const rawByUid = new Map<string, File>();

    for (let i = 0; i < rawFilesIn.length; i += 1) {
        const file = rawFilesIn[i];
        if (limit !== undefined && added.length >= limit) {
            overflow = rawFilesIn.slice(i);
            break;
        }
        let uploadFile: File = file;
        if (props.beforeUpload) {
            try {
                const res = await props.beforeUpload(file, rawFilesIn);
                if (res === false) continue;
                if (res instanceof File) uploadFile = res;
            } catch (err) {
                // 钩子自身抛错时不静默吞掉：否则用户选了文件却毫无反应，无从排查
                console.error('[Upload] beforeUpload threw, file skipped:', err);
                continue;
            }
        }
        const uid = genUid();
        const item: UploadFile = {
            uid,
            name: uploadFile.name,
            size: uploadFile.size,
            type: uploadFile.type,
            status: 'uploading',
            percent: 0,
            // 保留用户选择的原始文件：beforeUpload 转换过的话，上传的是转换后的那个
            originFileObj: file,
        };
        // 缩略图地址：图片文件自动生成 ObjectURL（text/picture 行预览与 picture-card 缩略图共用），
        // 存入 thumbUrl，与 url（下载/服务端地址）语义分离。
        if (uploadFile.type.startsWith('image/')) {
            const url = URL.createObjectURL(uploadFile);
            blobUrls.set(uid, url);
            item.thumbUrl = url;
        }
        added.push(item);
        requests.push([uploadFile, uid]);
        rawByUid.set(uid, file);
    }

    if (added.length === 0 && overflow.length === 0) return;
    const current = listRef;
    // maxCount 语义如下：
    // - 未设置：直接追加
    // - === 1：新文件替换已有的那个（slice(-1)）
    // - > 1：保留最早的 N 个，超出的新文件直接丢弃（slice(0, N)），且不触发 change
    let dropped: UploadFile[] = [];
    let next: UploadFile[];
    if (limit === undefined) {
        next = [...current, ...added];
    } else if (limit === 1) {
        const merged = [...current, ...added];
        next = merged.slice(-1);
        dropped = merged.slice(0, merged.length - 1);
    } else {
        const merged = [...current, ...added];
        next = merged.slice(0, limit);
        dropped = merged.slice(limit);
    }
    // 清理被丢弃项的定时器 / XHR / ObjectURL
    dropped.forEach((f) => releaseFile(f.uid));
    // 只保留下来的文件才发起上传；全部新文件都被丢弃时不上报 change。
    const keptUids = new Set(next.map((f) => f.uid));
    const keptAdded = added.filter((f) => keptUids.has(f.uid));
    // 超上限被丢弃的新文件：用 exceed 事件通知，否则消费方无从知晓用户选了文件却被拒。
    const addedUids = new Set(added.map((f) => f.uid));
    const exceedFiles = [
        ...dropped.filter((f) => addedUids.has(f.uid)).map((f) => rawByUid.get(f.uid)),
        ...overflow,
    ].filter((f): f is File => Boolean(f));
    if (exceedFiles.length > 0) emit('exceed', exceedFiles, next);
    // 一个新文件都没留下时不改列表（避免用同一个数组引用触发无意义的重渲染）
    if (added.length > 0) {
        commit(next, keptAdded[keptAdded.length - 1], undefined, keptAdded.length > 0);
        requests.filter(([, uid]) => keptUids.has(uid)).forEach(([file, uid]) => runRequest(file, uid));
    }
};

const handleRemove = async (file: UploadFile) => {
    if (props.disabled) return;
    if (props.onRemove) {
        let ok: boolean | void;
        try {
            ok = await props.onRemove(file);
        } catch (err) {
            console.error('[Upload] onRemove threw, removal blocked:', err);
            ok = false;
        }
        if (ok === false) return;
    }
    // 受控模式下只停止传输，不在这里释放 ObjectURL：外部 fileList 可能异步才移除该项，
    // 提前 revoke 会让中间帧的 <img> 指向已失效地址（裂图）。释放交给受控 diff。
    // 非受控模式列表由组件自己更新，可直接释放。
    if (isControlled.value) {
        stopTransfer(file.uid);
    } else {
        releaseFile(file.uid);
    }
    // 删除时以 status:'removed' 上报本次变化（便于消费方联动服务端删除）
    const removedFile: UploadFile = { ...file, status: 'removed' };
    commit(
        listRef.filter((f) => f.uid !== file.uid),
        removedFile
    );
};

const openFilePicker = () => {
    if (props.disabled) return;
    inputRef.value?.click();
};

const onInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    void handleFiles(Array.from(target.files ?? []));
    target.value = '';
};

// ---------- 拖拽：depth 计数避免子元素进出造成的闪烁 ----------
const onDragEnter = (e: DragEvent) => {
    if (!props.drag || props.disabled) return;
    e.preventDefault();
    dragDepth.value += 1;
    dragging.value = true;
};
const onDragLeave = (e: DragEvent) => {
    if (!props.drag || props.disabled) return;
    e.preventDefault();
    dragDepth.value -= 1;
    if (dragDepth.value <= 0) {
        dragDepth.value = 0;
        dragging.value = false;
    }
};
const onDragOver = (e: DragEvent) => {
    if (!props.drag || props.disabled) return;
    e.preventDefault();
};
const onDrop = (e: DragEvent) => {
    if (!props.drag || props.disabled) return;
    e.preventDefault();
    dragDepth.value = 0;
    dragging.value = false;
    void handleFiles(Array.from(e.dataTransfer?.files ?? []));
};
const onZoneKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFilePicker();
    }
};

// ---------- 渲染辅助 ----------
const statusOf = (file: UploadFile) => file.status ?? 'uploading';
const statusAria = (file: UploadFile) => {
    const s = statusOf(file);
    if (s === 'done') return '上传完成';
    if (s === 'error') return '上传失败';
    if (s === 'uploading') return `上传中 ${clampPercent(file.percent ?? 0)}%`;
    return undefined;
};
const statusClass = (file: UploadFile) => {
    const s = statusOf(file);
    return [
        'animal-upload__status',
        s === 'done' && 'animal-upload__status--done',
        s === 'error' && 'animal-upload__status--error',
    ]
        .filter(Boolean)
        .join(' ');
};
const cardClass = (file: UploadFile) => {
    const s = statusOf(file);
    return [
        'animal-upload__card',
        s === 'error' && 'animal-upload__card--error',
        s === 'done' && 'animal-upload__card--done',
    ]
        .filter(Boolean)
        .join(' ');
};

const rootClass = computed(() => [
    'animal-upload',
    `animal-upload--list-${props.listType}`,
    { 'animal-upload--disabled': props.disabled },
]);
</script>

<template>
    <div :class="rootClass">
        <input
            ref="inputRef"
            class="animal-upload__hidden-input"
            type="file"
            :accept="accept"
            :multiple="multiple"
            :disabled="disabled"
            :webkitdirectory="directory ? '' : undefined"
            @change="onInputChange"
        />

        <template v-if="listType === 'picture-card'">
            <ul class="animal-upload__card-list">
                <template v-if="listVisible">
                    <li v-for="file in list" :key="file.uid" :class="cardClass(file)">
                    <img
                        v-if="previewSrc(file)"
                        class="animal-upload__card-img"
                        :class="{ 'animal-upload__card-img--previewable': canPreview(file) }"
                        :src="previewSrc(file)"
                        :alt="file.name"
                        @click="showPreviewIcon && canPreview(file) ? openPreview(file) : undefined"
                    />
                    <span v-else class="animal-upload__card-file-icon">
                        <Icon name="File" :size="15" />
                    </span>
                    <span v-if="statusOf(file) === 'uploading'" class="animal-upload__card-mask">
                        <span class="animal-upload__spinner" aria-hidden="true" />
                        <span class="animal-upload__percent">{{ clampPercent(file.percent ?? 0) }}%</span>
                    </span>
                    <span v-else-if="statusOf(file) === 'error'" class="animal-upload__card-mask">
                        <Icon name="Close" :size="22" color="#e05a5a" />
                    </span>
                    <button
                        v-if="showPreviewIcon && canPreview(file)"
                        type="button"
                        class="animal-upload__card-preview"
                        :aria-label="`预览 ${file.name}`"
                        :disabled="disabled"
                        @click="openPreview(file)"
                    >
                        <Icon name="Eye" :size="12" />
                    </button>
                    <button
                        v-if="showRemoveIcon"
                        type="button"
                        class="animal-upload__card-remove"
                        :aria-label="`删除 ${file.name}`"
                        :disabled="disabled"
                        @click="handleRemove(file)"
                    >
                        <Icon name="Close" :size="12" />
                    </button>
                </li>
            </template>
                <!-- 添加块始终保留：maxCount=1 时点击可替换，>1 满员时新文件会被丢弃 -->
                <li class="animal-upload__card-add">
                    <button
                        type="button"
                        class="animal-upload__card-add-btn"
                        :aria-label="ariaLabel ?? '上传文件'"
                        :disabled="disabled"
                        @click="openFilePicker"
                    >
                        <slot><Icon name="Upload" :size="28" /></slot>
                    </button>
                </li>
            </ul>
            <div v-if="tip" class="animal-upload__tip">{{ tip }}</div>
        </template>

        <template v-else>
            <div
                v-if="drag"
                class="animal-upload__drag-zone"
                :class="{ 'animal-upload__drag-zone--active': dragging }"
                role="button"
                :tabindex="disabled ? -1 : 0"
                :aria-label="ariaLabel ?? '上传文件'"
                :aria-disabled="disabled || undefined"
                @click="openFilePicker"
                @keydown="onZoneKey"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover="onDragOver"
                @drop="onDrop"
            >
                <slot>
                    <span class="animal-upload__drag-icon">
                        <Icon name="Upload" :size="16" />
                    </span>
                    <span class="animal-upload__drag-text">点击或拖拽文件到这里</span>
                </slot>
            </div>
            <button
                v-else
                type="button"
                :class="hasSlot ? 'animal-upload__trigger-custom' : 'animal-upload__trigger'"
                :aria-label="ariaLabel ?? '上传文件'"
                :disabled="disabled"
                @click="openFilePicker"
            >
                <slot>
                    <Icon name="Upload" :size="18" />
                    <span>点击上传</span>
                </slot>
            </button>
            <div v-if="tip" class="animal-upload__tip">{{ tip }}</div>
            <ul v-if="listVisible && list.length" class="animal-upload__text-list">
                <li
                    v-for="file in list"
                    :key="file.uid"
                    class="animal-upload__text-item"
                    :class="{ 'animal-upload__text-item--error': statusOf(file) === 'error' }"
                >
                    <span v-if="listType === 'picture'" class="animal-upload__text-thumb">
                        <img
                            v-if="previewSrc(file)"
                            class="animal-upload__text-thumb-img"
                            :src="previewSrc(file)"
                            :alt="file.name"
                        />
                        <Icon v-else name="File" :size="18" />
                    </span>
                    <span v-else class="animal-upload__file-icon">
                        <Icon name="File" :size="15" />
                    </span>
                    <span class="animal-upload__file-name" :title="file.name">{{ file.name }}</span>
                    <span v-if="file.size !== undefined && file.size !== null" class="animal-upload__file-size">
                        {{ formatFileSize(file.size) }}
                    </span>
                    <span :class="statusClass(file)" :aria-label="statusAria(file)">
                        <template v-if="statusOf(file) === 'done'">
                            <Icon name="Check" :size="12" />
                        </template>
                        <template v-else-if="statusOf(file) === 'error'">
                            <Icon name="Close" :size="12" />
                        </template>
                        <template v-else-if="statusOf(file) !== 'removed'">
                            <span class="animal-upload__spinner" aria-hidden="true" />
                            <span class="animal-upload__percent">{{ clampPercent(file.percent ?? 0) }}%</span>
                        </template>
                    </span>
                    <button
                        v-if="showPreviewIcon && canPreview(file)"
                        type="button"
                        class="animal-upload__preview-btn"
                        :aria-label="`预览 ${file.name}`"
                        :disabled="disabled"
                        @click="openPreview(file)"
                    >
                        <Icon name="Eye" :size="12" />
                    </button>
                    <button
                        v-if="showRemoveIcon"
                        type="button"
                        class="animal-upload__remove"
                        :aria-label="`删除 ${file.name}`"
                        :disabled="disabled"
                        @click="handleRemove(file)"
                    >
                        <Icon name="Close" :size="12" />
                    </button>
                </li>
            </ul>
        </template>

        <div
            v-if="previewTarget"
            ref="previewLayerRef"
            class="animal-upload__preview-layer"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            :aria-label="`预览 ${previewTarget.name}`"
            @click="previewTarget = null"
        >
            <img
                class="animal-upload__preview-img"
                :src="previewSrc(previewTarget)"
                :alt="previewTarget.name"
                @click.stop
            />
            <button
                ref="closeBtnRef"
                type="button"
                class="animal-upload__preview-close"
                aria-label="关闭预览"
                @click="previewTarget = null"
            >
                <Icon name="Close" :size="20" />
            </button>
        </div>
    </div>
</template>

<style lang="less" scoped>
// ============================================
// Upload — Animal Island Style（对齐 React 版）
// 奶油胶囊触发钮 / 虚线拖拽区 / text 行列表 / picture 行内缩略图 / picture-card 卡片
// ============================================

// ---------- Tokens ----------
@teal: #19c8b9;
@teal-hover: #3dd4c6;
@teal-bg: #e6f9f6;

@cream: #fffbe7;
@cream-deep: #fffdf7;
@border: #e8dcc8;
@border-strong: #c4b89e;

@text: #794f27;
@text-secondary: #9f927d;
@text-muted: #c4b89e;

@success: #6fba2c;
@error: #e05a5a;

@focus-yellow: #ffd24d;

// ---------- Root ----------
.animal-upload {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: inherit;
    color: @text;
}

.animal-upload--disabled {
    opacity: 0.55;
}

.animal-upload__hidden-input {
    display: none;
}

// ---------- Trigger（text 模式，奶油胶囊 + 硬底阴影） ----------
.animal-upload__trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    align-self: flex-start;
    padding: 0 18px;
    height: 36px;
    border: none;
    border-radius: 50px;
    background: #f8f8f0;
    color: @text;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition:
        box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.15s ease;
    box-shadow: 0 5px 0 0 #bdaea0;

    &:hover:not(:disabled) {
        box-shadow: 0 6px 0 0 #bdaea0;
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(2px);
        box-shadow: 0 1px 0 0 #bdaea0;
    }

    &:disabled {
        cursor: not-allowed;
        box-shadow: 0 5px 0 0 #d5c8b8;
    }

    &:focus-visible {
        outline: 2px solid @focus-yellow;
        outline-offset: 2px;
    }
}

// Custom children trigger（透明容器，不套用胶囊按钮样式）
.animal-upload__trigger-custom {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    border: none;
    background: transparent;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
    }
}

// ---------- Drag zone ----------
.animal-upload__drag-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 28px 20px;
    border: 2px dashed @border-strong;
    border-radius: 20px;
    background: @cream-deep;
    color: @text-secondary;
    cursor: pointer;
    user-select: none;
    transition:
        border-color 0.2s ease,
        background 0.2s ease,
        color 0.2s ease;

    &:hover {
        border-color: @teal;
        color: @teal;
    }

    &:focus-visible {
        outline: 2px solid @focus-yellow;
        outline-offset: 2px;
    }
}

.animal-upload__drag-zone--active {
    border-color: @teal;
    background: @teal-bg;
    color: @teal;
}

.animal-upload__drag-icon {
    display: inline-flex;
    transform: scale(1.5);
}

.animal-upload__drag-text {
    font-size: 14px;
    font-weight: 700;
    color: inherit;
}

// ---------- Tip ----------
.animal-upload__tip {
    font-size: 12px;
    color: @text-secondary;
    line-height: 1.6;
}

// ---------- Text list ----------
.animal-upload__text-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.animal-upload__text-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    border-radius: 12px;
    background: @cream-deep;
    border: 1.5px solid @border;
    font-size: 13px;
    transition:
        background 0.15s ease,
        border-color 0.15s ease;

    &:hover {
        background: @teal-bg;
    }
}

.animal-upload__text-item--error {
    border-color: @error;
    background: #fdeeee;
}

.animal-upload__file-icon {
    display: inline-flex;
    color: @text-muted;
    flex-shrink: 0;
}

// ---------- Inline thumbnail (listType="picture") ----------
.animal-upload__text-thumb {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: @cream-deep;
    border: 1.5px solid @border;
    color: @text-muted;
}

.animal-upload__text-thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.animal-upload__file-name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.animal-upload__file-size {
    flex-shrink: 0;
    font-size: 11px;
    color: @text-muted;
}

// ---------- Status icons ----------
.animal-upload__status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    flex-shrink: 0;
}

.animal-upload__status--done {
    color: @success;
}

.animal-upload__status--error {
    color: @error;
}

.animal-upload__spinner {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid @teal-bg;
    border-top-color: @teal;
    animation: animal-upload-spin 0.8s linear infinite;
}

.animal-upload__percent {
    font-size: 11px;
    font-weight: 700;
    color: @teal;
    font-variant-numeric: tabular-nums;
}

@keyframes animal-upload-spin {
    to {
        transform: rotate(360deg);
    }
}

.animal-upload__preview-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    margin-left: 4px;
    border: none;
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
    color: inherit;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    flex-shrink: 0;
    transition:
        background 0.15s ease,
        color 0.15s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.08);
        color: @teal;
    }

    &:focus-visible {
        outline: 2px solid @focus-yellow;
        outline-offset: 1px;
    }
}

.animal-upload__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    margin-left: 4px;
    border: none;
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
    color: inherit;
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.08);
        color: @error;
    }

    &:focus-visible {
        outline: 2px solid @focus-yellow;
        outline-offset: 1px;
    }
}

// ---------- Picture-card list ----------
.animal-upload__card-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.animal-upload__card {
    position: relative;
    width: 84px;
    height: 84px;
    border-radius: 16px;
    border: 1.5px solid @border;
    background: @cream-deep;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.animal-upload__card--done {
    border-color: @border-strong;
}

.animal-upload__card--error {
    border-color: @error;
}

.animal-upload__card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.animal-upload__card-img--previewable {
    cursor: zoom-in;
}

.animal-upload__card-file-icon {
    display: inline-flex;
    color: @text-muted;
    transform: scale(1.6);
}

.animal-upload__card-mask {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: rgba(15, 12, 8, 0.55);
    color: #fff;
}

.animal-upload__card-preview {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition:
        opacity 0.15s ease,
        background 0.15s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.65);
    }

    &:focus-visible {
        opacity: 1;
        outline: 2px solid @focus-yellow;
        outline-offset: 1px;
    }
}

.animal-upload__card:hover .animal-upload__card-preview {
    opacity: 1;
}

.animal-upload__card-remove {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition:
        opacity 0.15s ease,
        background 0.15s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.65);
    }

    &:focus-visible {
        opacity: 1;
        outline: 2px solid @focus-yellow;
        outline-offset: 1px;
    }
}

.animal-upload__card:hover .animal-upload__card-remove {
    opacity: 1;
}

.animal-upload__card-add {
    width: 84px;
    height: 84px;
}

.animal-upload__card-add-btn {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed @border-strong;
    border-radius: 16px;
    background: transparent;
    color: @text-muted;
    cursor: pointer;
    transition:
        border-color 0.2s ease,
        color 0.2s ease,
        background 0.2s ease;

    &:hover {
        border-color: @teal;
        color: @teal;
        background: @teal-bg;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    &:focus-visible {
        outline: 2px solid @focus-yellow;
        outline-offset: 2px;
    }
}

// ---------- 内置预览弹层（图片默认带预览） ----------
.animal-upload__preview-layer {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 12, 8, 0.82);
}

.animal-upload__preview-img {
    max-width: 90vw;
    max-height: 88vh;
    border-radius: 16px;
    box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6);
    background: #fff;
    object-fit: contain;
}

.animal-upload__preview-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 34px;
    height: 34px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.32);
    }

    &:focus-visible {
        outline: 2px solid @focus-yellow;
        outline-offset: 2px;
    }
}

// ---------- Reduced motion ----------
@media (prefers-reduced-motion: reduce) {
    .animal-upload {
        &__spinner {
            animation: none;
            border-top-color: @teal;
        }

        &__trigger,
        &__drag-zone,
        &__text-item,
        &__card-remove,
        &__card-preview {
            transition: none;
        }
    }
}
</style>
