import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import Tooltip from './Tooltip.vue';

const wait = (ms = 0) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function getBubble(): HTMLElement {
    return document.querySelector('.animal-tooltip__bubble') as HTMLElement;
}

function getTrigger(): HTMLElement {
    return document.querySelector('.animal-tooltip__trigger') as HTMLElement;
}

describe('Tooltip', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('默认隐藏：role="tooltip" 存在但 aria-hidden=true', () => {
        const wrapper = mount(Tooltip, {
            props: { title: 'hi' },
            slots: { default: h('button', null, 'btn') },
        });
        const tip = wrapper.find('[role="tooltip"]');
        expect(tip.exists()).toBe(true);
        expect(tip.attributes('aria-hidden')).toBe('true');
        expect(tip.classes()).not.toContain('animal-tooltip__bubble--visible');
    });

    it('hover 触发显示，离开后隐藏', async () => {
        const wrapper = mount(Tooltip, {
            props: { title: 'hi', trigger: 'hover' },
            slots: { default: h('button', null, 'btn') },
        });
        const trigger = wrapper.find('.animal-tooltip__trigger');
        const tip = wrapper.find('[role="tooltip"]');
        await trigger.trigger('mouseenter');
        expect(tip.classes()).toContain('animal-tooltip__bubble--visible');
        expect(tip.attributes('aria-hidden')).toBe('false');
        await trigger.trigger('mouseleave');
        // 100ms 隐藏防抖
        await wait(150);
        expect(tip.classes()).not.toContain('animal-tooltip__bubble--visible');
    });

    it('focus 触发显示', async () => {
        const wrapper = mount(Tooltip, {
            props: { title: 'hi', trigger: 'focus' },
            slots: { default: h('button', null, 'btn') },
        });
        const trigger = wrapper.find('.animal-tooltip__trigger');
        await trigger.trigger('focusin');
        const tip = wrapper.find('[role="tooltip"]');
        expect(tip.classes()).toContain('animal-tooltip__bubble--visible');
    });

    it('click 触发：再次点击关闭', async () => {
        const wrapper = mount(Tooltip, {
            props: { title: 'hi', trigger: 'click' },
            slots: { default: h('button', null, 'btn') },
        });
        const trigger = wrapper.find('.animal-tooltip__trigger');
        const tip = wrapper.find('[role="tooltip"]');
        await trigger.trigger('click');
        expect(tip.classes()).toContain('animal-tooltip__bubble--visible');
        await trigger.trigger('click');
        expect(tip.classes()).not.toContain('animal-tooltip__bubble--visible');
    });

    it('placement 类按位置应用', () => {
        const wrapper = mount(Tooltip, {
            props: { title: 'hi', placement: 'bottom-start' },
            slots: { default: h('button', null, 'btn') },
        });
        expect(wrapper.find('[role="tooltip"]').classes()).toContain(
            'animal-tooltip__bubble--bottom_start',
        );
    });

    it('variant=island 应用 island 类', () => {
        const wrapper = mount(Tooltip, {
            props: { title: 'hi', variant: 'island' },
            slots: { default: h('button', null, 'btn') },
        });
        expect(wrapper.find('[role="tooltip"]').classes()).toContain(
            'animal-tooltip__bubble--island',
        );
    });

    it('保留子元素自身的事件处理器', async () => {
        const onClick = vi.fn();
        const wrapper = mount(Tooltip, {
            props: { title: 'hi', trigger: 'click' },
            slots: { default: h('button', { onClick }, 'btn') },
        });
        await wrapper.find('button').trigger('click');
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    describe('a11y', () => {
        it('显示时 trigger.aria-describedby 指向 tooltip.id', async () => {
            const wrapper = mount(Tooltip, {
                props: { title: 'hi', trigger: 'click' },
                slots: { default: h('button', null, 'btn') },
            });
            const trigger = wrapper.find('.animal-tooltip__trigger');
            const tip = wrapper.find('[role="tooltip"]');
            expect(trigger.attributes('aria-describedby')).toBeUndefined();
            await trigger.trigger('click');
            expect(trigger.attributes('aria-describedby')).toBe(tip.attributes('id'));
            expect(tip.attributes('id')).toMatch(/^animal-tooltip-/);
        });

        it('隐藏时 trigger 不带 aria-describedby', () => {
            const wrapper = mount(Tooltip, {
                props: { title: 'hi', trigger: 'click' },
                slots: { default: h('button', { 'aria-describedby': 'ext-help' }, 'btn') },
            });
            const trigger = wrapper.find('.animal-tooltip__trigger');
            // trigger span 自身不带 aria-describedby
            expect(trigger.attributes('aria-describedby')).toBeUndefined();
            // 子元素自身的 aria-describedby 不被破坏
            const btn = wrapper.find('button');
            expect(btn.attributes('aria-describedby')).toBe('ext-help');
        });
    });
});
