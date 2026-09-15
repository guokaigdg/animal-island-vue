import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import Loading from './Loading.vue';

// 断言根节点是否存在（v-if=false 时根节点为注释节点）
const loadingOf = (wrapper: ReturnType<typeof mount>) => wrapper.find('.animal-loading');

describe('Loading', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    describe('渲染', () => {
        it('默认渲染全屏落雪 role=status 与兜底读屏文案', () => {
            const wrapper = mount(Loading);
            const status = wrapper.find('[role="status"]');
            expect(status.exists()).toBe(true);
            expect(status.classes()).toContain('animal-loading');
            expect(status.text()).toBe('加载中');
            expect(wrapper.find('.animal-loading__sr-only').exists()).toBe(true);
        });

        it('雪花层与暗角均为 aria-hidden，雪花数量为 50', () => {
            const wrapper = mount(Loading);
            const snow = wrapper.find('.animal-loading__snow');
            expect(snow.exists()).toBe(true);
            expect(snow.attributes('aria-hidden')).toBe('true');
            expect(wrapper.findAll('.animal-loading__flake')).toHaveLength(50);
            expect(wrapper.find('.animal-loading__vignette').attributes('aria-hidden')).toBe('true');
        });

        it('每片雪花内联尺寸在 1–6px 且带负延迟（首屏即有分布）', () => {
            const wrapper = mount(Loading);
            const flakes = wrapper.findAll('.animal-loading__flake');
            for (const flake of flakes) {
                const el = flake.element as HTMLElement;
                const size = parseFloat(el.style.width);
                expect(size).toBeGreaterThanOrEqual(1);
                expect(size).toBeLessThanOrEqual(6);
                expect(parseFloat(el.style.animationDelay)).toBeLessThanOrEqual(0);
            }
        });

        it('tip 渲染为中央提示文字并替代默认读屏文案', () => {
            const wrapper = mount(Loading, { props: { tip: '正在连接岛屿' } });
            expect(wrapper.find('.animal-loading__tip').text()).toBe('正在连接岛屿');
            expect(wrapper.text()).not.toContain('加载中');
        });

        it('active=false 初始不渲染任何内容', () => {
            const wrapper = mount(Loading, { props: { active: false } });
            expect(loadingOf(wrapper).exists()).toBe(false);
            expect(wrapper.text()).toBe('');
        });

        it('zIndex 默认 3000，可通过 prop 覆盖', async () => {
            const wrapper = mount(Loading);
            expect((loadingOf(wrapper).element as HTMLElement).style.zIndex).toBe('3000');
            await wrapper.setProps({ zIndex: 5000 });
            expect((loadingOf(wrapper).element as HTMLElement).style.zIndex).toBe('5000');
        });

        it('透传 class / style / data-* 到根元素', () => {
            const wrapper = mount(Loading, {
                attrs: { class: 'custom-class', style: 'color: red', 'data-scope': 'snow' },
            });
            const root = loadingOf(wrapper);
            expect(root.classes()).toContain('custom-class');
            expect(root.classes()).toContain('animal-loading');
            expect(root.attributes('data-scope')).toBe('snow');
            expect((root.element as HTMLElement).style.color).toBe('red');
        });
    });

    describe('delay 延迟显示', () => {
        it('delay 时间内不渲染，到时后出现', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { delay: 300 } });
            expect(loadingOf(wrapper).exists()).toBe(false);
            vi.advanceTimersByTime(300);
            await nextTick();
            expect(wrapper.find('[role="status"]').exists()).toBe(true);
        });

        it('delay=0 立即显示', () => {
            const wrapper = mount(Loading, { props: { delay: 0 } });
            expect(wrapper.find('[role="status"]').exists()).toBe(true);
        });

        it('active 切换为 true 时重新计时', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { delay: 300, active: false } });
            await wrapper.setProps({ active: true });
            expect(loadingOf(wrapper).exists()).toBe(false);
            vi.advanceTimersByTime(299);
            await nextTick();
            expect(loadingOf(wrapper).exists()).toBe(false);
            vi.advanceTimersByTime(1);
            await nextTick();
            expect(wrapper.find('[role="status"]').exists()).toBe(true);
        });
    });

    describe('渐变消失', () => {
        it('active→false 后保持挂载并加 exiting 类（淡出中）', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading);
            await wrapper.setProps({ active: false });
            const root = loadingOf(wrapper);
            expect(root.exists()).toBe(true);
            expect(root.classes()).toContain('animal-loading--exiting');
        });

        it('exiting 时根元素以 fadeDuration 作为 transition-duration', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { fadeDuration: 1.5 } });
            await wrapper.setProps({ active: false });
            expect((loadingOf(wrapper).element as HTMLElement).style.transitionDuration).toBe('1.5s');
        });

        it('fadeDuration 走完后卸载雪花屏', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { fadeDuration: 0.6 } });
            await wrapper.setProps({ active: false });
            expect(loadingOf(wrapper).exists()).toBe(true);
            vi.advanceTimersByTime(600);
            await nextTick();
            expect(loadingOf(wrapper).exists()).toBe(false);
        });

        it('淡出途中恢复 active：立即取消卸载并回到不透明', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { fadeDuration: 0.6 } });
            await wrapper.setProps({ active: false });
            // 淡出到一半时恢复开启
            vi.advanceTimersByTime(300);
            await wrapper.setProps({ active: true });
            const root = loadingOf(wrapper);
            expect(root.exists()).toBe(true);
            expect(root.classes()).not.toContain('animal-loading--exiting');
            // 恢复后不再有任何计时器将其卸载
            vi.advanceTimersByTime(5000);
            await nextTick();
            expect(loadingOf(wrapper).exists()).toBe(true);
        });

        it('卸载时清理计时器（无内存泄漏）', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { fadeDuration: 0.6 } });
            await wrapper.setProps({ active: false });
            vi.advanceTimersByTime(300);
            wrapper.unmount();
            // 卸载后再推时间不应有 setState on unmounted 报错
            vi.advanceTimersByTime(5000);
            expect(vi.getTimerCount()).toBe(0);
        });
    });
});
