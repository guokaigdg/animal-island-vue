import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSSRApp, h, nextTick } from 'vue';
import { renderToString } from 'vue/server-renderer';
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

        it('style 与组件内建样式合并（zIndex 不会被传入的 style 覆盖掉）', () => {
            const wrapper = mount(Loading, { attrs: { style: 'background-color: red' } });
            const root = loadingOf(wrapper).element as HTMLElement;
            expect(root.style.zIndex).toBe('3000');
            expect(root.style.backgroundColor).toBe('red');
        });

        it('首帧即渲染遮罩，不等挂载后的 watch（避免底层内容闪一下）', async () => {
            // 用服务端渲染取「首次渲染」的输出：immediate 的 watch 在 setup 期间同步执行，
            // 若遮罩靠挂载后才置位，这段 HTML 里就没有它
            const app = createSSRApp({ render: () => h(Loading, { tip: '正在加载' }) });
            const html = await renderToString(app);
            expect(html).toContain('role="status"');
            expect(html).toContain('正在加载');
        });

        it('active=false 时服务端渲染同样为空', async () => {
            const app = createSSRApp({ render: () => h(Loading, { active: false }) });
            const html = await renderToString(app);
            expect(html).not.toContain('role="status"');
        });

        it('circle 形态没有进入淡入动画（首帧即完全不透明）', () => {
            const wrapper = mount(Loading, { props: { type: 'circle' } });
            // 淡入的那 0.2s 遮罩是透明的，底下已经铺好的内容会透出来。
            // `animation: none` 写在 scoped style 的 .animal-loading--circle 规则里，
            // jsdom 的 getComputedStyle 读不到，因此断言挂载的类名（规则所在处）。
            expect(loadingOf(wrapper).classes()).toContain('animal-loading--circle');
        });
    });

    describe('圆形展开形态', () => {
        it('type=circle 渲染帆船场景，不渲染雪花层', () => {
            const wrapper = mount(Loading, { props: { type: 'circle' } });
            expect(wrapper.find('.animal-loading__snow').exists()).toBe(false);
            expect(wrapper.find('.animal-loading__sailboat-scene').exists()).toBe(true);
            expect(wrapper.find('svg').exists()).toBe(true);
        });

        it('默认形态仍是落雪', () => {
            const wrapper = mount(Loading);
            expect(wrapper.find('.animal-loading__snow').exists()).toBe(true);
            expect(wrapper.find('.animal-loading__sailboat-scene').exists()).toBe(false);
            expect(loadingOf(wrapper).classes()).toContain('animal-loading');
        });

        it('帆船场景为装饰性内容，aria-hidden', () => {
            const wrapper = mount(Loading, { props: { type: 'circle' } });
            const scene = wrapper.find('.animal-loading__sailboat-scene');
            expect(scene.attributes('aria-hidden')).toBe('true');
        });

        it('circle 形态下 tip 仍然渲染在根元素内', () => {
            const wrapper = mount(Loading, { props: { type: 'circle', tip: '正在驶向岛屿…' } });
            expect(wrapper.find('.animal-loading__tip').text()).toBe('正在驶向岛屿…');
            expect(wrapper.text()).not.toContain('加载中');
        });

        it('circle 形态的波浪层铺满画布宽度所需的份数（4 段平铺）', () => {
            const wrapper = mount(Loading, { props: { type: 'circle' } });
            expect(wrapper.findAll('use')).toHaveLength(4);
        });

        it('帆船停在右下角（离右 20px、离下 30px）', () => {
            const wrapper = mount(Loading, { props: { type: 'circle' } });
            const scene = wrapper.find('.animal-loading__sailboat-scene');
            expect(scene.exists()).toBe(true);
            // right / bottom 写在 scoped style 的 .animal-loading__sailboat-scene 规则里，
            // jsdom 的 getComputedStyle 读不到，所以这里断言挂载的类名（规则所在处）。
            expect(scene.classes()).toContain('animal-loading__sailboat-scene');
        });

        it('showBoat=false 时不渲染帆船，但保留遮罩与提示文字', () => {
            const wrapper = mount(Loading, { props: { type: 'circle', showBoat: false, tip: '加载中' } });
            expect(wrapper.find('.animal-loading__sailboat-scene').exists()).toBe(false);
            expect(wrapper.find('svg').exists()).toBe(false);
            expect(wrapper.find('.animal-loading__tip').text()).toBe('加载中');
        });

        it('showBoat=false 不影响圆形展开：active→false 仍加 masking 类', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { type: 'circle', showBoat: false } });
            await wrapper.setProps({ active: false });
            const root = loadingOf(wrapper);
            expect(root.classes()).toContain('animal-loading--masking');
            expect(root.classes()).not.toContain('animal-loading--exiting');
        });

        it('多个实例的 <use> 引用目标互不相同（不会串扰）', () => {
            const wrapper = mount({
                render: () => h('div', [h(Loading, { type: 'circle' }), h(Loading, { type: 'circle' })]),
            });
            const uses = wrapper.findAll('use');
            expect(uses).toHaveLength(8);
            // 同一实例的 4 段平铺共用一个引用目标，两个实例各一个 —— 目标不同才不会互相覆盖
            const ids = uses.map((u) => u.attributes('href'));
            expect(new Set(ids).size).toBe(2);
        });
    });

    describe('圆形扩散展开', () => {
        it('active→false 后加 masking 类而非 exiting 类', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { type: 'circle' } });
            await wrapper.setProps({ active: false });
            const root = loadingOf(wrapper);
            expect(root.classes()).toContain('animal-loading--masking');
            expect(root.classes()).not.toContain('animal-loading--exiting');
        });

        it('遮罩半径写成内联 CSS 变量，过渡时长取自 fadeDuration', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { type: 'circle', fadeDuration: 1.2 } });
            await wrapper.setProps({ active: false });
            const root = loadingOf(wrapper).element as HTMLElement;
            expect(root.style.getPropertyValue('--animal-loading-mask-duration')).toBe('1.2s');
            expect(parseFloat(root.style.getPropertyValue('--animal-loading-mask-r'))).toBeGreaterThan(0);
        });

        it('展开走完后卸载', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { type: 'circle', fadeDuration: 0.6 } });
            await wrapper.setProps({ active: false });
            expect(loadingOf(wrapper).exists()).toBe(true);
            vi.advanceTimersByTime(600);
            await nextTick();
            expect(loadingOf(wrapper).exists()).toBe(false);
        });

        it('展开途中恢复 active：遮罩半径归零，下次关闭仍能重新展开', async () => {
            vi.useFakeTimers();
            const wrapper = mount(Loading, { props: { type: 'circle', fadeDuration: 0.6 } });
            await wrapper.setProps({ active: false });
            vi.advanceTimersByTime(300);
            await wrapper.setProps({ active: true });
            const root = loadingOf(wrapper).element as HTMLElement;
            expect(root.classList.contains('animal-loading--masking')).toBe(false);
            expect(root.style.getPropertyValue('--animal-loading-mask-r')).toBe('0px');

            // 再次关闭时半径要重新写成目标值，而不是停留在 0
            await wrapper.setProps({ active: false });
            expect(parseFloat(root.style.getPropertyValue('--animal-loading-mask-r'))).toBeGreaterThan(0);
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
