import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BackTop from './BackTop.vue';

describe('BackTop', () => {
    it('默认隐藏（无 visible 类）', () => {
        const wrapper = mount(BackTop);
        expect(wrapper.find('.animal-backtop').exists()).toBe(true);
        expect(wrapper.find('.animal-backtop--visible').exists()).toBe(false);
    });

    it('渲染默认 icon（图片）', () => {
        const wrapper = mount(BackTop);
        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('alt')).toBe('返回顶部');
    });

    it('点击触发 click 事件', async () => {
        const onClick = vi.fn();
        const wrapper = mount(BackTop, {
            attrs: { onClick },
        });
        await wrapper.find('.animal-backtop').trigger('click');
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('应用自定义 className', () => {
        const wrapper = mount(BackTop, {
            props: { className: 'custom' },
        });
        expect(wrapper.find('.animal-backtop').classes()).toContain('custom');
    });

    it('键盘 Enter 触发 click 事件', async () => {
        const onClick = vi.fn();
        const wrapper = mount(BackTop, {
            attrs: { onClick },
        });
        await wrapper.find('.animal-backtop').trigger('keydown', { key: 'Enter' });
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
