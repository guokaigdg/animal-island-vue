import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import NotificationContainer from './NotificationContainer.vue';
import { Notification } from './Notification';

const { describe: describeSerial } = await import('vitest');
const { serial } = describeSerial as unknown as { serial: typeof describe };

const wait = (ms = 0) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const getContainer = (): HTMLElement | null =>
    document.querySelector('.animal-notification-root');

/** 等待文案出现 */
async function waitForText(text: string, timeout = 2000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const titles = Array.from(document.querySelectorAll('.animal-notification__title'));
        if (titles.some((el) => el.textContent === text)) return;
        await wait(50);
    }
    throw new Error(`"${text}" did not appear within ${timeout}ms`);
}

/** 等待文案消失 */
async function waitForGone(text: string, timeout = 5000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const titles = Array.from(document.querySelectorAll('.animal-notification__title'));
        if (!titles.some((el) => el.textContent === text)) return;
        await wait(50);
    }
    throw new Error(`"${text}" did not disappear within ${timeout}ms`);
}

function queryByText(text: string): HTMLElement | null {
    const titles = Array.from(document.querySelectorAll<HTMLElement>('.animal-notification__title'));
    return titles.find((el) => el.textContent === text) ?? null;
}

describe('Notification', () => {
    let container: ReturnType<typeof mount>;

    beforeEach(() => {
        Notification.destroy();
        container = mount(NotificationContainer, { attachTo: document.body });
    });

    afterEach(() => {
        Notification.destroy();
        container?.unmount();
        document.body.innerHTML = '';
    });

    describe('静态方法挂载与渲染', () => {
        it('首次 open 后在 body 创建通知根容器', async () => {
            expect(getContainer()).not.toBeNull();
            Notification.info('hello');
            await nextTick();
            await waitForText('hello');
        });

        it('字符串简写会作为 message 渲染', async () => {
            Notification.success('简写消息');
            await nextTick();
            await waitForText('简写消息');
        });

        it('对象 config 渲染 message + description', async () => {
            Notification.info({ message: '标题', description: '详细描述内容' });
            await nextTick();
            await waitForText('标题');
            expect(
                Array.from(document.querySelectorAll('.animal-notification__description')).some(
                    (el) => el.textContent === '详细描述内容',
                ),
            ).toBe(true);
        });

        it('不同 type 应用对应 class', async () => {
            Notification.success('s');
            Notification.error('e');
            Notification.warning('w');
            Notification.info('i');
            await nextTick();
            await waitForText('s');
            const root = getContainer()!;
            const items = root.querySelectorAll('.animal-notification');
            expect(items.length).toBe(4);
            expect(items[0].className).toContain('animal-notification--type-success');
            expect(items[1].className).toContain('animal-notification--type-error');
            expect(items[2].className).toContain('animal-notification--type-warning');
            expect(items[3].className).toContain('animal-notification--type-info');
        });
    });

    describe('位置分组', () => {
        it('position=top 默认时通知挂到 top 组', async () => {
            Notification.info({ message: 'top' });
            await nextTick();
            await waitForText('top');
            const topGroup = document.querySelector('.animal-notification__position--top');
            expect(topGroup).not.toBeNull();
            expect(topGroup!.getAttribute('data-position')).toBe('top');
        });

        it('position=topRight 走 topRight 组', async () => {
            Notification.info({ message: 'right', position: 'topRight' });
            await nextTick();
            await waitForText('right');
            const group = document.querySelector('.animal-notification__position--topRight');
            expect(group).not.toBeNull();
        });

        it('position=bottom 走 bottom 组,placement=bottom', async () => {
            Notification.info({ message: 'b', position: 'bottom' });
            await nextTick();
            await waitForText('b');
            const group = document.querySelector('.animal-notification__position--bottom');
            expect(group).not.toBeNull();
            const card = group!.querySelector('.animal-notification') as HTMLElement;
            expect(card.className).toContain('animal-notification--placement-bottom');
        });
    });

    describe('关闭行为', () => {
        it('点击关闭按钮触发退场后从 DOM 移除', async () => {
            Notification.info({ message: 'close me' });
            await nextTick();
            await waitForText('close me');
            const closeBtn = document.querySelector(
                '.animal-notification__close',
            ) as HTMLElement;
            closeBtn.click();
            await waitForGone('close me');
        });

        it('duration 较短时自动关闭并触发 onClose', async () => {
            const onClose = vi.fn();
            Notification.info({ message: 'auto', duration: 0.5, onClose });
            await nextTick();
            await waitForText('auto');
            await waitForGone('auto');
            expect(onClose).toHaveBeenCalled();
        }, 5000);

        it('destroy() 关闭全部', async () => {
            Notification.info('a');
            Notification.success('b');
            await nextTick();
            await waitForText('a');
            await waitForText('b');
            Notification.destroy();
            await nextTick();
            await waitForGone('a');
            await waitForGone('b');
        });

        it('destroy(key) 只关闭指定 key', async () => {
            Notification.info({ message: 'keep', key: 'k1' });
            Notification.info({ message: 'remove', key: 'k2' });
            await nextTick();
            await waitForText('keep');
            await waitForText('remove');
            Notification.destroy('k2');
            await nextTick();
            await waitForGone('remove');
            expect(queryByText('keep')).not.toBeNull();
        });

        it('destroy() 同步触发被移除项的 onClose', async () => {
            const onCloseA = vi.fn();
            const onCloseB = vi.fn();
            Notification.info({ message: 'a', onClose: onCloseA });
            Notification.success({ message: 'b', onClose: onCloseB });
            await nextTick();
            await waitForText('a');
            await waitForText('b');
            Notification.destroy();
            // destroy() 是同步路径,onClose 应立即触发
            expect(onCloseA).toHaveBeenCalledTimes(1);
            expect(onCloseB).toHaveBeenCalledTimes(1);
        });

        it('destroy(key) 同步触发该项的 onClose,其它 key 不触发', async () => {
            const onCloseK1 = vi.fn();
            const onCloseK2 = vi.fn();
            Notification.info({ message: 'k1 msg', key: 'k1', onClose: onCloseK1 });
            Notification.info({ message: 'k2 msg', key: 'k2', onClose: onCloseK2 });
            await nextTick();
            await waitForText('k1 msg');
            Notification.destroy('k2');
            expect(onCloseK2).toHaveBeenCalledTimes(1);
            expect(onCloseK1).not.toHaveBeenCalled();
        });

        it('upload 场景:destroy 后同 key 后续 open 也不再创建', async () => {
            const uploadKey = 'upload-destroy';
            let dismissed = false;
            const onCloseMock = vi.fn(() => {
                dismissed = true;
            });
            const open = (msg: string) => {
                if (dismissed) return;
                Notification.info({
                    message: msg,
                    key: uploadKey,
                    duration: 0,
                    onClose: onCloseMock,
                });
            };

            open('上传中 0%');
            await nextTick();
            await waitForText('上传中 0%');

            Notification.destroy();
            expect(onCloseMock).toHaveBeenCalledTimes(1);
            expect(dismissed).toBe(true);
            await waitForGone('上传中 0%');

            open('上传中 50%');
            open('上传完成 100%');
            await wait(400);
            expect(queryByText('上传中 50%')).toBeNull();
            expect(queryByText('上传完成 100%')).toBeNull();
        });
    });

    describe('onClick 与可点击态', () => {
        it('配置 onClick 后,通知本体可点击触发回调', async () => {
            const onClick = vi.fn();
            Notification.info({ message: 'click me', onClick });
            await nextTick();
            await waitForText('click me');
            const card = document.querySelector('.animal-notification') as HTMLElement;
            card.click();
            expect(onClick).toHaveBeenCalled();
        });

        it('onClick 设置后获得 role=button 与 tabIndex=0', async () => {
            Notification.info({ message: 'kb', onClick: () => {} });
            await nextTick();
            await waitForText('kb');
            const card = document.querySelector('.animal-notification') as HTMLElement;
            expect(card.getAttribute('role')).toBe('button');
            expect(card.getAttribute('tabindex')).toBe('0');
        });

        it('键盘 Enter 触发 onClick', async () => {
            const onClick = vi.fn();
            Notification.info({ message: 'kb', onClick });
            await nextTick();
            await waitForText('kb');
            const card = document.querySelector('.animal-notification') as HTMLElement;
            card.focus();
            card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            expect(onClick).toHaveBeenCalled();
        });
    });

    describe('key 更新', () => {
        it('同 key 二次 open 走更新分支(仍只 1 条)', async () => {
            Notification.info({ message: 'first', key: 'same' });
            await nextTick();
            await waitForText('first');
            Notification.info({ message: 'second', key: 'same' });
            await nextTick();
            const root = getContainer()!;
            const items = root.querySelectorAll('.animal-notification');
            expect(items.length).toBe(1);
            expect(queryByText('second')).not.toBeNull();
            expect(queryByText('first')).toBeNull();
        });

        it('用户关闭后,同 key 后续 open 不再创建(由调用方 dismissed 闭包控制)', async () => {
            const uploadKey = 'upload-test';
            let dismissed = false;
            const open = (msg: string) => {
                if (dismissed) return;
                Notification.info({
                    message: msg,
                    key: uploadKey,
                    duration: 0,
                    onClose: () => {
                        dismissed = true;
                    },
                });
            };

            open('上传中 0%');
            await nextTick();
            await waitForText('上传中 0%');

            const closeBtn = document.querySelector(
                '.animal-notification__close',
            ) as HTMLElement;
            closeBtn.click();
            await waitForGone('上传中 0%');

            open('上传中 50%');
            open('上传完成 100%');
            await wait(400);
            expect(queryByText('上传中 50%')).toBeNull();
            expect(queryByText('上传完成 100%')).toBeNull();
        });

        it('race: closeIcon onClick 立即置 dismissed,避免退场动画期被同 key 复活', async () => {
            // 等之前的测试退场动画（250ms）彻底结束，避免并行场景下定时器竞争
            await wait(300);
            const uploadKey = 'upload-race';
            let dismissed = false;
            const markDismissed = () => {
                dismissed = true;
            };
            const open = (msg: string) => {
                if (dismissed) return;
                Notification.info({
                    message: msg,
                    key: uploadKey,
                    duration: 0,
                    closeIcon: h('span', { onClick: markDismissed }, '×'),
                    onClose: () => {
                        dismissed = true;
                    },
                });
            };

            open('race-0');
            await nextTick();
            await waitForText('race-0');

            // 点 closeIcon span(在 close button 里)
            const closeBtn = document.querySelector(
                '.animal-notification__close',
            ) as HTMLElement;
            const closeIcon = closeBtn.querySelector('span') as HTMLElement;
            closeIcon.click();

            // 立刻 open 'race-50' / 'race-100'——dismissed 已是 true,直接 return
            open('race-50');
            open('race-100');
            // 同步断言:这俩文案此刻不应在 DOM 里
            expect(queryByText('race-50')).toBeNull();
            expect(queryByText('race-100')).toBeNull();
            // race-0 此刻仍在退场动画中,等退场结束后确认它也消失
            // 退场动画 250ms,waitForGone 兜底(并行场景下定时器可能延迟)
            await waitForGone('race-0');
            expect(queryByText('race-50')).toBeNull();
            expect(queryByText('race-100')).toBeNull();
            // 兜底:主动 destroy 以避免退场定时器在并行测试间竞争
            Notification.destroy();
        });
    });

    describe('btn slot', () => {
        it('配置 btn 后渲染自定义操作按钮', async () => {
            Notification.info({
                message: 'with action',
                btn: h('button', { 'data-testid': 'custom-btn' }, 'Action'),
            });
            await nextTick();
            await waitForText('with action');
            expect(document.querySelector('[data-testid="custom-btn"]')).not.toBeNull();
        });
    });
});
