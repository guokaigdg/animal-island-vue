<script setup lang="ts">
import { ref } from 'vue';
import {
    Upload,
    Notification,
    NotificationContainer,
    type UploadChangeParam,
    type UploadFile,
    type UploadCustomRequestOptions,
} from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, demoBodyStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

const cardFiles = ref<UploadFile[]>([]);
const pictureFiles = ref<UploadFile[]>([]);
const pickedFiles = ref<UploadFile[]>([]);
const previewFile = ref<UploadFile | null>(null);
const lastPickedCount = ref(0);

const sentinel = (info: UploadChangeParam) => {
    // onChange 会在进度更新等多次触发;按数量变化去重,仅提示一次(避免一次上传弹多条)
    const files = info.fileList;
    pickedFiles.value = files;
    if (files.length !== lastPickedCount.value) {
        lastPickedCount.value = files.length;
        Notification.info({ message: `列表变化:当前 ${files.length} 个文件` });
    }
};

// 接入真实上传的示例(慢速模拟)——真实项目在 onProgress/onSuccess/onError 里回传进度与结果
const slowCustomRequest = ({ file, onProgress, onSuccess }: UploadCustomRequestOptions) => {
    let pct = 0;
    const timer = setInterval(() => {
        pct += 8;
        onProgress(Math.min(100, pct));
        if (pct >= 100) {
            clearInterval(timer);
            onSuccess();
            Notification.success({ message: file.name + ' 上传完成' });
        }
    }, 300);
};

// 数量上限 / 类型拦截,均使用 warning 类型
const LIMIT_COUNT = 3;
const ALLOWED_TYPE = /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i;
let existingCount = 0;
const guardUpload = (file: File): boolean => {
    if (!ALLOWED_TYPE.test(file.name)) {
        Notification.warning({ message: `${file.name} 不是支持的图片类型,已拦截` });
        return false;
    }
    if (existingCount >= LIMIT_COUNT) {
        Notification.warning({ message: `${file.name} 已达数量上限(${LIMIT_COUNT} 个),已拦截` });
        return false;
    }
    if (file.size > 1024 * 1024) {
        Notification.warning({ message: `${file.name} 超过 1 MB,已拦截` });
        return false;
    }
    return true;
};
const trackCount = (info: UploadChangeParam) => {
    existingCount = info.fileList.length;
};

const UPLOAD_API: ApiRow[] = [
    {
        prop: 'accept',
        desc: '接受的文件类型,透传 input[accept];拖拽进来的文件同样按它过滤',
        type: 'string',
        defaultVal: '-',
    },
    {
        prop: 'multiple',
        desc: '是否支持多选;false 时拖入多个也只保留第一个(directory 选择文件夹不截断)',
        type: 'boolean',
        defaultVal: 'false',
    },
    {
        prop: 'maxCount',
        desc: '最多上传文件数;=1 时新文件替换当前的,>1 时保留最早 N 个、超出的丢弃',
        type: 'number',
        defaultVal: '-',
    },
    { prop: 'disabled', desc: '是否禁用', type: 'boolean', defaultVal: 'false' },
    { prop: 'directory', desc: '是否按目录选择上传(透传 webkitdirectory)', type: 'boolean', defaultVal: 'false' },
    { prop: 'modelValue (v-model)', desc: '文件列表(受控)', type: 'UploadFile[]', defaultVal: '-' },
    { prop: 'defaultFileList', desc: '默认文件列表(非受控)', type: 'UploadFile[]', defaultVal: '[]' },
    { prop: 'listType', desc: '列表形态', type: `'text' | 'picture' | 'picture-card'`, defaultVal: "'text'" },
    {
        prop: 'showUploadList',
        desc: '是否展示文件列表,或 { showPreviewIcon, showRemoveIcon } 分别控制',
        type: 'boolean | { showPreviewIcon?: boolean; showRemoveIcon?: boolean }',
        defaultVal: 'true',
    },
    { prop: 'drag', desc: '是否开启拖拽上传区域', type: 'boolean', defaultVal: 'false' },
    { prop: 'tip', desc: '触发区下方提示文字', type: 'string', defaultVal: '-' },
    {
        prop: 'beforeUpload',
        desc: '上传前钩子,返回 false 跳过该文件(钩子抛错也会跳过并打印错误)',
        type: '(file, fileList) => boolean | File | Promise<boolean | File>',
        defaultVal: '-',
    },
    {
        prop: 'customRequest',
        desc: '自定义上传实现(优先级高于 action);同步抛错时该文件标记失败',
        type: '(options: UploadCustomRequestOptions) => void',
        defaultVal: '-',
    },
    {
        prop: 'action',
        desc: '上传地址,提供时用原生 XHR 真实上传;也支持 (file) => 地址(可异步),解析为空则标记失败',
        type: 'string | ((file: File) => string | Promise<string>)',
        defaultVal: '-',
    },
    { prop: 'method', desc: '请求方法', type: `'POST' | 'PUT' | 'PATCH'`, defaultVal: "'POST'" },
    { prop: 'headers', desc: '自定义请求头', type: 'Record<string, string>', defaultVal: '-' },
    {
        prop: 'data',
        desc: '随文件提交的附加表单字段;支持 (file) => 字段(可异步)',
        type: 'Record<string, unknown> | ((file: File) => ... )',
        defaultVal: '-',
    },
    { prop: 'name', desc: '文件字段名', type: 'string', defaultVal: "'file'" },
    { prop: 'withCredentials', desc: '是否携带跨域凭证', type: 'boolean', defaultVal: 'false' },
    {
        prop: 'change',
        desc: '列表变化事件(info: { file, fileList, event? })',
        type: '(info: UploadChangeParam) => void',
        defaultVal: '-',
    },
    {
        prop: 'preview',
        desc: '点击预览(picture / picture-card 缩略图或 text 行图片)时触发;不监听则用内置大图弹层',
        type: '(file: UploadFile) => void',
        defaultVal: '-',
    },
    {
        prop: 'exceed',
        desc: '选中文件超出 maxCount 被拒绝时触发;maxCount=1 顶掉旧文件的替换不触发',
        type: '(files: File[], fileList: UploadFile[]) => void',
        defaultVal: '-',
    },
    {
        prop: 'onRemove',
        desc: '删除前钩子,返回 false 阻止删除(钩子抛错同样阻止并打印日志)',
        type: '(file: UploadFile) => boolean | void | Promise<boolean | void>',
        defaultVal: '-',
    },
    { prop: 'ariaLabel', desc: '无障碍标签(默认「上传文件」)', type: 'string', defaultVal: "'上传文件'" },
];

