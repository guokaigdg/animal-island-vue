import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Progress from './Progress.vue';

describe('Progress', () => {
    describe('rendering', () => {
        it('renders with role=progressbar and clamps percent', () => {
            const wrapper = mount(Progress, { props: { percent: -10 } });
            const bar = wrapper.find('[role="progressbar"]');
            expect(bar.exists()).toBe(true);
            expect(bar.attributes('aria-valuemin')).toBe('0');
            expect(bar.attributes('aria-valuemax')).toBe('100');
            // -10 should be clamped to 0
            expect(bar.attributes('aria-valuenow')).toBe('0');
        });

        it('clamps percent above 100 down to 100', () => {
            const wrapper = mount(Progress, { props: { percent: 150 } });
            const bar = wrapper.find('[role="progressbar"]');
            expect(bar.attributes('aria-valuenow')).toBe('100');
        });

        it('rounds non-integer percent for aria-valuenow', () => {
            const wrapper = mount(Progress, { props: { percent: 33.7 } });
            const bar = wrapper.find('[role="progressbar"]');
            expect(bar.attributes('aria-valuenow')).toBe('34');
        });

        it('uses percent=0 as default safe value when given NaN', () => {
            const wrapper = mount(Progress, { props: { percent: Number.NaN } });
            const bar = wrapper.find('[role="progressbar"]');
            expect(bar.attributes('aria-valuenow')).toBe('0');
        });

        it('forwards className and style', () => {
            const wrapper = mount(Progress, {
                props: { percent: 50 },
                attrs: { class: 'custom-class', style: 'width: 320px' },
            });
            expect(wrapper.classes()).toContain('custom-class');
            expect(wrapper.element.style.width).toBe('320px');
        });

        it('forwards aria-label and aria-labelledby to progressbar role (a11y)', () => {
            const wrapper = mount(Progress, {
                props: { percent: 50, 'aria-label': '任务进度' },
            });
            const bar = wrapper.find('[role="progressbar"]');
            expect(bar.attributes('aria-label')).toBe('任务进度');
            expect(bar.attributes('aria-valuemin')).toBe('0');
            expect(bar.attributes('aria-valuemax')).toBe('100');
        });

        it('aria-labelledby 透传到 progressbar', () => {
            const wrapper = mount(Progress, {
                props: { percent: 50, 'aria-labelledby': 'external-title-id' },
            });
            expect(wrapper.find('[role="progressbar"]').attributes('aria-labelledby')).toBe('external-title-id');
        });
    });

    describe('info text', () => {
        it('default shows percent with % suffix', () => {
            const wrapper = mount(Progress, { props: { percent: 42 } });
            expect(wrapper.text()).toContain('42%');
        });

        it('showInfo=false hides percent text', () => {
            const wrapper = mount(Progress, { props: { percent: 50, showInfo: false } });
            expect(wrapper.text()).not.toMatch(/\d+%/);
        });

        it('infoFormat receives percent and renders custom node', () => {
            const wrapper = mount(Progress, {
                props: {
                    percent: 7,
                    infoFormat: (p: number) => `${Math.round(p)}/10`,
                },
            });
            expect(wrapper.text()).toContain('7/10');
        });

        it('infoPosition=right places percent after the track', () => {
            const wrapper = mount(Progress, {
                props: { percent: 50, infoPosition: 'right' },
            });
            // Should still render percent text
            expect(wrapper.text()).toContain('50%');
            // The row container exists
            expect(wrapper.find('.animal-progress__row').exists()).toBe(true);
        });

        it('infoPosition=top stacks the text above the track', () => {
            const wrapper = mount(Progress, {
                props: { percent: 50, infoPosition: 'top' },
            });
            const row = wrapper.find('.animal-progress__row');
            expect(row.exists()).toBe(true);
            expect(row.classes()).toContain('animal-progress__row--top');
            expect(wrapper.find('.animal-progress__info--top').exists()).toBe(true);
            // 'top' 模式下轨道仍是唯一渲染的那一个（ref 绑定在此）
            expect(wrapper.findAll('.animal-progress__track')).toHaveLength(1);
        });

        it('默认 infoPosition 为 right（与 React 一致，文字在进度条右侧）', () => {
            const wrapper = mount(Progress, { props: { percent: 50 } });
            expect(wrapper.find('.animal-progress__row--right').exists()).toBe(true);
            expect(wrapper.find('.animal-progress__info--right').exists()).toBe(true);
        });
    });

    describe('size', () => {
        it('size=small applies size-small class to track', () => {
            const wrapper = mount(Progress, { props: { percent: 50, size: 'small' } });
            expect(wrapper.find('.animal-progress__track--small').exists()).toBe(true);
        });

        it('size=middle applies size-middle class to track (default)', () => {
            const wrapper = mount(Progress, { props: { percent: 50 } });
            expect(wrapper.find('.animal-progress__track--middle').exists()).toBe(true);
        });

        it('size=large applies size-large class to track', () => {
            const wrapper = mount(Progress, { props: { percent: 50, size: 'large' } });
            expect(wrapper.find('.animal-progress__track--large').exists()).toBe(true);
        });
    });

    describe('animation', () => {
        it('duration=0 applies noTransition class to fill', () => {
            const wrapper = mount(Progress, { props: { percent: 50, duration: 0 } });
            expect(wrapper.find('.animal-progress__fill--no-transition').exists()).toBe(true);
        });

        it('duration applies as transition-duration style on fill', () => {
            const wrapper = mount(Progress, { props: { percent: 50, duration: 1.2 } });
            const fill = wrapper.find('.animal-progress__fill');
            expect(fill.exists()).toBe(true);
            expect((fill.element as HTMLElement).style.transitionDuration).toBe('1.2s');
        });

        it('default fill carries the fill class (CSS-defined)', () => {
            const wrapper = mount(Progress, { props: { percent: 50 } });
            const fill = wrapper.find('.animal-progress__fill');
            expect(fill.exists()).toBe(true);
            // The fill class declares the mint gradient + 100% done-state rule
            // in the scoped style; jsdom doesn't resolve keyframes/gradients via
            // getComputedStyle, so we assert the class is applied (the rule lives there).
            expect(fill.classes()).toContain('animal-progress__fill');
        });
    });

    describe('variant 场景图 fill', () => {
        it('variant=sweet-corner 注入场景图背景并左对齐铺开', () => {
            const wrapper = mount(Progress, { props: { percent: 70, variant: 'sweet-corner' } });
            const style = (wrapper.find('.animal-progress__fill').element as HTMLElement).style;
            expect(style.backgroundImage).toMatch(/url\(.*sweet-corner/);
            expect(style.backgroundPosition).toBe('left top');
            expect(style.backgroundRepeat).toBe('no-repeat');
            expect(style.backgroundSize).toMatch(/auto$/);
        });

        it('variant=forest-grove 注入森林场景图', () => {
            const wrapper = mount(Progress, { props: { percent: 70, variant: 'forest-grove' } });
            const style = (wrapper.find('.animal-progress__fill').element as HTMLElement).style;
            expect(style.backgroundImage).toMatch(/url\(.*forest-grove/);
        });

        it('variant=starry-camp 注入星空场景图', () => {
            const wrapper = mount(Progress, { props: { percent: 70, variant: 'starry-camp' } });
            const style = (wrapper.find('.animal-progress__fill').element as HTMLElement).style;
            expect(style.backgroundImage).toMatch(/url\(.*starry-camp/);
        });

        it('variant=coffee-break 注入咖啡场景图', () => {
            const wrapper = mount(Progress, { props: { percent: 70, variant: 'coffee-break' } });
            const style = (wrapper.find('.animal-progress__fill').element as HTMLElement).style;
            expect(style.backgroundImage).toMatch(/url\(.*coffee-break/);
        });

        it('不传 variant 时 fill 为纯色（无背景图）', () => {
            const wrapper = mount(Progress, { props: { percent: 50 } });
            const style = (wrapper.find('.animal-progress__fill').element as HTMLElement).style;
            expect(style.backgroundImage).toBe('');
            expect(style.backgroundColor).toBe('rgb(25, 200, 185)');
        });

        it('variant 传入时根节点带对应修饰类名', () => {
            const wrapper = mount(Progress, { props: { percent: 70, variant: 'forest-grove' } });
            expect(wrapper.classes()).toContain('animal-progress--forest-grove');
        });

        it('不传 variant 时根节点不带修饰类名', () => {
            const wrapper = mount(Progress, { props: { percent: 70 } });
            expect(wrapper.classes().some((c) => c.startsWith('animal-progress--'))).toBe(false);
        });
    });

    describe('完成态', () => {
        it('percent=100 时根节点 aria-valuenow=100（命中完成态渐变规则）', () => {
            const wrapper = mount(Progress, { props: { percent: 100 } });
            expect(wrapper.attributes('aria-valuenow')).toBe('100');
        });

        it('percent=99 时根节点 aria-valuenow=99（未命中完成态）', () => {
            const wrapper = mount(Progress, { props: { percent: 99 } });
            expect(wrapper.attributes('aria-valuenow')).toBe('99');
        });
    });

    describe('fill width', () => {
        it('translates percent to fill width via inline style', () => {
            const wrapper = mount(Progress, { props: { percent: 42 } });
            const fill = wrapper.find('.animal-progress__fill');
            expect((fill.element as HTMLElement).style.width).toBe('42%');
        });
    });

    describe('inside info fallback for low percent', () => {
        it('shows percent outside fill (track-end) when percent < 18% to keep white text readable', () => {
            const wrapper = mount(Progress, {
                props: { percent: 10, infoPosition: 'inside' },
            });
            // When percent < 18%, only the OUTSIDE-fallback infoInside node is rendered
            // (the inside-fill one is suppressed so the white text doesn't sit on the sandy track)
            const infoNodes = wrapper.findAll('.animal-progress__info-inside');
            expect(infoNodes).toHaveLength(1);
            expect(infoNodes[0].text()).toBe('10%');
            // The fallback should use track text color (#725d42) instead of white-on-fill
            const style = (infoNodes[0].element as unknown as HTMLElement).style;
            expect(style.color).toBe('rgb(114, 93, 66)');
        });

        it('shows percent inside fill (white text) when percent >= 18%', () => {
            const wrapper = mount(Progress, {
                props: { percent: 50, infoPosition: 'inside' },
            });
            const infoNodes = wrapper.findAll('.animal-progress__info-inside');
            expect(infoNodes).toHaveLength(1);
            expect(infoNodes[0].text()).toBe('50%');
            // The inside one has no inline color override, so it inherits the white from .info-inside
        });
    });
});
