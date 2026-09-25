import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import Avatar from './Avatar.vue';
import AvatarGroup from './AvatarGroup.vue';
import { UserIcon } from '../Icon';

/** 模拟 naive 图标风格的组件作为 children（SFC 组件 type 为 object） */
const AFish = defineComponent({
    setup: () => () => h('svg', { 'data-testid': 'fish-icon', 'aria-hidden': 'true' }),
});

const rootEl = (wrapper: ReturnType<typeof mount>) => wrapper.element as HTMLElement;

describe('Avatar', () => {
    it('renders a placeholder with the default user icon when no src', () => {
        const wrapper = mount(Avatar);
        const root = rootEl(wrapper);
        expect(root.getAttribute('role')).toBe('img');
        expect(root.getAttribute('aria-label')).toBe('avatar');
        expect(root.classList.contains('animal-avatar')).toBe(true);
        expect(root.classList.contains('animal-avatar--placeholder')).toBe(true);
    });

    it('renders text children as the placeholder content', () => {
        const wrapper = mount(Avatar, { slots: { default: 'U' } });
        expect(wrapper.find('.animal-avatar__string').text()).toBe('U');
    });

    it('renders a component child as an icon avatar', () => {
        const wrapper = mount(Avatar, { slots: { default: () => h(AFish) } });
        const root = rootEl(wrapper);
        expect(root.classList.contains('animal-avatar')).toBe(true);
        expect(root.classList.contains('animal-avatar--placeholder')).toBe(true);
        expect(wrapper.find('[data-testid="fish-icon"]').exists()).toBe(true);
        // 图标头像由居中容器包裹，但不会套用文字测量缩放（无内联 fontSize）
        const str = wrapper.find('.animal-avatar__string');
        expect(str.exists()).toBe(true);
        expect(str.element.getAttribute('style')).toBeNull();
    });

    it('renders a custom icon node as the placeholder content', () => {
        const wrapper = mount(Avatar, {
            props: {
                icon: h(UserIcon, { 'data-testid': 'custom-icon' }),
            },
        });
        expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true);
    });

    it('applies the numeric size to width/height', () => {
        const wrapper = mount(Avatar, { props: { size: 56 }, slots: { default: 'A' } });
        const root = rootEl(wrapper);
        expect(root.style.width).toBe('56px');
        expect(root.style.height).toBe('56px');
    });

    it('applies square shape class', () => {
        const wrapper = mount(Avatar, { props: { shape: 'square' } });
        expect(rootEl(wrapper).classList.contains('animal-avatar--shape-square')).toBe(true);
    });

    it('renders an img with alt text when src is provided', () => {
        const wrapper = mount(Avatar, { props: { src: '/u.png', alt: 'U' } });
        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('alt')).toBe('U');
    });

    it('renders a decorative image when alt is omitted', () => {
        const wrapper = mount(Avatar, { props: { src: '/u.png' } });
        expect(wrapper.find('img').attributes('alt')).toBe('');
    });

    it('falls back to placeholder content when the image fails to load', async () => {
        const wrapper = mount(Avatar, { props: { src: '/broken.png' }, slots: { default: 'U' } });
        await wrapper.find('img').trigger('error');
        await nextTick();
        expect(wrapper.find('img').exists()).toBe(false);
        expect(wrapper.text()).toContain('U');
    });

    it('keeps the img when onError returns false', async () => {
        const wrapper = mount(Avatar, { props: { src: '/broken.png', onError: () => false } });
        await wrapper.find('img').trigger('error');
        await nextTick();
        expect(wrapper.find('img').exists()).toBe(true);
    });

    it('does not apply the placeholder class when an image is loaded', () => {
        const wrapper = mount(Avatar, { props: { src: '/ok.png' } });
        const root = rootEl(wrapper);
        expect(root.classList.contains('animal-avatar')).toBe(true);
        expect(root.classList.contains('animal-avatar--placeholder')).toBe(false);
    });

    it('renders custom className and spreads HTML attributes', () => {
        const wrapper = mount(Avatar, { attrs: { class: 'my-avatar', 'data-role': 'x' } });
        const root = rootEl(wrapper);
        expect(root.classList.contains('my-avatar')).toBe(true);
        expect(root.getAttribute('data-role')).toBe('x');
    });
});

describe('AvatarGroup', () => {
    it('renders all children without maxCount', () => {
        const wrapper = mount(AvatarGroup, {
            slots: {
                default: () => [
                    h(Avatar, {}, 'A'),
                    h(Avatar, {}, 'B'),
                    h(Avatar, {}, 'C'),
                ],
            },
        });
        expect(wrapper.text()).toContain('A');
        expect(wrapper.text()).toContain('B');
        expect(wrapper.text()).toContain('C');
    });

    it('collapses beyond maxCount into a "+N" badge', () => {
        const wrapper = mount(AvatarGroup, {
            props: { maxCount: 2 },
            slots: {
                default: () => [
                    h(Avatar, {}, 'A'),
                    h(Avatar, {}, 'B'),
                    h(Avatar, {}, 'C'),
                    h(Avatar, {}, 'D'),
                ],
            },
        });
        expect(wrapper.text()).toContain('A');
        expect(wrapper.text()).toContain('B');
        expect(wrapper.text()).not.toContain('C');
        expect(wrapper.find('.animal-avatar-group__more').text()).toBe('+2');
    });

    it('injects group-level size and shape into child Avatars', () => {
        const wrapper = mount(AvatarGroup, {
            props: { size: 'large', shape: 'square' },
            slots: { default: () => h(Avatar, {}, 'A') },
        });
        const child = wrapper.find('.animal-avatar');
        expect((child.element as HTMLElement).style.width).toBe('48px');
        expect(child.classes()).toContain('animal-avatar--shape-square');
    });

    it('does not override a child Avatar that sets its own size', () => {
        const wrapper = mount(AvatarGroup, {
            props: { size: 'large' },
            slots: { default: () => h(Avatar, { size: 24 }, 'A') },
        });
        const child = wrapper.find('.animal-avatar');
        expect((child.element as HTMLElement).style.width).toBe('24px');
    });

    it('does not render the "+N" badge when children count equals maxCount', () => {
        const wrapper = mount(AvatarGroup, {
            props: { maxCount: 3 },
            slots: {
                default: () => [
                    h(Avatar, {}, 'A'),
                    h(Avatar, {}, 'B'),
                    h(Avatar, {}, 'C'),
                ],
            },
        });
        expect(wrapper.find('.animal-avatar-group__more').exists()).toBe(false);
    });
});