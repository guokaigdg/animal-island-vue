import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import Carousel from './Carousel.vue';

const slides = () => [
    h('div', { 'data-testid': 'slide-1' }, '海滩'),
    h('div', { 'data-testid': 'slide-2' }, '广场'),
    h('div', { 'data-testid': 'slide-3' }, '博物馆'),
];

const slideIsVisible = (wrapper: any, index: number) =>
    wrapper.findAll('.animal-carousel__slide')[index].attributes('aria-hidden');

const lastChange = (wrapper: any) => {
    const emitted = wrapper.emitted('change');
    return emitted?.[emitted.length - 1]?.[0];
};

describe('Carousel', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('默认展示第一张并提供完整轮播语义', () => {
        const wrapper = mount(Carousel, {
            props: { ariaLabel: '岛屿照片' },
            slots: { default: slides },
        });
        const region = wrapper.find('[role="region"]');
        expect(region.attributes('aria-roledescription')).toBe('carousel');
        expect(region.attributes('aria-label')).toBe('岛屿照片');
        expect(slideIsVisible(wrapper, 0)).toBe('false');
        expect(slideIsVisible(wrapper, 1)).toBe('true');
        expect(wrapper.findAll('.animal-carousel__slide')[0].attributes('aria-label')).toBe('第 1 张，共 3 张');
    });

    it('点击箭头和圆点切换并触发 change', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Carousel, {
            props: { onChange },
            slots: { default: slides },
        });

        await wrapper.find('button[aria-label="下一张"]').trigger('click');
        expect(onChange).toHaveBeenLastCalledWith(1);
        expect(slideIsVisible(wrapper, 1)).toBe('false');

        await wrapper.find('button[aria-label="转到第 3 张"]').trigger('click');
        expect(onChange).toHaveBeenLastCalledWith(2);
        expect(slideIsVisible(wrapper, 2)).toBe('false');
    });

    it('受控 modelValue 不自更新', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Carousel, {
            props: { modelValue: 0, onChange },
            slots: { default: slides },
        });
        await wrapper.find('button[aria-label="下一张"]').trigger('click');
        expect(onChange).toHaveBeenCalledWith(1);
        // 受控下 UI 仍展示第一张
        expect(slideIsVisible(wrapper, 0)).toBe('false');
    });

    it('受控时父级回写 v-model → UI 切换', async () => {
        const value = ref(0);
        const Host = defineComponent({
            setup() {
                return () =>
                    h(
                        Carousel,
                        {
                            modelValue: value.value,
                            'onUpdate:modelValue': (v: number) => {
                                value.value = v;
                            },
                        },
                        { default: () => slides() }
                    );
            },
        });
        const wrapper = mount(Host);
        await wrapper.find('button[aria-label="下一张"]').trigger('click');
        expect(wrapper.findAll('.animal-carousel__slide')[1].attributes('aria-hidden')).toBe('false');
    });

    it('键盘方向键、Home 和 End 可导航', async () => {
        const wrapper = mount(Carousel, { slots: { default: slides } });
        const region = wrapper.find('[role="region"]');
        await region.trigger('keydown', { key: 'ArrowRight' });
        expect(slideIsVisible(wrapper, 1)).toBe('false');
        await region.trigger('keydown', { key: 'End' });
        expect(slideIsVisible(wrapper, 2)).toBe('false');
        await region.trigger('keydown', { key: 'Home' });
        expect(slideIsVisible(wrapper, 0)).toBe('false');
    });

    it('autoplay 按间隔自动切换', async () => {
        vi.useFakeTimers();
        const onChange = vi.fn();
        const wrapper = mount(Carousel, {
            props: { autoplay: true, interval: 2_000, onChange },
            slots: { default: slides },
        });
        vi.advanceTimersByTime(2_000);
        await nextTick();
        expect(onChange).toHaveBeenCalledWith(1);
        expect(slideIsVisible(wrapper, 1)).toBe('false');
    });

    it('循环模式下边界箭头可用', async () => {
        const wrapper = mount(Carousel, { slots: { default: slides } });
        expect(wrapper.find('button[aria-label="上一张"]').attributes('disabled')).toBeUndefined();
        await wrapper.find('button[aria-label="转到第 3 张"]').trigger('click');
        expect(wrapper.find('button[aria-label="下一张"]').attributes('disabled')).toBeUndefined();
    });

    it('焦点进入后暂停，并可从播放控制显式恢复', async () => {
        vi.useFakeTimers();
        const onChange = vi.fn();
        const wrapper = mount(Carousel, {
            props: { autoplay: true, interval: 1_000, onChange },
            slots: { default: slides },
            attachTo: document.body,
        });

        // 焦点从外部进入 region → 暂停
        await wrapper.find('[role="region"]').trigger('focusin', { relatedTarget: document.body });
        vi.advanceTimersByTime(3_000);
        await nextTick();
        expect(onChange).not.toHaveBeenCalled();
        const control = wrapper.find('.animal-carousel__rotation-control');
        expect(control.attributes('aria-label')).toBe('继续自动播放');
        expect(control.text()).toBe('播放');

        // 点击「播放」恢复
        await control.trigger('click');
        expect(control.attributes('aria-label')).toBe('暂停自动播放');
        vi.advanceTimersByTime(1_000);
        await nextTick();
        expect(onChange).toHaveBeenCalledWith(1);
        wrapper.unmount();
    });

    it('非循环模式在边界禁用箭头', async () => {
        const wrapper = mount(Carousel, {
            props: { loop: false },
            slots: { default: slides },
        });
        expect(wrapper.find('button[aria-label="上一张"]').attributes('disabled')).toBeDefined();
        await wrapper.find('button[aria-label="转到第 3 张"]').trigger('click');
        expect(wrapper.find('button[aria-label="下一张"]').attributes('disabled')).toBeDefined();
    });

    it('可隐藏箭头和指示点，单张内容不渲染控制器', () => {
        const wrapper = mount(Carousel, {
            props: { showArrows: false, showDots: false },
            slots: { default: slides },
        });
        expect(wrapper.find('button').exists()).toBe(false);

        const single = mount(Carousel, {
            slots: { default: () => [h('div', '海滩')] },
        });
        expect(single.find('button').exists()).toBe(false);
    });

    it('切换触发 update:modelValue 供 v-model 回写', async () => {
        const wrapper = mount(Carousel, { slots: { default: slides } });
        await wrapper.find('button[aria-label="下一张"]').trigger('click');
        const emitted = wrapper.emitted('update:modelValue');
        expect(emitted?.[0]).toEqual([1]);
        expect(lastChange(wrapper)).toBe(1);
    });
});
