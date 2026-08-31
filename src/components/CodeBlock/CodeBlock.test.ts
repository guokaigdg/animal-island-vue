import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { flushPromises } from '@vue/test-utils';
import CodeBlock from './CodeBlock.vue';

const mockClipboard = (writeText: ((text: string) => Promise<void>) | undefined) => {
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: writeText ? { writeText } : undefined,
    });
};

const mockExecCommand = (fn: () => boolean | void) => {
    Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(fn) });
};

describe('CodeBlock', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('渲染 code 内容到 pre 元素', () => {
        const code = "const a = 'hello';";
        const wrapper = mount(CodeBlock, { props: { code } });
        const pre = wrapper.find('pre');
        expect(pre.exists()).toBe(true);
        expect(pre.text()).toContain('const');
        expect(pre.text()).toContain('hello');
    });

    it('应用 className 与 style', () => {
        const wrapper = mount(CodeBlock, {
            props: { code: 'x' },
            attrs: { class: 'cb', style: 'border-radius: 4px;' },
        });
        const pre = wrapper.find('pre');
        expect(pre.classes()).toContain('cb');
        expect(pre.attributes('style')).toContain('border-radius: 4px');
    });

    it('对象 style 时尺寸/外边距作用到 wrapper，其余作用到 pre', () => {
        const wrapper = mount(CodeBlock, {
            props: { code: 'x' },
            attrs: { style: { width: '300px', margin: '16px 0', borderRadius: '5px' } },
        });
        const root = wrapper.find('div');
        const pre = wrapper.find('pre');
        expect(root.attributes('style')).toContain('width');
        expect(root.attributes('style')).toContain('margin');
        expect(pre.attributes('style')).toContain('border-radius');
        expect(pre.attributes('style')).not.toContain('width');
    });

    it('有复制按钮且未自定义 padding 时，pre 增加 paddingRight 给按钮留位', () => {
        const wrapper = mount(CodeBlock, {
            props: { code: 'x' },
            attrs: { style: { borderRadius: '5px' } },
        });
        expect(wrapper.find('pre').attributes('style')).toContain('padding-right: 96px');
    });

    it('自定义 padding 时不追加 paddingRight', () => {
        const wrapper = mount(CodeBlock, {
            props: { code: 'x' },
            attrs: { style: { padding: '10px 20px' } },
        });
        const style = wrapper.find('pre').attributes('style') || '';
        expect(style).not.toContain('96px');
    });

    it('为代码片段产生多个高亮 span', () => {
        const wrapper = mount(CodeBlock, { props: { code: 'function foo() { return 1; }' } });
        const pre = wrapper.find('pre');
        expect(pre.findAll('span').length).toBeGreaterThan(0);
    });

    it('识别块注释 /* ... */', () => {
        const wrapper = mount(CodeBlock, { props: { code: '/* block comment */ x' } });
        const pre = wrapper.find('pre');
        // 至少有一个非空的高亮 span
        const styledSpans = pre.findAll('span').filter((s) => {
            const style = s.attributes('style') || '';
            return style.includes('color');
        });
        expect(styledSpans.length).toBeGreaterThan(0);
    });

    it('识别 JSX 标签 <MyComp />', () => {
        const wrapper = mount(CodeBlock, { props: { code: '<MyComp />' } });
        const pre = wrapper.find('pre');
        expect(pre.text()).toContain('MyComp');
    });

    it('空 code 不挂掉', () => {
        const wrapper = mount(CodeBlock, { props: { code: '' } });
        expect(wrapper.find('pre').exists()).toBe(true);
    });

    it('默认显示复制按钮并复制成功', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        mockClipboard(writeText);
        const onCopy = vi.fn();
        const wrapper = mount(CodeBlock, { props: { code: 'const island = true;', onCopy } });

        const button = wrapper.find('button');
        expect(button.exists()).toBe(true);
        expect(button.attributes('aria-label')).toBe('复制代码');
        expect(button.text()).toBe('复制');

        await button.trigger('click');
        await flushPromises();

        expect(writeText).toHaveBeenCalledWith('const island = true;');
        expect(onCopy).toHaveBeenCalledWith('const island = true;');
        expect(wrapper.find('button').attributes('aria-label')).toBe('代码已复制');
        expect(wrapper.find('button').text()).toBe('已复制');
    });

    it('复制成功 2 秒后按钮状态复位', async () => {
        vi.useFakeTimers();
        mockClipboard(vi.fn().mockResolvedValue(undefined));
        const wrapper = mount(CodeBlock, { props: { code: 'x' } });

        await wrapper.find('button').trigger('click');
        await vi.advanceTimersByTimeAsync(2_000);
        await flushPromises();

        expect(wrapper.find('button').text()).toBe('复制');
    });

    it('复制失败时给出反馈', async () => {
        mockClipboard(vi.fn().mockRejectedValue(new Error('denied')));
        const wrapper = mount(CodeBlock, { props: { code: 'x' } });

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(wrapper.find('button').attributes('aria-label')).toBe('代码复制失败');
        expect(wrapper.find('button').text()).toBe('复制失败');
    });

    it('Clipboard API 不可用时使用兼容复制方案', async () => {
        mockClipboard(undefined);
        const execCommand = vi.fn().mockReturnValue(true);
        mockExecCommand(execCommand);
        const wrapper = mount(CodeBlock, { props: { code: 'fallback' } });

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(execCommand).toHaveBeenCalledWith('copy');
        expect(document.querySelector('textarea')).toBeNull();
        expect(wrapper.find('button').attributes('aria-label')).toBe('代码已复制');
    });

    it('兼容复制方案抛错时仍清理临时元素', async () => {
        mockClipboard(undefined);
        mockExecCommand(() => {
            throw new Error('blocked');
        });
        const wrapper = mount(CodeBlock, { props: { code: 'fallback' } });

        await wrapper.find('button').trigger('click');
        await flushPromises();

        expect(document.querySelector('textarea')).toBeNull();
        expect(wrapper.find('button').attributes('aria-label')).toBe('代码复制失败');
    });

    it('copyable=false 时隐藏复制按钮', () => {
        const wrapper = mount(CodeBlock, { props: { code: 'x', copyable: false } });
        expect(wrapper.find('button').exists()).toBe(false);
    });
});
