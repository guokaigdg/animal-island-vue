import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import Image from './Image.vue';

// 收集所有 wrapper，afterEach 统一 unmount，避免残留的 document keydown 监听器
// 与 Teleport 弹层污染后续测试
const wrappers: VueWrapper[] = [];

function mountImage(options?: Parameters<typeof mount>[1]) {
    const wrapper = mount(Image, options);
    wrappers.push(wrapper);
    return wrapper;
}

afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    wrappers.length = 0;
    document.body.innerHTML = '';
});

function getDialog(): HTMLElement | null {
    return document.querySelector('[role="dialog"]');
}
function getMask(): HTMLElement | null {
    return document.querySelector('.animal-image__mask');
}
function getCloseBtn(): HTMLButtonElement | null {
    return document.querySelector('.animal-image__close-btn');
}

describe('Image', () => {
    it('渲染 img 并透传 src / alt', () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: '岛屿风景' } });
        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBe('photo.png');
        expect(img.attributes('alt')).toBe('岛屿风景');
    });

    it('默认相框类名（圆角与边框来自样式表）', () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: 'x' } });
        expect(wrapper.find('.animal-image').exists()).toBe(true);
    });

    it('width / height 生效（数字自动加 px）', () => {
        const wrapper = mountImage({
            props: { src: 'photo.png', alt: 'x', width: 200, height: 120 },
        });
        const style = wrapper.find('.animal-image').attributes('style') ?? '';
        expect(style).toMatch(/width:\s*200px/);
        expect(style).toMatch(/height:\s*120px/);
    });

    it('color 应用对应调色板类名（非 white 时）', () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: 'x', color: 'app-pink' } });
        expect(wrapper.find('.animal-image').classes()).toContain('animal-image--app-pink');
    });

    it('未传 color 或 color=white 时不添加调色板类（默认白色）', () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: 'x' } });
        const cls = wrapper.find('.animal-image').classes();
        expect(cls).not.toContain('animal-image--app-pink');
        expect(cls).not.toContain('animal-image--default');
        const white = mountImage({ props: { src: 'photo.png', alt: 'x', color: 'white' } });
        expect(white.find('.animal-image').classes()).not.toContain('animal-image--default');
    });

    it('color=default 应用奶油色类', () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: 'x', color: 'default' } });
        expect(wrapper.find('.animal-image').classes()).toContain('animal-image--default');
    });

    it('lazy 映射为原生 loading="lazy"', () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: 'x', lazy: true } });
        expect(wrapper.find('img').attributes('loading')).toBe('lazy');
    });

    it('lazy=false 时不输出 loading 属性', () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: 'x', lazy: false } });
        expect(wrapper.find('img').attributes('loading')).toBeUndefined();
    });

    it('load 事件触发后应用加载完成类', async () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: 'x' } });
        await wrapper.find('img').trigger('load');
        expect(wrapper.emitted('load')).toHaveLength(1);
        expect(wrapper.find('.animal-image').classes()).toContain('animal-image--loaded');
    });

    it('error 事件：加载失败时显示错误占位', async () => {
        const wrapper = mountImage({ props: { src: 'broken.png', alt: '坏图' } });
        await wrapper.find('img').trigger('error');
        expect(wrapper.emitted('error')).toHaveLength(1);
        expect(wrapper.find('.animal-image').classes()).toContain('animal-image--error');
        expect(wrapper.text()).toContain('图片加载失败');
        expect(wrapper.find('.animal-image').attributes('aria-label')).toBe('坏图');
    });

    it('error 时 aria-label 回退为「图片加载失败」', async () => {
        const wrapper = mountImage({ props: { src: 'broken.png' } });
        await wrapper.find('img').trigger('error');
        expect(wrapper.find('.animal-image').attributes('aria-label')).toBe('图片加载失败');
    });

    it('应用 class 与 style', () => {
        const wrapper = mountImage({
            props: { src: 'photo.png', alt: 'x' },
            attrs: { class: 'my-img', style: 'margin: 4px' },
        });
        const frame = wrapper.find('.animal-image');
        expect(frame.classes()).toContain('my-img');
        expect(frame.attributes('style') ?? '').toMatch(/margin:\s*4px/);
    });

    it('preview 默认开启：未传 preview 也可点击预览', async () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: '默认预览' } });
        // preview 默认 true → 相框为 button
        await wrapper.find('button').trigger('click');
        await nextTick();
        expect(getDialog()).not.toBeNull();
    });

    it('preview：点击图片打开大图预览（dialog aria-label 带图片名）', async () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: '预览图', preview: true } });
        await wrapper.find('button').trigger('click');
        await nextTick();
        const dialog = getDialog();
        expect(dialog).not.toBeNull();
        expect(dialog?.getAttribute('aria-label')).toBe('查看图片：预览图');
    });

    it('preview：点击关闭按钮关闭预览', async () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: '预览图', preview: true } });
        await wrapper.find('button').trigger('click');
        await nextTick();
        getCloseBtn()!.click();
        await nextTick();
        expect(getDialog()).toBeNull();
    });

    it('preview：按 ESC 关闭预览', async () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: '预览图', preview: true } });
        await wrapper.find('button').trigger('click');
        await nextTick();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await nextTick();
        expect(getDialog()).toBeNull();
    });

    it('preview：点击遮罩空白处关闭预览', async () => {
        const wrapper = mountImage({ props: { src: 'photo.png', alt: '预览图', preview: true } });
        await wrapper.find('button').trigger('click');
        await nextTick();
        getMask()!.click();
        await nextTick();
        expect(getDialog()).toBeNull();
    });

    it('preview：加载失败时不渲染预览按钮', async () => {
        const wrapper = mountImage({ props: { src: 'broken.png', alt: '坏图', preview: true } });
        await wrapper.find('img').trigger('error');
        await nextTick();
        expect(wrapper.find('button').exists()).toBe(false);
        expect(wrapper.text()).toContain('图片加载失败');
    });

    it('preview=false 时相框为 span，不渲染 button', () => {
        const wrapper = mountImage({
            props: { src: 'photo.png', alt: 'x', preview: false },
        });
        expect(wrapper.find('button').exists()).toBe(false);
        expect(wrapper.find('.animal-image').element.tagName).toBe('SPAN');
    });

    it('src 变化时重置加载状态', async () => {
        const wrapper = mountImage({ props: { src: 'a.png', alt: 'x' } });
        await wrapper.find('img').trigger('load');
        expect(wrapper.find('.animal-image').classes()).toContain('animal-image--loaded');
        await wrapper.setProps({ src: 'b.png' });
        expect(wrapper.find('.animal-image').classes()).not.toContain('animal-image--loaded');
    });
});
