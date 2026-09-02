import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import Pagination from './Pagination.vue';

const getByText = (wrapper: ReturnType<typeof mount>, text: string) =>
    wrapper.findAll('button').find((b) => b.text() === text);

describe('Pagination', () => {
    it('渲染页码序列与导航语义', () => {
        const wrapper = mount(Pagination, { props: { total: 50, pageSize: 10 } });
        const nav = wrapper.find('nav[aria-label="分页"]');
        expect(nav.exists()).toBe(true);
        [1, 2, 3, 4, 5].forEach((p) => {
            expect(getByText(wrapper, String(p))).toBeTruthy();
        });
    });

    it('当前页高亮并标记 aria-current', () => {
        const wrapper = mount(Pagination, { props: { total: 50, pageSize: 10, defaultCurrent: 2 } });
        const active = getByText(wrapper, '2')!;
        expect(active.classes()).toContain('animal-pagination__item--active');
        expect(active.attributes('aria-current')).toBe('page');
    });

    it('variant 默认 orange，teal 可切换配色类', () => {
        const wrapper = mount(Pagination, { props: { total: 50, pageSize: 10 } });
        expect(wrapper.find('nav').classes()).toContain('animal-pagination--orange');
        expect(wrapper.find('nav').classes()).not.toContain('animal-pagination--teal');

        const teal = mount(Pagination, { props: { total: 50, pageSize: 10, variant: 'teal' } });
        expect(teal.find('nav').classes()).toContain('animal-pagination--teal');
    });

    it('页数超过 7 页时两端显示省略号', () => {
        const wrapper = mount(Pagination, { props: { total: 100, pageSize: 10, defaultCurrent: 5 } });
        // 第 5 / 10 页：左右各一个省略号
        expect(wrapper.findAll('.animal-pagination__ellipsis')).toHaveLength(2);
        // 首尾页始终可见
        expect(getByText(wrapper, '1')).toBeTruthy();
        expect(getByText(wrapper, '10')).toBeTruthy();
    });

    it('点击页码触发 change', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Pagination, {
            props: { total: 50, pageSize: 10, defaultCurrent: 1, onChange },
        });
        await getByText(wrapper, '3')!.trigger('click');
        expect(onChange).toHaveBeenCalledWith(3, 10);
    });

    it('点击页码触发 update:current（v-model）并切换高亮', async () => {
        const wrapper = mount(Pagination, { props: { total: 50, pageSize: 10, defaultCurrent: 1 } });
        await getByText(wrapper, '3')!.trigger('click');
        const updates = wrapper.emitted('update:current');
        expect(updates).toBeTruthy();
        expect(updates![0][0]).toBe(3);
        expect(getByText(wrapper, '3')!.classes()).toContain('animal-pagination__item--active');
    });

    it('首页禁用上一页，末页禁用下一页', () => {
        const first = mount(Pagination, { props: { total: 50, pageSize: 10, defaultCurrent: 1 } });
        expect(first.find('button[aria-label="上一页"]').attributes('disabled')).toBeDefined();
        expect(first.find('button[aria-label="下一页"]').attributes('disabled')).toBeUndefined();

        const last = mount(Pagination, { props: { total: 50, pageSize: 10, defaultCurrent: 5 } });
        expect(last.find('button[aria-label="上一页"]').attributes('disabled')).toBeUndefined();
        expect(last.find('button[aria-label="下一页"]').attributes('disabled')).toBeDefined();
    });

    it('showTotal 显示总条数', () => {
        const wrapper = mount(Pagination, { props: { total: 123, pageSize: 10, showTotal: true } });
        expect(wrapper.find('.animal-pagination__total').text()).toBe('共 123 条');
    });

    it('受控模式：外部 current 不变时点击不跳页', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Pagination, {
            props: { total: 50, pageSize: 10, current: 1, onChange },
        });
        await getByText(wrapper, '2')!.trigger('click');
        expect(onChange).toHaveBeenCalledWith(2, 10);
        // 受控：未更新 current 时高亮仍在第 1 页
        expect(getByText(wrapper, '1')!.attributes('aria-current')).toBe('page');
        await wrapper.setProps({ current: 2 });
        expect(getByText(wrapper, '2')!.attributes('aria-current')).toBe('page');
    });

    it('showSizeChanger 切换每页条数并回调 showSizeChange', async () => {
        const onShowSizeChange = vi.fn();
        const onChange = vi.fn();
        const wrapper = mount(Pagination, {
            props: {
                total: 100,
                pageSize: 10,
                current: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                onShowSizeChange,
                onChange,
            },
        });
        await wrapper.find('button[aria-label="每页 10 条"]').trigger('click');
        const option = wrapper.findAll('.animal-pagination__size-option').find((o) => o.text() === '20 条/页')!;
        await option.trigger('click');
        // 100 条 / 20 条 = 5 页，原第 10 页收敛到第 5 页
        expect(onShowSizeChange).toHaveBeenCalledWith(5, 20);
        expect(onChange).toHaveBeenCalledWith(5, 20);
        const sizeUpdates = wrapper.emitted('update:pageSize');
        expect(sizeUpdates).toBeTruthy();
        expect(sizeUpdates![0][0]).toBe(20);
        // 选择后列表关闭
        expect(wrapper.find('.animal-pagination__size-list').exists()).toBe(false);
    });

    it('size changer 点击外部 / Escape 关闭', async () => {
        const wrapper = mount(Pagination, {
            props: { total: 100, pageSize: 10, showSizeChanger: true },
            attachTo: document.body,
        });
        const trigger = wrapper.find('button[aria-label="每页 10 条"]');
        await trigger.trigger('click');
        expect(wrapper.find('.animal-pagination__size-list').exists()).toBe(true);
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await nextTick();
        expect(wrapper.find('.animal-pagination__size-list').exists()).toBe(false);

        await trigger.trigger('click');
        await trigger.trigger('keydown', { key: 'Escape' });
        expect(wrapper.find('.animal-pagination__size-list').exists()).toBe(false);
        wrapper.unmount();
    });

    it('showQuickJumper 输入页码回车跳页，超界收敛', async () => {
        const onChange = vi.fn();
        const wrapper = mount(Pagination, {
            props: { total: 100, pageSize: 10, defaultCurrent: 1, showQuickJumper: true, onChange },
        });
        const input = wrapper.find('input[aria-label="跳转到指定页"]');
        await input.setValue('99');
        await input.trigger('keydown', { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith(10, 10);
        expect((input.element as HTMLInputElement).value).toBe('');
    });

    it('快速跳转输入过滤非数字字符', async () => {
        const wrapper = mount(Pagination, {
            props: { total: 100, pageSize: 10, showQuickJumper: true },
        });
        const input = wrapper.find('input[aria-label="跳转到指定页"]');
        await input.setValue('a3b');
        expect((input.element as HTMLInputElement).value).toBe('3');
    });

    it('disabled 禁用全部交互', () => {
        const wrapper = mount(Pagination, {
            props: { total: 50, pageSize: 10, defaultCurrent: 2, disabled: true },
        });
        expect(wrapper.find('button[aria-label="上一页"]').attributes('disabled')).toBeDefined();
        expect(wrapper.find('button[aria-label="下一页"]').attributes('disabled')).toBeDefined();
        expect(getByText(wrapper, '3')!.attributes('disabled')).toBeDefined();
        expect(wrapper.find('nav').classes()).toContain('animal-pagination--disabled');
    });

    it('v-model:current 与 v-model:pageSize 双向绑定', async () => {
        const Host = defineComponent({
            setup() {
                const page = ref(1);
                const size = ref(10);
                return () =>
                    h(Pagination, {
                        total: 50,
                        current: page.value,
                        pageSize: size.value,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20],
                        'onUpdate:current': (p: number) => {
                            page.value = p;
                        },
                        'onUpdate:pageSize': (s: number) => {
                            size.value = s;
                        },
                    });
            },
        });
        const wrapper = mount(Host);
        const pagination = wrapper.findComponent(Pagination);
        await pagination.findAll('button').find((b) => b.text() === '5')!.trigger('click');
        expect(wrapper.findComponent(Pagination).vm.$props).toMatchObject({ current: 5 });

        await wrapper.find('button[aria-label="每页 10 条"]').trigger('click');
        const option = wrapper.findAll('.animal-pagination__size-option').find((o) => o.text() === '20 条/页')!;
        await option.trigger('click');
        // pageSize 同步为 20，50 / 20 = 3 页，原第 5 页收敛到第 3 页
        expect(wrapper.findComponent(Pagination).vm.$props).toMatchObject({ pageSize: 20, current: 3 });
    });
});
