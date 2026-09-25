import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Upload from './Upload.vue';
import type { UploadChangeParam, UploadFile } from './types';

const makeFile = (name: string, type = 'text/plain', size = 1024) => new File(['x'.repeat(size)], name, { type });

// jsdom 没有 createObjectURL / revokeObjectURL（picture-card 与缩略图预览依赖）
beforeEach(() => {
    Object.defineProperty(window.URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: vi.fn(() => 'blob:mock-url'),
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
        configurable: true,
        writable: true,
        value: vi.fn(),
    });
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

const flushMicro = async () => {
    for (let i = 0; i < 8; i += 1) await Promise.resolve();
};

const findInput = (wrapper: ReturnType<typeof mount>) => wrapper.find('input[type="file"]').element as HTMLInputElement;

const pickFiles = async (input: HTMLInputElement, files: File[]) => {
    const evt = new Event('change');
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(evt);
    // Vue 的 DOM patch 是异步的，等一拍让列表渲染出来
    await nextTick();
};

// action / data 的函数形式会被 await（可能是异步签名），XHR 在微任务里才创建，
// 这类用例必须再等几轮微任务再断言。
const pickFilesAsync = async (input: HTMLInputElement, files: File[]) => {
    await pickFiles(input, files);
    await flushMicro();
};

const lastList = (onChange: ReturnType<typeof vi.fn>, i = -1): UploadFile[] =>
    (onChange.mock.calls.at(i)![0] as UploadChangeParam).fileList;

describe('Upload', () => {
    describe('trigger & picker', () => {
        it('renders the default trigger and forwards aria-label to it', () => {
            const wrapper = mount(Upload, { props: { ariaLabel: '上传头像' } });
            const trigger = wrapper.find('[aria-label="上传头像"]');
            expect(trigger.exists()).toBe(true);
            expect(trigger.text()).toContain('点击上传');
        });

        it('opens the hidden file input on trigger click', () => {
            const wrapper = mount(Upload);
            const input = findInput(wrapper);
            const clickSpy = vi.spyOn(input, 'click');
            wrapper.get('[aria-label="上传文件"]').trigger('click');
            expect(clickSpy).toHaveBeenCalledTimes(1);
        });

        it('disabled upload ignores trigger clicks', () => {
            const wrapper = mount(Upload, { props: { disabled: true } });
            const input = findInput(wrapper);
            const clickSpy = vi.spyOn(input, 'click');
            wrapper.get('[aria-label="上传文件"]').trigger('click');
            expect(clickSpy).not.toHaveBeenCalled();
        });

        it('renders drag zone when drag=true and supports drop', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { drag: true, onChange } });
            expect(wrapper.text()).toContain('点击或拖拽文件到这里');
            const zone = wrapper.get('[role="button"][aria-label="上传文件"]');
            await zone.trigger('drop', { dataTransfer: { files: [makeFile('drop.txt')] } });
            const list = lastList(onChange);
            expect(list.some((f) => f.name === 'drop.txt')).toBe(true);
        });

        it('renders custom children as the text trigger content', () => {
            const wrapper = mount(Upload, { slots: { default: '上传头像' } });
            expect(wrapper.text()).toContain('上传头像');
            expect(wrapper.text()).not.toContain('点击上传');
        });

        it('renders custom children in the picture-card add tile', () => {
            const wrapper = mount(Upload, {
                props: { listType: 'picture-card' },
                slots: { default: '<em>＋</em>' },
            });
            expect(wrapper.find('[aria-label="上传文件"]').find('em').text()).toBe('＋');
        });
    });

    describe('file list (text)', () => {
        it('adds a file with uploading status, then marks done after simulated progress', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.png', 'image/png', 2048)]);

            expect(wrapper.find('.animal-upload__file-name').text()).toBe('a.png');
            expect(wrapper.find('.animal-upload__file-size').text()).toBe('2.0 KB');
            expect(lastList(onChange, 0)).toHaveLength(1);

            vi.advanceTimersByTime(3000);
            await nextTick();
            const finalList = lastList(onChange);
            expect(finalList[0].status).toBe('done');
            expect(finalList[0].percent).toBe(100);
            expect(wrapper.find('[aria-label="上传完成"]').exists()).toBe(true);
        });

        it('multiple=true adds several files at once', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { multiple: true, onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')]);
            expect(lastList(onChange, 0)).toHaveLength(3);
        });

        it('truncates selections beyond maxCount, keeping the earliest ones', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { maxCount: 2, multiple: true, onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')]);
            const list = lastList(onChange, 0);
            expect(list).toHaveLength(2);
            expect(list.map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
        });

        it('beforeUpload=false skips the file entirely', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, {
                props: {
                    beforeUpload: (file: File) => file.name !== 'blocked.txt',
                    onChange,
                },
            });
            await pickFiles(findInput(wrapper), [makeFile('ok.txt'), makeFile('blocked.txt')]);
            await flushMicro();
            const list = lastList(onChange);
            expect(list).toHaveLength(1);
            expect(list[0].name).toBe('ok.txt');
        });

        it('beforeUpload returning a File uploads the transformed file', async () => {
            const onChange = vi.fn();
            const renamed = new File(['data'], 'renamed.txt', { type: 'text/plain' });
            const wrapper = mount(Upload, { props: { beforeUpload: () => renamed, onChange } });
            await pickFilesAsync(findInput(wrapper), [makeFile('original.txt')]);
            const list = lastList(onChange);
            expect(list[0].name).toBe('renamed.txt');
        });

        it('remove button deletes the item (and clears the simulated timer)', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            await wrapper.find('[aria-label="删除 a.txt"]').trigger('click');
            expect(lastList(onChange)).toHaveLength(0);
        });

        it('onRemove=false prevents removal', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { onRemove: () => false, onChange } });
            await pickFiles(findInput(wrapper), [makeFile('keep.txt')]);
            await wrapper.find('[aria-label="删除 keep.txt"]').trigger('click');
            expect(lastList(onChange)).toHaveLength(1);
        });

        it('shows error state when customRequest reports onError', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, {
                props: {
                    customRequest: (options: { onError: (e?: unknown) => void }) => options.onError(new Error('boom')),
                    onChange,
                },
            });
            await pickFiles(findInput(wrapper), [makeFile('bad.txt')]);
            expect(lastList(onChange)[0].status).toBe('error');
            expect(wrapper.find('[aria-label="上传失败"]').exists()).toBe(true);
        });

        it('customRequest onProgress/onSuccess drive the status', async () => {
            let api: { onProgress: (n: number) => void; onSuccess: () => void } | null = null;
            const onChange = vi.fn();
            const wrapper = mount(Upload, {
                props: {
                    customRequest: (options: typeof api) => {
                        api = options;
                    },
                    onChange,
                },
            });
            await pickFiles(findInput(wrapper), [makeFile('u.txt')]);
            api!.onProgress(40);
            expect(lastList(onChange)[0].percent).toBe(40);
            api!.onSuccess();
            expect(lastList(onChange)[0].status).toBe('done');
        });
    });

    describe('controlled mode', () => {
        it('renders fileList from props and only notifies on remove (does not mutate)', async () => {
            const controlled: UploadFile[] = [{ uid: 'u1', name: 'remote.png', status: 'done', percent: 100 }];
            const update = vi.fn();
            const wrapper = mount(Upload, {
                props: { modelValue: controlled, 'onUpdate:modelValue': update },
            });
            expect(wrapper.find('.animal-upload__file-name').text()).toBe('remote.png');
            expect(wrapper.find('.animal-upload__status--done').exists()).toBe(true);
            await wrapper.find('[aria-label="删除 remote.png"]').trigger('click');
            // 受控模式下组件只通知，不自己改内部 state
            expect(update).toHaveBeenCalledWith([]);
        });
    });

    describe('picture-card', () => {
        it('renders tiles with object URL preview and an add tile', async () => {
            const wrapper = mount(Upload, { props: { listType: 'picture-card' } });
            await pickFiles(findInput(wrapper), [makeFile('pic.png', 'image/png')]);
            const img = wrapper.find('.animal-upload__card-img');
            expect(img.exists()).toBe(true);
            expect(img.attributes('src')).toBe('blob:mock-url');
            expect(wrapper.find('[aria-label="上传文件"]').exists()).toBe(true); // add tile
        });

        it('keeps the add tile when maxCount reached (so it can replace the oldest)', () => {
            const wrapper = mount(Upload, {
                props: {
                    listType: 'picture-card',
                    maxCount: 1,
                    defaultFileList: [{ uid: '1', name: 'x.png', status: 'done' }],
                },
            });
            expect(wrapper.find('[aria-label="上传文件"]').exists()).toBe(true);
        });

        it('revokes the object URL on remove', async () => {
            const wrapper = mount(Upload, { props: { listType: 'picture-card' } });
            await pickFiles(findInput(wrapper), [makeFile('pic.png', 'image/png')]);
            await wrapper.find('[aria-label="删除 pic.png"]').trigger('click');
            expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
            expect(wrapper.find('.animal-upload__card-img').exists()).toBe(false);
        });

        it('opens the built-in lightbox when clicking the card image (no preview listener)', async () => {
            const wrapper = mount(Upload, { props: { listType: 'picture-card' } });
            await pickFiles(findInput(wrapper), [makeFile('pic.png', 'image/png')]);
            await wrapper.find('.animal-upload__card-img').trigger('click');
            expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
        });

        it('closes the built-in lightbox on Escape', async () => {
            const wrapper = mount(Upload, { props: { listType: 'picture-card' } });
            await pickFiles(findInput(wrapper), [makeFile('pic.png', 'image/png')]);
            await wrapper.find('.animal-upload__card-img').trigger('click');
            expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
            await nextTick();
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            await nextTick();
            expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
        });
    });

    describe('listType="picture"', () => {
        it('renders an inline thumbnail img for image files', async () => {
            const wrapper = mount(Upload, { props: { listType: 'picture' } });
            await pickFiles(findInput(wrapper), [makeFile('pic.png', 'image/png')]);
            const img = wrapper.find('.animal-upload__text-thumb-img');
            expect(img.exists()).toBe(true);
            expect(img.attributes('src')).toBe('blob:mock-url');
        });

        it('falls back to a file icon for non-image files', async () => {
            const wrapper = mount(Upload, { props: { listType: 'picture' } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            expect(wrapper.find('.animal-upload__text-thumb').exists()).toBe(true);
            expect(wrapper.find('.animal-upload__text-thumb-img').exists()).toBe(false);
        });

        it('replaces the separate file icon with the thumbnail', async () => {
            const wrapper = mount(Upload, { props: { listType: 'picture' } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            expect(wrapper.find('.animal-upload__file-icon').exists()).toBe(false);
        });
    });

    describe('real upload (action)', () => {
        let latestXhr: {
            open: ReturnType<typeof vi.fn>;
            send: ReturnType<typeof vi.fn>;
            abort: ReturnType<typeof vi.fn>;
            setRequestHeader: ReturnType<typeof vi.fn>;
            withCredentials?: boolean;
            status: number;
            onload: (() => void) | null;
            onerror: (() => void) | null;
            onabort: (() => void) | null;
            upload: { onprogress: ((e: ProgressEvent) => void) | null };
            sentForm?: FormData | null;
        };
        class FakeXHR {
            open = vi.fn();
            send = vi.fn((body?: FormData) => {
                latestXhr.sentForm = body ?? null;
            });
            abort = vi.fn();
            setRequestHeader = vi.fn();
            status = 200;
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            onabort: (() => void) | null = null;
            upload: { onprogress: ((e: ProgressEvent) => void) | null } = { onprogress: null };
            constructor() {
                latestXhr = this as unknown as typeof latestXhr;
            }
        }
        beforeEach(() => {
            latestXhr = undefined!;
            vi.stubGlobal('XMLHttpRequest', FakeXHR);
        });
        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('uses XHR FormData upload when action is provided', async () => {
            const wrapper = mount(Upload, { props: { action: '/api/upload' } });
            await pickFiles(findInput(wrapper), [makeFile('a.png', 'image/png')]);
            expect(latestXhr.open).toHaveBeenCalledWith('POST', '/api/upload', true);
            expect(latestXhr.send).toHaveBeenCalled();
        });

        it('supports function form for action (per-file URL)', async () => {
            const wrapper = mount(Upload, {
                props: { action: (file: File) => `/oss/${file.name}` },
            });
            await pickFilesAsync(findInput(wrapper), [makeFile('k.txt')]);
            expect(latestXhr.open).toHaveBeenCalledWith('POST', '/oss/k.txt', true);
        });

        it('supports function form for data (per-file signature)', async () => {
            const wrapper = mount(Upload, {
                props: { action: '/api', data: (file: File) => ({ filename: file.name, sign: 'abc' }) },
            });
            await pickFilesAsync(findInput(wrapper), [makeFile('v.txt')]);
            const form = latestXhr.sentForm as FormData;
            expect(form.get('filename')).toBe('v.txt');
            expect(form.get('sign')).toBe('abc');
        });

        it('awaits an async action (per-file signed URL) instead of sending a Promise', async () => {
            const wrapper = mount(Upload, { props: { action: () => Promise.resolve('/oss/signed') } });
            await pickFilesAsync(findInput(wrapper), [makeFile('s.txt')]);
            expect(latestXhr.open).toHaveBeenCalledWith('POST', '/oss/signed', true);
        });

        it('marks error when the resolved action is empty (no silent 0% spin)', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { action: () => '', onChange } });
            await pickFilesAsync(findInput(wrapper), [makeFile('e.txt')]);
            const info = onChange.mock.calls.at(-1)![0] as { file: { status?: string } };
            expect(info.file.status).toBe('error');
            expect(latestXhr).toBeUndefined();
            expect(wrapper.find('[aria-label="上传失败"]').exists()).toBe(true);
        });

        it('marks error when resolving action / data throws', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, {
                props: {
                    onChange,
                    action: () => {
                        throw new Error('sign failed');
                    },
                },
            });
            await pickFilesAsync(findInput(wrapper), [makeFile('e.txt')]);
            const info = onChange.mock.calls.at(-1)![0] as { file: { status?: string; error?: unknown } };
            expect(info.file.status).toBe('error');
            expect(info.file.error).toBeInstanceOf(Error);
        });

        it('honors method / headers / withCredentials / data', async () => {
            const wrapper = mount(Upload, {
                props: {
                    action: '/api/upload',
                    method: 'PUT',
                    headers: { Authorization: 'Bearer abc' },
                    data: { source: 'demo' },
                    withCredentials: true,
                },
            });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            expect(latestXhr.withCredentials).toBe(true);
            expect(latestXhr.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer abc');
        });

        it('passes Blob/File data fields through FormData without stringifying', async () => {
            const attachment = new File(['payload'], 'att.txt', { type: 'text/plain' });
            const blob = new Blob(['payload'], { type: 'text/plain' });
            const wrapper = mount(Upload, {
                props: { action: '/api/upload', data: { source: 'demo', attachment, extraBlob: blob } },
            });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            const form = latestXhr.sentForm as FormData;
            expect(form.get('source')).toBe('demo');
            expect(form.get('attachment')).toBe(attachment);
            const storedBlob = form.get('extraBlob');
            expect(typeof storedBlob).not.toBe('string');
            expect(storedBlob).toBeInstanceOf(File);
        });

        it('maps progress and 2xx response to uploading/done', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { action: '/api/upload', onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.png', 'image/png')]);
            const xhr = latestXhr;
            xhr.upload.onprogress!({ lengthComputable: true, loaded: 50, total: 100 } as ProgressEvent);
            let list = lastList(onChange);
            expect(list[0].percent).toBe(50);
            expect(list[0].status).toBe('uploading');
            xhr.status = 200;
            xhr.onload!();
            list = lastList(onChange);
            expect(list[0].status).toBe('done');
            await nextTick();
            expect(wrapper.find('[aria-label="上传完成"]').exists()).toBe(true);
        });

        it('marks error on a non-2xx response', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { action: '/api/upload', onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            latestXhr.status = 500;
            latestXhr.onload!();
            expect(lastList(onChange)[0].status).toBe('error');
            await nextTick();
            expect(wrapper.find('[aria-label="上传失败"]').exists()).toBe(true);
        });

        it('aborts the in-flight request when the file is removed', async () => {
            const wrapper = mount(Upload, { props: { action: '/api/upload' } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            const xhr = latestXhr;
            await wrapper.find('[aria-label="删除 a.txt"]').trigger('click');
            expect(xhr.abort).toHaveBeenCalled();
        });

        it('customRequest takes precedence over action', async () => {
            let api: { onError: () => void } | null = null;
            const onChange = vi.fn();
            const wrapper = mount(Upload, {
                props: {
                    action: '/api/upload',
                    customRequest: (options: typeof api) => {
                        api = options;
                    },
                    onChange,
                },
            });
            await pickFiles(findInput(wrapper), [makeFile('x.txt')]);
            expect(latestXhr).toBeUndefined();
            api!.onError();
            expect(lastList(onChange)[0].status).toBe('error');
        });

        it('attaches the server response to file.response after a 2xx upload', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { action: '/api/upload', onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            latestXhr.response = 'ok';
            latestXhr.status = 200;
            latestXhr.onload!();
            const info = onChange.mock.calls.at(-1)![0] as {
                file: { response?: unknown };
                fileList: Array<{ response?: unknown }>;
            };
            expect(info.file.response).toBe('ok');
            expect(info.fileList[0].response).toBe('ok');
        });
    });

    describe('showUploadList', () => {
        it('hides the text list when showUploadList=false', async () => {
            const wrapper = mount(Upload, { props: { showUploadList: false } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            expect(wrapper.find('.animal-upload__text-list').exists()).toBe(false);
            expect(wrapper.find('[aria-label="上传文件"]').exists()).toBe(true);
        });

        it('picture-card with showUploadList=false shows only the add tile', async () => {
            const wrapper = mount(Upload, { props: { listType: 'picture-card', showUploadList: false } });
            await pickFiles(findInput(wrapper), [makeFile('pic.png', 'image/png')]);
            expect(wrapper.find('.animal-upload__card').exists()).toBe(false);
            expect(wrapper.find('[aria-label="上传文件"]').exists()).toBe(true);
        });

        it('showUploadList={ showRemoveIcon: false } hides the remove button', async () => {
            const wrapper = mount(Upload, { props: { showUploadList: { showRemoveIcon: false } } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            expect(wrapper.find('[aria-label="删除 a.txt"]').exists()).toBe(false);
        });
    });

    describe('preview', () => {
        it('fires the preview event when listener is attached (no built-in lightbox)', async () => {
            const onPreview = vi.fn();
            const wrapper = mount(Upload, {
                props: { listType: 'picture-card', onPreview },
            });
            await pickFiles(findInput(wrapper), [makeFile('pic.png', 'image/png')]);
            await wrapper.find('[aria-label="预览 pic.png"]').trigger('click');
            expect(onPreview).toHaveBeenCalledTimes(1);
            expect(onPreview.mock.calls[0][0]).toMatchObject({ name: 'pic.png' });
            expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
        });

        it('opens the built-in lightbox from a text-row image when no listener is given', async () => {
            const wrapper = mount(Upload);
            await pickFiles(findInput(wrapper), [makeFile('pic.png', 'image/png')]);
            await wrapper.find('[aria-label="预览 pic.png"]').trigger('click');
            expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
        });

        it('does not render a preview eye for non-image files', async () => {
            const wrapper = mount(Upload, { props: { onPreview: vi.fn() } });
            await pickFiles(findInput(wrapper), [makeFile('doc.pdf', 'application/pdf')]);
            expect(wrapper.find('[aria-label="预览 doc.pdf"]').exists()).toBe(false);
        });
    });

    describe('change shape + thumbUrl + removed', () => {
        it('passes { file, fileList } and surfaces the changed file', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            const info = onChange.mock.calls.at(-1)![0] as { file: { name: string }; fileList: UploadFile[] };
            expect(info.file.name).toBe('a.txt');
            expect(info.fileList).toHaveLength(1);
        });

        it('exposes originFileObj and thumbUrl (url stays the download/remote address)', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { onChange } });
            await pickFiles(findInput(wrapper), [makeFile('pic.png', 'image/png')]);
            const info = onChange.mock.calls.at(-1)![0] as {
                file: { thumbUrl?: string; url?: string; originFileObj?: File };
            };
            expect(info.file.originFileObj).toBeInstanceOf(File);
            expect(info.file.originFileObj!.name).toBe('pic.png');
            expect(info.file.thumbUrl).toBe('blob:mock-url');
            expect(info.file.url).toBeUndefined();
        });

        it('reports a removed file with status:"removed" via onChange', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            await wrapper.find('[aria-label="删除 a.txt"]').trigger('click');
            const info = onChange.mock.calls.at(-1)![0] as { file: { status?: string } };
            expect(info.file.status).toBe('removed');
        });

        it('sets the webkitdirectory attribute when directory=true and omits it otherwise', () => {
            const wrapper = mount(Upload, { props: { directory: true } });
            expect(findInput(wrapper).getAttribute('webkitdirectory')).not.toBeNull();
            const plain = mount(Upload);
            expect(findInput(plain).getAttribute('webkitdirectory')).toBeNull();
        });
    });

    describe('onExceed', () => {
        it('fires with the dropped files when maxCount>1 is already full', async () => {
            const onExceed = vi.fn();
            const wrapper = mount(Upload, {
                props: {
                    maxCount: 2,
                    onExceed,
                    defaultFileList: [
                        { uid: '1', name: 'old1.txt', status: 'done' },
                        { uid: '2', name: 'old2.txt', status: 'done' },
                    ],
                },
            });
            const extra = makeFile('new.txt');
            await pickFiles(findInput(wrapper), [extra]);
            await flushMicro();
            expect(onExceed).toHaveBeenCalledTimes(1);
            expect(onExceed.mock.calls[0][0]).toEqual([extra]);
        });

        it('does not fire for maxCount=1 replacement (the old file is replaced, not exceeded)', async () => {
            const onExceed = vi.fn();
            const wrapper = mount(Upload, {
                props: {
                    maxCount: 1,
                    onExceed,
                    defaultFileList: [{ uid: '1', name: 'old.txt', status: 'done' }],
                },
            });
            await pickFiles(findInput(wrapper), [makeFile('new.txt')]);
            await flushMicro();
            expect(onExceed).not.toHaveBeenCalled();
        });
    });

    describe('boundary', () => {
        it('maxCount={0} is treated as unlimited instead of blocking every selection', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { maxCount: 0, onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt')]);
            expect(lastList(onChange)).toHaveLength(1);
        });

        it('keeps only the first file when multiple is false (drag can bypass the input limit)', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { drag: true, onChange } });
            const zone = wrapper.get('[role="button"][aria-label="上传文件"]');
            await zone.trigger('drop', { dataTransfer: { files: [makeFile('a.txt'), makeFile('b.txt')] } });
            const list = lastList(onChange);
            expect(list.map((f) => f.name)).toEqual(['a.txt']);
        });

        it('does not truncate a folder selection when directory is set (without multiple)', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { directory: true, onChange } });
            await pickFiles(findInput(wrapper), [makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')]);
            const list = lastList(onChange);
            expect(list.map((f) => f.name)).toEqual(['a.txt', 'b.txt', 'c.txt']);
        });

        it('disables the remove buttons when disabled', () => {
            const wrapper = mount(Upload, {
                props: { disabled: true, defaultFileList: [{ uid: '1', name: 'a.txt' }] },
            });
            expect((wrapper.find('[aria-label="删除 a.txt"]').element as HTMLButtonElement).disabled).toBe(true);
        });

        it('filters dropped files by accept (the input attribute cannot police drag & drop)', async () => {
            const onChange = vi.fn();
            const wrapper = mount(Upload, { props: { drag: true, multiple: true, accept: 'image/*', onChange } });
            const zone = wrapper.get('[role="button"][aria-label="上传文件"]');
            await zone.trigger('drop', {
                dataTransfer: { files: [makeFile('a.txt'), makeFile('b.png', 'image/png')] },
            });
            const names = lastList(onChange).map((f) => f.name);
            expect(names).toEqual(['b.png']);
        });

        it('renders tip text below the trigger and picture-card grid', () => {
            const w1 = mount(Upload, { props: { tip: '单个文件不超过 5 MB' } });
            expect(w1.find('.animal-upload__tip').text()).toBe('单个文件不超过 5 MB');
            const w2 = mount(Upload, { props: { listType: 'picture-card', tip: '最多 4 张' } });
            expect(w2.find('.animal-upload__tip').text()).toBe('最多 4 张');
        });

        it('marks error when customRequest throws synchronously', async () => {
            const onChange = vi.fn();
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const wrapper = mount(Upload, {
                props: {
                    multiple: true,
                    onChange,
                    customRequest: () => {
                        throw new Error('customRequest boom');
                    },
                },
            });
            await pickFiles(findInput(wrapper), [makeFile('a.txt'), makeFile('b.txt')]);
            const list = lastList(onChange);
            expect(list.map((f) => f.status)).toEqual(['error', 'error']);
            expect(spy).toHaveBeenCalledTimes(2);
            spy.mockRestore();
        });
    });
});
