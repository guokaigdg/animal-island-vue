import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import Wallet from './Wallet.vue';

describe('Wallet', () => {
    it('数字按千分位格式化', () => {
        const wrapper = mount(Wallet, { props: { value: 1234567 } });
        const value = wrapper.find('.animal-wallet__value');
        expect(value.exists()).toBe(true);
        expect(value.text()).toBe('1,234,567');
    });

    it('字符串原样展示', () => {
        const wrapper = mount(Wallet, { props: { value: 'ABC' } });
        expect(wrapper.find('.animal-wallet__value').text()).toBe('ABC');
    });

    it('value 缺省时显示占位 00,000', () => {
        const wrapper = mount(Wallet);
        expect(wrapper.find('.animal-wallet__value').text()).toBe('00,000');
    });

    it('thousandSeparator 为空时不插入分隔符', () => {
        const wrapper = mount(Wallet, { props: { value: 1234567, thousandSeparator: '' } });
        expect(wrapper.find('.animal-wallet__value').text()).toBe('1234567');
    });

    it('size=small 应用对应类', () => {
        const wrapper = mount(Wallet, { props: { size: 'small' } });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('animal-wallet--small')).toBe(true);
    });

    it('支持自定义 icon（具名 slot）', () => {
        const wrapper = mount(Wallet, {
            slots: {
                icon: () => h('span', { 'data-testid': 'custom-icon' }, '$'),
            },
        });
        expect(wrapper.find('[data-testid="custom-icon"]').exists()).toBe(true);
        // 自定义 slot 时不应再渲染默认钱袋图片
        expect(wrapper.find('.animal-wallet__bag-img').exists()).toBe(false);
    });

    it('未提供 icon 插槽时渲染默认钱袋图片', () => {
        const wrapper = mount(Wallet);
        expect(wrapper.find('.animal-wallet__bag-img').exists()).toBe(true);
    });

    it('负数千分位前保留负号', () => {
        const wrapper = mount(Wallet, { props: { value: -12345 } });
        expect(wrapper.find('.animal-wallet__value').text()).toBe('-12,345');
    });
});
