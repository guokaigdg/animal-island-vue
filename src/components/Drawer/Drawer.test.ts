import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, defineComponent, ref } from 'vue';
import Drawer from './Drawer.vue';

function dispatchKey(key: string, shiftKey = false) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
}

const wait = (ms = 0) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function getDialog(): HTMLElement | null {
    return document.querySelector('.animal-drawer__panel');
}

function getMask(): HTMLElement | null {
    return document.querySelector('.animal-drawer__mask');
}

/** 等待 requestAnimationFrame 回调执行 */
function waitForRaf(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

describe('Drawer', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        document.body.style.overflow = '';
    });

    it('open=false 时 dialog 标记 aria-hidden=true', () => {
        mount(Drawer, { props: { open: false }, slots: { default: 'content' } });
        const dialog = getDialog();
        expect(dialog).not.toBeNull();
        expect(dialog!.getAttribute('aria-hidden')).toBe('true');
    });

    it('open=true 通过 portal 渲染到 body 且包含 role="dialog" + aria-modal', () => {
        mount(Drawer, {
            props: { open: true, title: '标题' },
            slots: { default: () => h('p', { 'data-testid': 'body' }, 'body content') },
        });
        const dialog = getDialog();
        expect(dialog).not.toBeNull();
        expect(dialog!.getAttribute('role')).toBe('dialog');
        expect(dialog!.getAttribute('aria-modal')).toBe('true');
        expect(dialog!.querySelector('[data-testid="body"]')).not.toBeNull();
        expect(dialog!.querySelector('.animal-drawer__title')!.textContent).toBe('标题');
    });

    it('点击遮罩触发 close（默认 maskClosable）', async () => {
        const wrapper = mount(Drawer, {
            props: { open: true },
            slots: { default: 'content' },
        });
        await nextTick();
        getMask()!.click();
        await nextTick();
        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('maskClosable=false 时点击遮罩不触发 close', async () => {
        const wrapper = mount(Drawer, {
            props: { open: true, maskClosable: false },
            slots: { default: 'content' },
        });
        await nextTick();
        getMask()!.click();
        await nextTick();
        expect(wrapper.emitted('close')).toBeUndefined();
    });

    it('点击抽屉内容不冒泡触发 close', async () => {
        const wrapper = mount(Drawer, {
            props: { open: true },
            slots: { default: () => h('p', { class: 'inside-text' }, 'inside') },
        });
        await nextTick();
        const inside = document.querySelector('.inside-text') as HTMLElement;
        inside.click();
        await nextTick();
        expect(wrapper.emitted('close')).toBeUndefined();
    });

    it('Esc 触发 close', async () => {
        const wrapper = mount(Drawer, {
            props: { open: true },
            slots: { default: 'content' },
        });
        await nextTick();
        dispatchKey('Escape');
        await nextTick();
        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('placement 应用对应方向类名', async () => {
        const wrapper = mount(Drawer, {
            props: { open: true, placement: 'left' },
            slots: { default: 'x' },
        });
        expect(getDialog()!.classList.contains('animal-drawer__panel--left')).toBe(true);

        await wrapper.setProps({ placement: 'top' });
        expect(getDialog()!.classList.contains('animal-drawer__panel--top')).toBe(true);

        await wrapper.setProps({ placement: 'bottom' });
        expect(getDialog()!.classList.contains('animal-drawer__panel--bottom')).toBe(true);
    });

    it('width 应用到面板（right placement）', () => {
        mount(Drawer, {
            props: { open: true, width: 400 },
            slots: { default: 'body' },
        });
        expect(getDialog()!.style.width).toBe('400px');
    });

    it('height 应用到面板（bottom placement）', () => {
        mount(Drawer, {
            props: { open: true, placement: 'bottom', height: 250 },
            slots: { default: 'body' },
        });
        expect(getDialog()!.style.height).toBe('250px');
    });

    it('默认 pushBackground 下沉 body 非固定子元素', async () => {
        const content = document.createElement('div');
        content.textContent = 'page content';
        document.body.appendChild(content);
        mount(Drawer, {
            props: { open: true },
            slots: { default: () => h('p', null, 'drawer') },
        });
        await waitForRaf();
        expect(content.style.transform).toBe('scale(0.94)');
        expect(content.style.filter).toBe('blur(1px)');
        expect(content.style.borderRadius).toBe('14px');
        expect(content.style.overflow).toBe('hidden');
        // portal 包裹器自身不能被下沉
        const portalWrapper = document.querySelector('[data-animal-drawer-portal]') as HTMLElement;
        expect(portalWrapper).toBeTruthy();
        expect(portalWrapper.style.transform).toBe('');
    });

    it('pushBackground=false 不下沉背景', () => {
        const content = document.createElement('div');
        content.textContent = 'page content';
        document.body.appendChild(content);
        mount(Drawer, {
            props: { open: true, pushBackground: false },
            slots: { default: () => h('p', null, 'drawer') },
        });
        expect(content.style.transform).toBe('');
    });

    it('关闭后恢复背景元素原始样式', async () => {
        const content = document.createElement('div');
        content.textContent = 'page content';
        document.body.appendChild(content);
        const wrapper = mount(Drawer, {
            props: { open: true },
            slots: { default: () => h('p', null, 'drawer') },
        });
        await waitForRaf();
        expect(content.style.transform).toBe('scale(0.94)');
        await wrapper.setProps({ open: false });
        await nextTick();
        await waitForRaf();
        expect(content.style.transform).toBe('');
        expect(content.style.filter).toBe('');
        expect(content.style.borderRadius).toBe('');
        expect(content.style.overflow).toBe('');
    });

    it('footer 传入时渲染', () => {
        mount(Drawer, {
            props: { open: true, footer: 'ok' },
            slots: { default: 'body' },
        });
        expect(getDialog()!.querySelector('.animal-drawer__footer')).not.toBeNull();
        expect(getDialog()!.querySelector('.animal-drawer__footer')!.textContent).toContain('ok');
    });

    it('默认不渲染 footer', () => {
        mount(Drawer, {
            props: { open: true },
            slots: { default: 'body' },
        });
        expect(getDialog()!.querySelector('.animal-drawer__footer')).toBeNull();
    });

    describe('a11y', () => {
        it('aria-labelledby 关联 title', () => {
            mount(Drawer, {
                props: { open: true, title: '嗨标题' },
                slots: { default: () => h('p', null, '嗨内容') },
            });
            const dialog = getDialog()!;
            const labelledBy = dialog.getAttribute('aria-labelledby');
            expect(labelledBy).toBeTruthy();
            expect(document.getElementById(labelledBy!)!.textContent).toContain('嗨标题');
        });

        it('无 title 时 aria-labelledby 缺省', () => {
            mount(Drawer, {
                props: { open: true },
                slots: { default: 'body' },
            });
            expect(getDialog()!.getAttribute('aria-labelledby')).toBeNull();
        });

        it('关闭按钮 aria-label="关闭" 且触发 close', async () => {
            const wrapper = mount(Drawer, {
                props: { open: true, title: 't' },
                slots: { default: 'body' },
            });
            await nextTick();
            const closeBtn = document.querySelector('.animal-drawer__close') as HTMLElement;
            expect(closeBtn).not.toBeNull();
            expect(closeBtn.getAttribute('aria-label')).toBe('关闭');
            closeBtn.click();
            await nextTick();
            expect(wrapper.emitted('close')).toHaveLength(1);
        });

        it('打开时焦点送进抽屉（落到第一个可聚焦元素）', async () => {
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
                                Drawer,
                                {
                                    open: open.value,
                                    'onClose': () => (open.value = false),
                                },
                                () => h('button', { 'data-testid': 'inside' }, 'inside'),
                            ),
                        ]);
                },
            });
            const wrapper = mount(Host, { attachTo: document.body });
            const trigger = wrapper.find('[data-testid="trigger"]') as any;
            trigger.element.click();
            // Drawer 使用 setTimeout(0) 聚焦，需要等待两个宏任务
            await wait(10);
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
                                Drawer,
                                {
                                    open: open.value,
                                    'onClose': () => (open.value = false),
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
            await wait(10);
            await nextTick();
            expect(document.activeElement).toBe(document.querySelector('[data-testid="inside"]'));
            dispatchKey('Escape');
            await wait(10);
            await nextTick();
            expect(document.activeElement).toBe(trigger.element);
            wrapper.unmount();
        });

        it('Tab 焦点陷阱：末尾元素 Tab 回到第一个', async () => {
            const wrapper = mount(Drawer, {
                props: { open: true, title: 't' },
                slots: {
                    default: () => [
                        h('button', { 'data-testid': 'b1' }, 'b1'),
                        h('button', { 'data-testid': 'b2' }, 'b2'),
                    ],
                },
            });
            await wait(10);
            await nextTick();
            const closeBtn = document.querySelector('.animal-drawer__close') as HTMLElement;
            const b2 = document.querySelector('[data-testid="b2"]') as HTMLElement;
            // 关闭按钮是第一个可聚焦元素
            expect(document.activeElement).toBe(closeBtn);
            // jsdom 不实现原生 Tab 焦点移动，手动聚焦末尾元素模拟自然 Tab 到达末尾
            b2.focus();
            dispatchKey('Tab');
            await nextTick();
            // 末尾再 Tab 应陷阱回首项（关闭按钮）
            expect(document.activeElement).toBe(closeBtn);
            wrapper.unmount();
        });

        it('Shift+Tab 焦点陷阱：首项 Shift+Tab 回到末尾', async () => {
            const wrapper = mount(Drawer, {
                props: { open: true, title: 't' },
                slots: {
                    default: () => [
                        h('button', { 'data-testid': 'b1' }, 'b1'),
                        h('button', { 'data-testid': 'b2' }, 'b2'),
                    ],
                },
            });
            await wait(10);
            await nextTick();
            const closeBtn = document.querySelector('.animal-drawer__close') as HTMLElement;
            const b2 = document.querySelector('[data-testid="b2"]') as HTMLElement;
            expect(document.activeElement).toBe(closeBtn);
            dispatchKey('Tab', true);
            await nextTick();
            expect(document.activeElement).toBe(b2);
            wrapper.unmount();
        });
    });
});
