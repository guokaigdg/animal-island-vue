import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import Collapse from './Collapse.vue';

describe('Collapse', () => {
    it('默认折叠：button aria-expanded=false 且显示 +', () => {
        const wrapper = mount(Collapse, { props: { question: 'Q', answer: 'A' } });
        const btn = wrapper.get('button');
        expect(btn.attributes('aria-expanded')).toBe('false');
        expect(btn.text()).toContain('+');
    });

    it('defaultExpanded=true 初始展开', () => {
        const wrapper = mount(Collapse, {
            props: { question: 'Q', answer: 'A', defaultExpanded: true },
        });
        const btn = wrapper.get('button');
        expect(btn.attributes('aria-expanded')).toBe('true');
        expect(btn.text()).toContain('−');
    });

    it('点击切换展开状态', async () => {
        const wrapper = mount(Collapse, { props: { question: 'Q', answer: 'A' } });
        const btn = wrapper.get('button');
        await btn.trigger('click');
        expect(btn.attributes('aria-expanded')).toBe('true');
        await btn.trigger('click');
        expect(btn.attributes('aria-expanded')).toBe('false');
    });

    it('始终渲染 question 与 answer 内容', () => {
        const wrapper = mount(Collapse, {
            props: {
                question: 'My question',
                answer: 'plain answer',
            },
            slots: {
                default: () => h('span', { 'data-testid': 'ans' }, 'Answer'),
            },
        });
        expect(wrapper.text()).toContain('My question');
        expect(wrapper.find('[data-testid="ans"]').exists()).toBe(true);
    });

    it('disabled 时按钮被禁用，点击无效', async () => {
        const wrapper = mount(Collapse, {
            props: { question: 'Q', answer: 'A', disabled: true },
        });
        const btn = wrapper.get('button');
        expect(btn.attributes('disabled')).toBeDefined();
        await btn.trigger('click');
        expect(btn.attributes('aria-expanded')).toBe('false');
    });

    it('应用 className 与 style', () => {
        const wrapper = mount(Collapse, {
            props: { question: 'Q', answer: 'A' },
            attrs: { class: 'my-c', style: 'margin-top: 4px' },
        });
        const root = wrapper.element as HTMLElement;
        expect(root.classList.contains('my-c')).toBe(true);
        expect(root.classList.contains('animal-collapse')).toBe(true);
        expect(root.getAttribute('style')).toContain('margin-top: 4px');
    });

    it('受控用法：父级控制展开（通过重新挂载验证 defaultExpanded 切换）', async () => {
        const Host = defineComponent({
            setup() {
                const open = ref(false);
                return () => [
                    h(
                        'button',
                        {
                            'data-testid': 'ext',
                            onClick: () => (open.value = !open.value),
                        },
                        'toggle',
                    ),
                    h(Collapse, {
                        key: String(open.value),
                        question: 'Q',
                        answer: 'A',
                        defaultExpanded: open.value,
                    }),
                ];
            },
        });
        const wrapper = mount(Host);
        await wrapper.find('[data-testid="ext"]').trigger('click');
        const btn = wrapper.findAll('button').find((b) => b.text().includes('Q'))!;
        expect(btn.attributes('aria-expanded')).toBe('true');
    });

    describe('a11y', () => {
        it('header.aria-controls 与 panel.id 双向关联，panel 通过 region 暴露', () => {
            const wrapper = mount(Collapse, { props: { question: 'Q', answer: 'A' } });
            const btn = wrapper.get('button');
            const panel = wrapper.find('[role="region"]');
            expect(panel.exists()).toBe(true);
            expect(btn.attributes('aria-controls')).toBe(panel.attributes('id'));
            expect(panel.attributes('aria-labelledby')).toBe(btn.attributes('id'));
            expect(panel.attributes('id')).toMatch(/^animal-collapse-/);
        });
    });
});
