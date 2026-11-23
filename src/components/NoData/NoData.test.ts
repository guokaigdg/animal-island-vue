import { describe, it, expect } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import NoData from './NoData.vue';

describe('NoData', () => {
    it('缺省标题随场景变化，显式 null 不回退默认图标或标题', () => {
        const wrapper = mount(NoData);
        expect(wrapper.text()).toContain('暂无数据');
        expect(wrapper.find('.animal-no-data__artwork').exists()).toBe(true);

        const search = mount(NoData, { props: { variant: 'search' } });
        expect(search.text()).toContain('没有找到相关结果');

        const hidden = mount(NoData, {
            props: { title: null, icon: null, description: '请更换筛选条件' },
        });
        expect(hidden.text()).not.toContain('暂无数据');
        expect(hidden.find('.animal-no-data__artwork').exists()).toBe(false);
        expect(hidden.find('.animal-no-data__title').exists()).toBe(false);
        expect(hidden.text()).toContain('请更换筛选条件');
    });

    it('icon 传 false 同样隐藏内置插画', () => {
        const wrapper = mount(NoData, { props: { icon: false } });
        expect(wrapper.find('.animal-no-data__artwork').exists()).toBe(false);
    });

    it('title / description / extra 传 false 时隐藏对应区块', () => {
        const wrapper = mount(NoData, {
            props: { title: false, description: false, extra: false },
            slots: { default: () => h('button', '新建手账') },
        });
        expect(wrapper.find('.animal-no-data__artwork').exists()).toBe(true);
        expect(wrapper.find('.animal-no-data__title').exists()).toBe(false);
        expect(wrapper.find('.animal-no-data__description').exists()).toBe(false);
        expect(wrapper.find('.animal-no-data__actions').exists()).toBe(false);
    });

    it('操作区 extra 覆盖默认插槽，原生状态语义可由业务指定', () => {
        const wrapper = mount(NoData, {
            props: { extra: h('button', '恢复数据') },
            attrs: { role: 'status', 'aria-label': '列表空态' },
            slots: { default: '被覆盖的操作' },
        });
        expect(wrapper.attributes('role')).toBe('status');
        expect(wrapper.attributes('aria-label')).toBe('列表空态');
        expect(wrapper.text()).toContain('暂无数据');
        expect(wrapper.text()).not.toContain('被覆盖的操作');
        expect(wrapper.text()).toContain('恢复数据');
    });

    it('默认插槽作为操作区', () => {
        const wrapper = mount(NoData, { slots: { default: () => h('button', '新建手账') } });
        expect(wrapper.find('.animal-no-data__actions').exists()).toBe(true);
        expect(wrapper.text()).toContain('新建手账');
    });

    it('#icon 插槽与 icon 属性都能替换内置插画', () => {
        const slotIcon = mount(NoData, {
            slots: { icon: () => h('span', { class: 'slot-icon' }, '空') },
        });
        expect(slotIcon.find('.slot-icon').exists()).toBe(true);
        expect(slotIcon.find('.animal-no-data__artwork--custom').exists()).toBe(true);
        expect(slotIcon.find('.animal-no-data__scene-icon').exists()).toBe(false);

        const propIcon = mount(NoData, { props: { icon: h('span', { class: 'prop-icon' }, '图') } });
        expect(propIcon.find('.prop-icon').exists()).toBe(true);
        expect(propIcon.find('.animal-no-data__scene-icon').exists()).toBe(false);
    });

    it('尺寸、场景与边框走修饰类名', () => {
        const wrapper = mount(NoData, { props: { size: 'small', variant: 'simple', bordered: true } });
        expect(wrapper.classes()).toContain('animal-no-data');
        expect(wrapper.classes()).toContain('animal-no-data--small');
        expect(wrapper.classes()).toContain('animal-no-data--simple');
        expect(wrapper.classes()).toContain('animal-no-data--bordered');
    });

    it('标题与说明支持 VNode 渲染', () => {
        const wrapper = mount(NoData, {
            props: {
                title: h('strong', '自定义标题'),
                description: h('em', '自定义说明'),
            },
        });
        expect(wrapper.find('.animal-no-data__title strong').exists()).toBe(true);
        expect(wrapper.find('.animal-no-data__description em').exists()).toBe(true);
    });
});
