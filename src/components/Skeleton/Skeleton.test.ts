import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Skeleton from './Skeleton.vue';
import SkeletonButton from './SkeletonButton.vue';
import SkeletonInput from './SkeletonInput.vue';
import SkeletonAvatar from './SkeletonAvatar.vue';

describe('Skeleton', () => {
    it('variant=text 渲染默认骨架', () => {
        const wrapper = mount(Skeleton, { props: { variant: 'text' } });
        expect(wrapper.find('.animal-skeleton').exists()).toBe(true);
    });

    it('variant=circle 渲染圆形', () => {
        const wrapper = mount(Skeleton, { props: { variant: 'circle', widthValue: 44 } });
        expect(wrapper.find('.animal-skeleton--vt-circle').exists()).toBe(true);
    });

    it('variant=rect 渲染矩形', () => {
        const wrapper = mount(Skeleton, { props: { variant: 'rect', widthValue: 200, heightValue: 120 } });
        expect(wrapper.find('.animal-skeleton--vt-rect').exists()).toBe(true);
    });

    it('variant=paragraph 渲染多行', () => {
        const wrapper = mount(Skeleton, { props: { variant: 'paragraph', rows: 3 } });
        expect(wrapper.find('.animal-skeleton--vt-paragraph').exists()).toBe(true);
        const lines = wrapper.findAll('.animal-skeleton--line');
        expect(lines.length).toBe(3);
    });

    it('loading=false 时渲染 children', () => {
        const wrapper = mount(Skeleton, {
            props: { loading: false },
            slots: { default: '内容' },
        });
        expect(wrapper.text()).toBe('内容');
    });

    it('active 类默认应用', () => {
        const wrapper = mount(Skeleton, { props: { variant: 'text', active: true } });
        expect(wrapper.find('.animal-skeleton--active').exists()).toBe(true);
    });

    it('active=false 时不加 active 类', () => {
        const wrapper = mount(Skeleton, { props: { variant: 'text', active: false } });
        expect(wrapper.find('.animal-skeleton--active').exists()).toBe(false);
    });

    it('paragraph 渲染指定行数', () => {
        const wrapper = mount(Skeleton, { props: { variant: 'paragraph', rows: 5 } });
        expect(wrapper.findAll('.animal-skeleton--line').length).toBe(5);
    });

    it('paragraph 应用 rowWidths', () => {
        const wrapper = mount(Skeleton, {
            props: { variant: 'paragraph', rows: 3, rowWidths: ['50%', '70%', '90%'] },
        });
        const lines = wrapper.findAll('.animal-skeleton--line');
        expect(lines[0].attributes('style')).toContain('50%');
        expect(lines[1].attributes('style')).toContain('70%');
        expect(lines[2].attributes('style')).toContain('90%');
    });
});

describe('SkeletonButton', () => {
    it('渲染按钮骨架', () => {
        const wrapper = mount(SkeletonButton);
        expect(wrapper.find('.animal-skeleton').exists()).toBe(true);
    });

    it('应用 size', () => {
        const wrapper = mount(SkeletonButton, { props: { size: 'large' } });
        expect(wrapper.classes()).toContain('animal-skeleton--btn-large');
    });
});

describe('SkeletonInput', () => {
    it('渲染输入框骨架', () => {
        const wrapper = mount(SkeletonInput);
        expect(wrapper.find('.animal-skeleton').exists()).toBe(true);
    });

    it('应用 size', () => {
        const wrapper = mount(SkeletonInput, { props: { size: 'small' } });
        expect(wrapper.classes()).toContain('animal-skeleton--input-small');
    });
});

describe('SkeletonAvatar', () => {
    it('渲染头像骨架', () => {
        const wrapper = mount(SkeletonAvatar);
        expect(wrapper.find('.animal-skeleton').exists()).toBe(true);
    });

    it('shape=square 渲染方形', () => {
        const wrapper = mount(SkeletonAvatar, { props: { shape: 'square' } });
        expect(wrapper.classes()).toContain('animal-skeleton--avatar-square');
    });

    it('shape=circle 渲染圆形', () => {
        const wrapper = mount(SkeletonAvatar, { props: { shape: 'circle' } });
        expect(wrapper.classes()).toContain('animal-skeleton--avatar-circle');
    });
});
