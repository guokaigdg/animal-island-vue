import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import Typewriter from './Typewriter.vue';

describe('Typewriter', () => {
    it('autoPlay=false 时直接显示全部文本', () => {
        const wrapper = mount(Typewriter, {
            props: { autoPlay: false },
            slots: { default: () => 'Hello' },
        });
        expect(wrapper.text()).toBe('Hello');
    });

    it('autoPlay=true 时按 speed 逐字显示', async () => {
        vi.useFakeTimers();
        const wrapper = mount(Typewriter, {
            props: { speed: 50, autoPlay: true },
            slots: { default: () => 'ABCD' },
        });
        // 初始 0 字符
        expect(wrapper.text()).toBe('');
        vi.advanceTimersByTime(50);
        await nextTick();
        expect(wrapper.text()).toBe('A');
        vi.advanceTimersByTime(150);
        await nextTick();
        expect(wrapper.text()).toBe('ABCD');
        vi.useRealTimers();
    });

    it('完成后触发 onDone', async () => {
        vi.useFakeTimers();
        const onDone = vi.fn();
        mount(Typewriter, {
            props: { speed: 20, autoPlay: true, onDone },
            slots: { default: () => 'AB' },
        });
        vi.advanceTimersByTime(200);
        await nextTick();
        expect(onDone).toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('保留嵌套元素的结构（如 <strong/>）', () => {
        const wrapper = mount(Typewriter, {
            props: { autoPlay: false },
            slots: {
                default: () => [
                    h('strong', { 'data-testid': 'bold' }, 'Bold'),
                    'Tail',
                ],
            },
        });
        const bold = wrapper.find('[data-testid="bold"]');
        expect(bold.exists()).toBe(true);
        expect(bold.text()).toBe('Bold');
    });

    it('trigger 变更后从头重放', async () => {
        vi.useFakeTimers();
        const wrapper = mount(Typewriter, {
            props: { speed: 20, trigger: 1 },
            slots: { default: () => 'AB' },
        });
        vi.advanceTimersByTime(200);
        await nextTick();
        expect(wrapper.text()).toBe('AB');
        await wrapper.setProps({ trigger: 2 });
        // 触发变更后重置为 0
        expect(wrapper.text()).toBe('');
        vi.useRealTimers();
    });
});
