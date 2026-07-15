import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CodeBlock from './CodeBlock.vue';

describe('CodeBlock', () => {
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
});