const uploaded: UploadFile[] = [
    { uid: 'island-1', name: '海岛全景.png', size: 2_400_000, type: 'image/png', status: 'done', percent: 100 },
    { uid: 'island-2', name: '露营清单.pdf', size: 512_000, type: 'application/pdf', status: 'done', percent: 100 },
];

const code = `import { Upload } from 'animal-island-vue';

// 基础:change 回传 { file, fileList, event? }
<Upload
    multiple
    accept="image/*,.pdf"
    @change="({ file, fileList }) => {
        console.log('changed:', file.name, 'total:', fileList.length);
        console.log('server response:', file.response);
    }"
/>

// 拖拽 + 数量上限 + 类型拦截
<Upload drag max-count="3" :before-upload="file => file.size <= 1024 * 1024" />

// 图片卡片(picture-card):不监听 preview 时组件内置大图预览弹层
<Upload list-type="picture-card" accept="image/*" :max-count="4" />

// 仅保留触发钮(列表自行渲染)
<Upload :show-upload-list="false" multiple accept="image/*" />

// 自定义上传
<Upload
    :custom-request="({ file, onProgress, onSuccess, onError }) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');
        xhr.upload.onprogress = e => onProgress((e.loaded / e.total) * 100);
        xhr.onload = () => (xhr.status < 400 ? onSuccess() : onError());
        const form = new FormData();
        form.append('file', file);
        xhr.send(form);
    }"
/>

// 内置 XHR 真实上传:交给 action 即可,组件上报进度并在删除时中止
<Upload action="/api/upload" method="POST" name="file" multiple />

// 行内缩略图(picture):图片文件自动生成预览
<Upload list-type="picture" accept="image/*" :max-count="4" />`;
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Upload <span :style="tagStyle">上传</span> <span :style="tagStyle">拖拽</span>
            <span :style="tagStyle">模拟进度</span>
        </div>
        <div :style="demoBodyStyle">
            <!-- 1. 基础 -->
            <div :style="labelStyle">基础用法 — 点击上传（默认模拟上传进度）</div>
            <div style="max-width: 720px; width: 100%">
                <Upload tip="未接入 customRequest 时，组件会用定时器模拟上传进度，方便联调 UI" />
            </div>

            <!-- 2. 默认列表 -->
            <div :style="labelStyle">defaultFileList — 预置已完成文件 + change 收集</div>
            <div style="max-width: 720px; width: 100%">
                <Upload
                    multiple
                    accept="image/*,.pdf"
                    :default-file-list="uploaded"
                    tip="支持多选，accept 限定图片与 PDF"
                    @change="sentinel"
                />
            </div>

            <!-- 3. 拖拽 -->
            <div :style="labelStyle">drag — 拖拽上传区域</div>
            <div style="max-width: 720px; width: 100%">
                <Upload drag multiple tip="点击或把文件拖进虚线框均可" />
            </div>

            <!-- 4. maxCount + beforeUpload -->
            <div :style="labelStyle">maxCount + beforeUpload — 数量上限与类型拦截</div>
            <div style="max-width: 720px; width: 100%">
                <Upload
                    drag
                    multiple
                    :max-count="LIMIT_COUNT"
                    :before-upload="guardUpload"
                    :tip="`最多 ${LIMIT_COUNT} 个图片文件；类型/数量上限/大小拦截均以 warning 提示（可拖一张非图片试试）`"
                    @change="trackCount"
                />
            </div>

            <!-- 5. picture-card + 内置预览 -->
            <div :style="labelStyle">listType="picture-card" — 图片卡片 + 内置大图预览</div>
            <div style="max-width: 720px; width: 100%">
                <Upload
                    v-model="cardFiles"
                    list-type="picture-card"
                    accept="image/*"
                    multiple
                    :max-count="4"
                    tip="最多 4 张；不监听 preview 时点击图片打开内置大图预览"
                    @exceed="
                        (files: File[]) =>
                            Notification.warning({ message: files.length + ' 个文件超出上限（最多 4 张），已忽略' })
                    "
                />
            </div>

            <!-- 6. customRequest -->
            <div :style="labelStyle">customRequest — 接入真实上传（示例为慢速模拟）</div>
            <div style="max-width: 720px; width: 100%">
                <Upload
                    :custom-request="slowCustomRequest"
                    tip="真实项目中在 customRequest 里发 XHR/fetch，把进度与结果回传给组件"
                />
            </div>

            <!-- 7. action -->
            <div :style="labelStyle">action — 内置 XHR 真实上传（带进度与取消）</div>
            <div style="max-width: 720px; width: 100%">
                <Upload
                    action="https://httpbin.org/post"
                    method="POST"
                    :data="{ source: 'demo' }"
                    name="file"
                    multiple
                    tip="设置 action 后组件用原生 XMLHttpRequest 上传并自动上报进度；删除文件会中止请求"
                />
            </div>

            <!-- 8. children -->
            <div :style="labelStyle">#default 插槽 — 自定义触发区内容</div>
            <div style="max-width: 720px; width: 100%">
                <Upload multiple tip="用 #default 插槽完全自定义触发按钮">
                    <span
                        style="
                            font-family: Nunito;
                            font-weight: 700;
                            font-size: 13px;
                            padding: 8px 16px;
                            border-radius: 50px;
                            background: #f8f8f0;
                            color: #794f27;
                            display: inline-flex;
                            gap: 8px;
                            align-items: center;
                        "
                    >
                        点击上传头像
                    </span>
                </Upload>
            </div>

            <!-- 9. showUploadList=false -->
            <div :style="labelStyle">showUploadList=false — 纯上传按钮（隐藏列表）</div>
            <div style="max-width: 720px; width: 100%">
                <Upload
                    :show-upload-list="false"
                    multiple
                    accept="image/*,.pdf"
                    tip="列表由外部自行渲染时，关闭内置列表只保留触发钮"
                />
            </div>

            <!-- 10. preview 事件 -->
            <div :style="labelStyle">@preview — 自行接管预览大图</div>
            <div style="max-width: 720px; width: 100%">
                <Upload
                    v-model="cardFiles"
                    list-type="picture-card"
                    accept="image/*"
                    multiple
                    :max-count="4"
                    tip="监听 preview 后由外部渲染大图，组件不再打开内置弹层"
                    @preview="previewFile = $event"
                />
                <div v-if="previewFile" class="preview-overlay" @click="previewFile = null">
                    <img
                        v-if="previewFile.thumbUrl || previewFile.url"
                        :src="previewFile.thumbUrl ?? previewFile.url"
                        :alt="previewFile.name"
                        @click.stop
                    />
                    <p v-else class="preview-empty">该文件暂无可预览的图片</p>
                    <button class="preview-close" aria-label="关闭预览" @click="previewFile = null">×</button>
                </div>
            </div>

            <!-- 11. listType="picture" -->
            <div :style="labelStyle">listType="picture" — 行内缩略图</div>
            <div style="max-width: 720px; width: 100%">
                <Upload
                    v-model="pictureFiles"
                    list-type="picture"
                    accept="image/*"
                    multiple
                    :max-count="4"
                    tip="text 形态但每条带缩略图，图片文件自动生成预览"
                />
            </div>
        </div>

        <CodeBlock :code="code" />
        <ApiTable :rows="UPLOAD_API" />

        <NotificationContainer />
    </div>
</template>

<style scoped>
.preview-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 12, 8, 0.82);
}
.preview-overlay img {
    max-width: 90vw;
    max-height: 88vh;
    border-radius: 16px;
    box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6);
    background: #fff;
    object-fit: contain;
}
.preview-empty {
    color: #fff;
    font-size: 14px;
}
.preview-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
}
</style>
