import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Icon from './Icon.vue';
import { CatIcon } from './icons';

describe('Icon', () => {
    it('renders the matching icon by name', () => {
        const wrapper = mount(Icon, { props: { name: 'Cat' } });
        const root = wrapper.find('svg');
        expect(root.exists()).toBe(true);
        expect(root.attributes('viewBox')).toBe('0 0 48 48');
        expect(root.classes()).toContain('animal-icon');
        expect(root.classes()).toContain('animal-island-icon');
    });

    it('applies size to the rendered svg', () => {
        const wrapper = mount(Icon, { props: { name: 'Cat', size: 32 } });
        const root = wrapper.find('svg');
        expect(root.attributes('width')).toBe('32');
        expect(root.attributes('height')).toBe('32');
        expect(root.attributes('style')).toContain('32px');
    });

    it('applies color and strokeWidth to the root svg', () => {
        const wrapper = mount(Icon, { props: { name: 'Cat', color: '#E76F51', strokeWidth: 7 } });
        const root = wrapper.find('svg');
        expect(root.attributes('stroke')).toBe('#E76F51');
        expect(root.attributes('stroke-width')).toBe('7');
    });

    it('keeps the inner fills as design values when fill is set', () => {
        const wrapper = mount(Icon, { props: { name: 'Cat', fill: '#2A9D8F' } });
        const root = wrapper.find('svg');
        expect(root.attributes('fill')).toBe('#2A9D8F');
        const inner = root.find('path');
        expect(inner.exists()).toBe(true);
        expect(inner.attributes('fill')).not.toBe('#2A9D8F');
    });

    it('renders a custom icon component passed via the icon prop', () => {
        const wrapper = mount(Icon, { props: { icon: CatIcon, size: 20 } });
        const root = wrapper.find('svg');
        expect(root.exists()).toBe(true);
        expect(root.attributes('width')).toBe('20');
    });

    it('renders an image background in src mode', () => {
        const wrapper = mount(Icon, { props: { src: '/cat.png', size: 24 } });
        const root = wrapper.find('span');
        expect(root.exists()).toBe(true);
        expect(root.attributes('style')).toContain('background-image');
        expect(root.attributes('style')).toContain('cat.png');
    });

    it('falls back to the src mode for an unknown name', () => {
        const wrapper = mount(Icon, { props: { name: 'NotAnIcon' as never } });
        expect(wrapper.find('span').exists()).toBe(true);
        expect(wrapper.find('svg').exists()).toBe(false);
    });

    it('adds the bounce modifier classes', () => {
        const wrapper = mount(Icon, { props: { name: 'Cat', bounce: true } });
        const root = wrapper.find('svg');
        expect(root.classes()).toContain('animal-icon--bounce');
        expect(root.classes()).toContain('animal-island-icon--bounce');
    });

    it('forwards arbitrary attributes to the rendered element', () => {
        const wrapper = mount(Icon, {
            props: { name: 'Cat' },
            attrs: { id: 'cat-icon', 'data-testid': 'cat' },
        });
        const root = wrapper.find('svg');
        expect(root.attributes('id')).toBe('cat-icon');
        expect(root.attributes('data-testid')).toBe('cat');
    });

    it('marks a labelled icon as an image for assistive tech', () => {
        const wrapper = mount(Icon, { props: { name: 'Cat' }, attrs: { 'aria-label': '猫' } });
        const root = wrapper.find('svg');
        expect(root.attributes('role')).toBe('img');
        expect(root.attributes('aria-hidden')).toBeUndefined();
    });

    it('hides a decorative icon from assistive tech', () => {
        const wrapper = mount(Icon, { props: { name: 'Cat' } });
        expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true');
    });

    it('renders the title as an accessible name', () => {
        const wrapper = mount(Icon, { props: { name: 'Cat' }, attrs: { title: '小猫' } });
        const root = wrapper.find('svg');
        expect(root.find('title').text()).toBe('小猫');
        expect(root.attributes('role')).toBe('img');
    });
});
