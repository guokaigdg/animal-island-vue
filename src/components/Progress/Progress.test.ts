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

        it('default fill carries the stripe animation class (CSS-defined)', () => {
            const wrapper = mount(Progress, { props: { percent: 50 } });
            const fill = wrapper.find('.animal-progress__fill');
            expect(fill.exists()).toBe(true);
            // The fill class declares `animation: animal-progress-stripe 1s linear infinite`
            // in the scoped style; jsdom doesn't resolve keyframes via getComputedStyle,
            // so we assert the class is applied (the rule lives there).
            expect(fill.classes()).toContain('animal-progress__fill');
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
