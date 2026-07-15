import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, defineComponent, ref } from 'vue';
import Modal from './Modal.vue';

function dispatchKey(key: string, shiftKey = false) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
}

function getDialog(): HTMLElement | null {
    return document.querySelector('.animal-modal');
}

function getMask(): HTMLElement | null {
    return document.querySelector('.animal-modal__mask');
}

describe('Modal', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        document.body.style.overflow = '';
    });

    it('open=false 不渲染', () => {
        mount(Modal, { props: { open: false, typewriter: false }, slots: { default: 'content' } });
        expect(getDialog()).toBeNull();
    });

    it('open=true 通过 portal 渲染到 body 且包含 role="dialog"', () => {
        mount(Modal, {
            props: { open: true, title: '标题', typewriter: false },
            slots: { default: () => h('p', { 'data-testid': 'body' }, 'body content') },
        });
        const dialog = getDialog();
        expect(dialog).not.toBeNull();
        expect(dialog!.getAttribute('role')).toBe('dialog');
        expect(dialog!.getAttribute('aria-modal')).toBe('true');
        expect(document.querySelector('[data-testid="body"]')).not.toBeNull();
        expect(document.querySelector('.animal-modal__title')!.textContent).toContain('标题');
    });

    it('点击遮罩触发 close（默认 maskClosable）', async () => {
        const wrapper = mount(Modal, {
            props: { open: true, typewriter: false },
            slots: { default: 'content' },
        });
        await nextTick();
        const mask = getMask();
        mask!.click();
        await nextTick();
        expect(wrapper.emitted('close')).toHaveLength(1);
        expect(wrapper.emitted('update:open')).toBeTruthy();
        expect(wrapper.emitted('update:open')![0]).toEqual([false]);
    });

    it('maskClosable=false 时点击遮罩不触发 close', async () => {
        const wrapper = mount(Modal, {
            props: { open: true, maskClosable: false, typewriter: false },
            slots: { default: 'content' },
        });
        await nextTick();
        const mask = getMask();
        mask!.click();
        await nextTick();
        expect(wrapper.emitted('close')).toBeUndefined();
    });

    it('点击对话框内容不冒泡触发 close', async () => {
        const wrapper = mount(Modal, {
            props: { open: true, typewriter: false },
            slots: { default: () => h('p', { class: 'inside-text' }, 'inside') },
        });
        await nextTick();
        const inside = document.querySelector('.inside-text') as HTMLElement;
        inside.click();
        await nextTick();
        expect(wrapper.emitted('close')).toBeUndefined();
    });

    it('Esc 触发 close', async () => {
        const wrapper = mount(Modal, {
            props: { open: true, typewriter: false },
            slots: { default: 'content' },
        });
        await nextTick();
        dispatchKey('Escape');
        await nextTick();
        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('默认 footer 渲染取消/确定，回调正确', async () => {
        const wrapper = mount(Modal, {
            props: { open: true, typewriter: false },
            slots: { default: 'body' },
        });
        await nextTick();
        const buttons = document.querySelectorAll<HTMLElement>('.animal-modal__footer button');
        expect(buttons.length).toBe(2);
        expect(buttons[0].textContent).toContain('取消');
        expect(buttons[1].textContent).toContain('确定');
        buttons[0].click();
        await nextTick();
        expect(wrapper.emitted('close')).toHaveLength(1);
        buttons[1].click();
        await nextTick();
        expect(wrapper.emitted('ok')).toHaveLength(1);
    });

    it('showFooter=false 不渲染默认按钮', () => {
        mount(Modal, {
            props: { open: true, showFooter: false, typewriter: false },
            slots: { default: 'body' },
        });
        expect(document.querySelector('.animal-modal__footer')).toBeNull();
    });

    it('width 应用到 dialog 节点', () => {
        mount(Modal, {
            props: { open: true, width: 400, typewriter: false },
            slots: { default: 'body' },
        });
        const dialog = getDialog();
        expect(dialog!.style.width).toBe('400px');
    });

    describe('a11y', () => {
        it('aria-labelledby / aria-describedby 关联 title 与 body', () => {
            mount(Modal, {
                props: { open: true, title: '嗨标题', typewriter: false },
                slots: { default: () => h('p', null, '嗨内容') },
            });
            const dialog = getDialog()!;
            const labelledBy = dialog.getAttribute('aria-labelledby');
            const describedBy = dialog.getAttribute('aria-describedby');
            expect(labelledBy).toBeTruthy();
            expect(describedBy).toBeTruthy();
            expect(document.getElementById(labelledBy!)!.textContent).toContain('嗨标题');
            expect(document.getElementById(describedBy!)!.textContent).toContain('嗨内容');
        });

        it('无 title 时 aria-labelledby 缺省', () => {
            mount(Modal, {
                props: { open: true, typewriter: false },
                slots: { default: 'body' },
            });
            expect(getDialog()!.getAttribute('aria-labelledby')).toBeNull();
        });

        it('打开时焦点送进对话框（落到第一个可聚焦元素）', async () => {
            const Host = defineComponent({
                setup() {
                    const open = ref(false);
                    return () =>
                        h('div', [
                            h(
                                'button',
                                { 'data-testid': 'trigger', onClick: () => (open.value = true) },
                                'open',
                            ),
                            h(
                                Modal,
                                {
                                    open: open.value,
                                    'onUpdate:open': (v: boolean) => (open.value = v),
                                    typewriter: false,
                                },
                                () => h('button', { 'data-testid': 'inside' }, 'inside'),
                            ),
                        ]);
                },
            });
            const wrapper = mount(Host);
            const trigger = wrapper.find('[data-testid="trigger"]') as any;
            trigger.element.click();
            await nextTick();
            await nextTick();
            const inside = document.querySelector('[data-testid="inside"]') as HTMLElement;
            expect(document.activeElement).toBe(inside);
            wrapper.unmount();
        });

        it('关闭时焦点归还触发元素', async () => {
            const Host = defineComponent({
                setup() {
                    const open = ref(false);
                    return () =>
                        h('div', [
                            h(
                                'button',
                                { 'data-testid': 'trigger', onClick: () => (open.value = true) },
                                'open',
                            ),
                            h(
                                Modal,
                                {
                                    open: open.value,
                                    'onUpdate:open': (v: boolean) => (open.value = v),
                                    typewriter: false,
                                },
                                () => h('button', { 'data-testid': 'inside' }, 'inside'),
                            ),
                        ]);
                },
            });
            const wrapper = mount(Host, { attachTo: document.body });
            const trigger = wrapper.find('[data-testid="trigger"]') as any;
            trigger.element.focus();
            trigger.element.click();
            await nextTick();
            await nextTick();
            expect(document.activeElement).toBe(document.querySelector('[data-testid="inside"]'));
            dispatchKey('Escape');
            await nextTick();
            await nextTick();
            expect(document.activeElement).toBe(trigger.element);
            wrapper.unmount();
        });

        it('Tab 焦点陷阱：末尾元素 Tab 回到第一个', async () => {
            const wrapper = mount(Modal, {
                props: { open: true, showFooter: false, typewriter: false },
                slots: {
                    default: () => [
                        h('button', { 'data-testid': 'b1' }, 'b1'),
                        h('button', { 'data-testid': 'b2' }, 'b2'),
                    ],
                },
            });
            await nextTick();
            await nextTick();
            const b1 = document.querySelector('[data-testid="b1"]') as HTMLElement;
            const b2 = document.querySelector('[data-testid="b2"]') as HTMLElement;
            expect(document.activeElement).toBe(b1);
            // jsdom 不实现原生 Tab 焦点移动，手动聚焦末尾元素模拟自然 Tab 到达末尾
            b2.focus();
            dispatchKey('Tab');
            await nextTick();
            // 末尾再 Tab 应陷阱回首项
            expect(document.activeElement).toBe(b1);
            wrapper.unmount();
        });

        it('Shift+Tab 焦点陷阱：首项 Shift+Tab 回到末尾', async () => {
            const wrapper = mount(Modal, {
                props: { open: true, showFooter: false, typewriter: false },
                slots: {
                    default: () => [
                        h('button', { 'data-testid': 'b1' }, 'b1'),
                        h('button', { 'data-testid': 'b2' }, 'b2'),
                    ],
                },
            });
            await nextTick();
            await nextTick();
            const b2 = document.querySelector('[data-testid="b2"]') as HTMLElement;
            expect(document.activeElement).toBe(
                document.querySelector('[data-testid="b1"]'),
            );
            dispatchKey('Tab', true);
            await nextTick();
            expect(document.activeElement).toBe(b2);
            wrapper.unmount();
        });
    });
});
