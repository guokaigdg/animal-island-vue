import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Icon from './Icon.vue';
import { ICON_LIST } from './types';

describe('Icon', () => {
    it('name 模式应用对应 className', () => {
        const wrapper = mount(Icon, { props: { name: 'icon-miles' } });
        expect(wrapper.classes()).toContain('animal-icon');
        expect(wrapper.classes()).toContain('animal-icon--icon-miles');
    });

    it('size 应用为内联 width/height', () => {
        const wrapper = mount(Icon, { props: { name: 'icon-camera', size: 32 } });
        expect(wrapper.attributes('style')).toContain('width: 32px');
        expect(wrapper.attributes('style')).toContain('height: 32px');
    });

    it('支持字符串 size（如 100%）', () => {
        const wrapper = mount(Icon, { props: { name: 'icon-camera', size: '100%' } });
        expect(wrapper.attributes('style')).toContain('width: 100%');
    });

    it('bounce=true 应用 icon-bounce', () => {
        const wrapper = mount(Icon, { props: { name: 'icon-camera', bounce: true } });
        expect(wrapper.classes()).toContain('animal-icon--bounce');
    });

    it('应用自定义 className 与 style', () => {
        const wrapper = mount(Icon, {
            props: { name: 'icon-camera' },
            attrs: { class: 'extra', style: 'opacity: 0.5' },
        });
        expect(wrapper.classes()).toContain('extra');
        expect(wrapper.attributes('style')).toContain('opacity: 0.5');
    });

    it('src 模式设置 backgroundImage', () => {
        const wrapper = mount(Icon, { props: { src: '/foo/item-001.png' } });
        expect(wrapper.attributes('style')).toContain('/foo/item-001.png');
    });

    it('未传 size 时默认 24px', () => {
        const wrapper = mount(Icon, { props: { name: 'icon-miles' } });
        expect(wrapper.attributes('style')).toContain('width: 24px');
        expect(wrapper.attributes('style')).toContain('height: 24px');
    });

    it('既无 name 也无 src 时只有基础 icon 类、无 backgroundImage', () => {
        const wrapper = mount(Icon);
        expect(wrapper.classes()).toContain('animal-icon');
        expect(wrapper.attributes('style') || '').not.toContain('background-image');
    });

    it('未传 src 时不设置 backgroundImage', () => {
        const wrapper = mount(Icon, { props: { name: 'icon-camera' } });
        expect(wrapper.attributes('style') || '').not.toContain('background-image');
    });

    it('bounce 默认 false，不应用 icon-bounce', () => {
        const wrapper = mount(Icon, { props: { name: 'icon-camera' } });
        expect(wrapper.classes()).not.toContain('animal-icon--bounce');
    });

    it('同时传入 name 与 src：应用 name 类并设置 backgroundImage', () => {
        const wrapper = mount(Icon, { props: { name: 'icon-map', src: '/foo/item-001.png' } });
        expect(wrapper.classes()).toContain('animal-icon--icon-map');
        expect(wrapper.attributes('style')).toContain('/foo/item-001.png');
    });

    it('透传未知属性到根节点（如 data-* / aria-label）', () => {
        const wrapper = mount(Icon, {
            props: { name: 'icon-miles' },
            attrs: { 'data-testid': 'my-icon', 'aria-label': '里程' },
        });
        expect(wrapper.attributes('data-testid')).toBe('my-icon');
        expect(wrapper.attributes('aria-label')).toBe('里程');
    });

    it('style 可覆盖默认的 width/height', () => {
        const wrapper = mount(Icon, {
            props: { name: 'icon-miles', size: 32 },
            attrs: { style: 'width: 50px' },
        });
        expect(wrapper.attributes('style')).toContain('width: 50px');
        expect(wrapper.attributes('style')).toContain('height: 32px');
    });

    it('为每个具名图标渲染对应的 className', () => {
        ICON_LIST.forEach(({ name }) => {
            const wrapper = mount(Icon, { props: { name } });
            expect(wrapper.classes()).toContain(`animal-icon--${name}`);
            wrapper.unmount();
        });
    });

    it('ICON_LIST 含全部 10 个具名图标且无重复', () => {
        const names = ICON_LIST.map((i) => i.name);
        expect(names).toEqual([
            'icon-miles',
            'icon-camera',
            'icon-chat',
            'icon-critterpedia',
            'icon-design',
            'icon-diy',
            'icon-helicopter',
            'icon-map',
            'icon-shopping',
            'icon-variant',
        ]);
        expect(new Set(names).size).toBe(names.length);
    });

    it('ICON_LIST 每项都带非空 label', () => {
        ICON_LIST.forEach(({ label }) => {
            expect(typeof label).toBe('string');
            expect(label.length).toBeGreaterThan(0);
        });
    });
});
